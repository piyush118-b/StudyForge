import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { weeklyStats, recentEvents } = await req.json();

    if (!weeklyStats) {
       return NextResponse.json({ error: "weeklyStats required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found. Returning mock insight.");
      return NextResponse.json({
        insight: "Ready to conquer your week! Keep an eye on your skipped tasks and stay hydrated.",
        suggestions: ["Take consistent breaks", "Review missed notes"],
        pattern: "No patterns detected yet.",
        tomorrowFocus: "Review everything!"
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a highly motivating study coach for an Indian college student.
Based on this study data:
WeeklyStats: ${JSON.stringify(weeklyStats)}
RecentEvents: ${JSON.stringify(recentEvents?.slice(0, 10))}

Provide exactly a single JSON object. Do not wrap in markdown tags like \`\`\`json.
{
  "insight": "A 2-3 sentence encouraging insight paragraph (friendly, student tone).",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "pattern": "One specific pattern detected based on the data.",
  "tomorrowFocus": "Tomorrow's top priority recommendation."
}
Be specific, use their actual subject names, be encouraging but honest. Mention streaks if > 2. Keep suggestions under 15 words.
`;

    const result = await model.generateContent(prompt);
    let output = result.response.text().trim();
    if (output.startsWith("```json")) output = output.replace(/^```json/, "").replace(/```$/, "").trim();

    return new NextResponse(output, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Coach Insight Error:", error);
    return NextResponse.json({
      insight: "Something went wrong creating your insight. Keep going!",
      suggestions: ["Stay focused"],
      pattern: "Unknown",
      tomorrowFocus: "Keep your momentum."
    }, { status: 500 });
  }
}
