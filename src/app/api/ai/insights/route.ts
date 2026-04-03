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

    const { weeklyStats } = await req.json();

    const prompt = `You are a study habits analyzer. Look at this student's weekly stats and give exactly ONE sentence (max 15 words) of deep insight or highly specific praise/warning.

Stats:
- Completion Rate: ${weeklyStats.overallCompletionRate}%
- Streak: ${weeklyStats.streakDays}
- Focus Avg: ${weeklyStats.averageFocusRating} / 5
- Total done: ${weeklyStats.totalCompletedBlocks} blocks.

Output the single sentence directly, no quotes.`;

    const result = await model.generateContent(prompt);
    const insight = result.response.text().trim().replace(/^"|"$/g, '');
    
    if (!isPro) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ ai_calls_used: sub.ai_calls_used + 1 })
        .eq('user_id', userId);
    }

    return NextResponse.json({ insight });
  } catch (error) {
    console.error('[AI Insights Error]', error);
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 });
  }
}
