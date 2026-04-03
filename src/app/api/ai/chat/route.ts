import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    let userId: string;

    if (token) {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    } else {
      const { data: { user } } = await supabaseAdmin.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    // Verify AI Quota
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('plan, status, ai_calls_used, ai_calls_limit')
      .eq('user_id', userId)
      .single();

    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 403 });
    }

    const isPro = sub.plan !== 'free' && sub.status === 'active';
    const canUseAI = isPro || sub.ai_calls_limit > sub.ai_calls_used;

    if (!canUseAI) {
      return NextResponse.json(
        { error: 'AI limit reached. Please upgrade to Pro.' },
        { status: 402 }
      );
    }

    const { messages, timetableContext } = await req.json();

    const systemPrompt = `You are a helpful study assistant for Indian college students.
You are helping them organize their timetable. 
Here is their current timetable context:
${JSON.stringify(timetableContext)}

Respond concisely. If they ask you to autobalance, suggest specific shifts in their subjects to match peak productivity windows. 
If they ask for motivation, give them a short hype message.`;

    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Inject system prompt manually since we are using flash and basic messages structure
    formattedMessages.unshift({
      role: 'user',
      parts: [{ text: systemPrompt + '\n\nPlease acknowledge this context and reply to my next message.' }]
    });
    formattedMessages.splice(1, 0, {
      role: 'model',
      parts: [{ text: 'Understood. How can I help you with your timetable today?' }]
    });

    const chat = model.startChat({
      history: formattedMessages.slice(0, -1),
    });

    const lastMessage = formattedMessages[formattedMessages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const responseText = result.response.text();

    // Deduct AI call for Free users
    if (!isPro) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ ai_calls_used: sub.ai_calls_used + 1 })
        .eq('user_id', userId);
    }

    // Optionally save chat message to DB here for history
    const messageId = crypto.randomUUID();
    await supabaseAdmin.from('ai_chat_messages').insert([
      { id: messageId, user_id: userId, timetable_id: timetableContext?.id, role: 'user', content: lastMessage.parts[0].text },
      { user_id: userId, timetable_id: timetableContext?.id, role: 'assistant', content: responseText }
    ]);

    return NextResponse.json({ reply: responseText });
  } catch (error) {
    console.error('[AI Chat Error]', error);
    return NextResponse.json({ error: 'Failed to generate AI response' }, { status: 500 });
  }
}
