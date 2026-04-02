import { NextResponse } from "next/server";
import { Task } from "@/types/task.types";

export async function POST(req: Request) {
  try {
    const { tasks }: { tasks: Task[] } = await req.json();
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Per Rule 3: Use mock data + cached results unless strictly passing actual AI keys.
    // We will generate a smart heuristic-based response acting like Gemini Insight.

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const highPriority = pendingTasks.filter(t => t.priority === 'High');
    
    const insights = [];

    if (pendingTasks.length === 0) {
      insights.push(
        "🧠 You currently have no pending tasks! Great time to review your past notes or take a well-deserved break.",
        "💡 Consider adding some proactive study goals for the upcoming week to stay ahead of the curve."
      );
    } else {
      if (highPriority.length >= 3) {
         insights.push(
           "🔥 You have " + highPriority.length + " High Priority tasks piled up! Try slicing the largest one into smaller chunks (e.g., read 1 chapter instead of 3).",
           "⚡ To avoid burnout, tackle the hardest high-priority subject first during your peak energy hours."
         );
      } else if (highPriority.length === 0) {
         insights.push(
           "🧘 Your schedule is looking very balanced. Knock out some Medium priority tasks using the Pomodoro timer today.",
           "🔄 Excellent consistency. Keep up the steady pace!"
         );
      } else {
         insights.push(
           `🎯 Focus squarely on "${highPriority[0].title}" today. Once that's out of the way, your backlog will ease up considerably.`,
           "⏱ Use the 25-minute Pomodoro focus block to get through exactly one sub-topic without distractions."
         );
      }
      
      if (pendingTasks.length > 5) {
        insights.push("💡 You have over 5 tasks pending. It might help to reschedule 1 or 2 to later in the week to give yourself breathing room today.");
      }
    }

    return NextResponse.json({ insights });

  } catch (error) {
    console.error("Insights generation failed:", error);
    return NextResponse.json(
      { error: "Generation failed", fallback: true },
      { status: 500 }
    );
  }
}
