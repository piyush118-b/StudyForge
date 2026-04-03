import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: "application/json" } });

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
      if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      userId = user.id;
    } else {
      const { data: { user } } = await supabaseAdmin.auth.getUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      userId = user.id;
    }

    // Verify AI Quota
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('plan, status, ai_calls_used, ai_calls_limit')
      .eq('user_id', userId)
      .single();

    if (!sub) return NextResponse.json({ error: 'Subscription not found' }, { status: 403 });

    const isPro = sub.plan !== 'free' && sub.status === 'active';
    if (!isPro && sub.ai_calls_used >= sub.ai_calls_limit) {
      return NextResponse.json({ error: 'AI limit reached. Please upgrade to Pro.' }, { status: 402 });
    }

    const { blocks, customRules } = await req.json();

    const prompt = `You are a scheduling AI. Restructure the following study timetable blocks to be perfectly balanced, avoiding burnout. 

User Custom Request: "${customRules || 'Balance study load, mix difficult/easy subjects.'}"

Here are the current blocks array:
${JSON.stringify(blocks, null, 2)}

Instructions:
1. Don't remove blocks. You can change their startTime, endTime, and dayId to balance the load across col_monday through col_sunday.
2. Maintain standard time intervals (e.g., 08:00, 09:30).
3. Do not touch blocks with isFixed: true.
4. Output a JSON array containing the exact same blocks but with their new dayId, startTime, and endTime. Exact JSON structure:
[
  { "id": "block-id-here", "dayId": "col_monday", "startTime": "09:00", "endTime": "10:00" }
]
Only output the JSON array.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Deduct AI call for Free users
    if (!isPro) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ ai_calls_used: sub.ai_calls_used + 1 })
        .eq('user_id', userId);
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI schedule. Try again.' }, { status: 500 });
    }

    return NextResponse.json({ optimizedBlocks: parsed });
  } catch (error) {
    console.error('[AI Auto-Balance Error]', error);
    return NextResponse.json({ error: 'Failed to auto-balance timetable' }, { status: 500 });
  }
}
