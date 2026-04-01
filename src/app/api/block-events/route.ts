import { NextRequest, NextResponse } from "next/server";
// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { events } = await req.json();

    if (!Array.isArray(events)) {
      return NextResponse.json({ error: "Events array required" }, { status: 400 });
    }

    // In a fully configured environment we'd use:
    // const supabase = createRouteHandlerClient({ cookies });
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Transform events to match block_events DB schema
    const inserts = events.map((e: any) => ({
      block_id: e.blockId,
      // timetable_id: e.timetableId,
      // user_id: user.id,
      date: e.date,
      day_of_week: e.dayOfWeek,
      subject: e.subject,
      subject_type: e.subjectType,
      scheduled_start: e.scheduledStart,
      scheduled_end: e.scheduledEnd,
      scheduled_hours: e.scheduledHours,
      status: e.status,
      actual_hours: e.actualHours,
      skip_reason: e.skipReason || null,
      completed_at: e.completedAt || null,
      skipped_at: e.skippedAt || null
    }));

    // const { error } = await supabase.from('block_events').insert(inserts);
    // if (error) throw error;

    return NextResponse.json({ success: true, count: inserts.length });
  } catch (err) {
    console.error("Failed to insert block events", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    // const supabase = createRouteHandlerClient({ cookies });
    // let query = supabase.from('block_events').select('*').eq('user_id', userId);
    // if (from) query = query.gte('date', from);
    // if (to) query = query.lte('date', to);
    // const { data, error } = await query;
    const data: any[] = []; // stub

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
