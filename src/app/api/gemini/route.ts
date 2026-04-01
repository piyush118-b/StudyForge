import { NextResponse } from "next/server";
import { generateMockTimetable } from "@/lib/mock-data";

export async function POST(req: Request) {
  try {
    const { userData } = await req.json();
    
    // Simulate a 1.5s delay to feel like "AI generation"
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Bypass Mode: Return the pre-constructed Mock JSON directly
    const timetableData = generateMockTimetable(userData);
    
    return NextResponse.json({ timetable: timetableData });
  } catch (error) {
    console.error("Mock generation failed:", error);
    return NextResponse.json(
      { error: "Generation failed", fallback: true },
      { status: 500 }
    );
  }
}
