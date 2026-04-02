import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType || "image/jpeg",
        },
      },
      {
        text: `You are an expert OCR system specializing in reading handwritten and printed text from photos of timetables, schedules, syllabi, and study notes.

INSTRUCTIONS:
1. Extract ALL text visible in this image as accurately as possible.
2. Preserve the structure — if it's a table or schedule, format it as a clean table using pipes (|) and dashes (-).
3. If you see time intervals and activities/subjects, structure them clearly like:
   Time | Activity/Subject
   ---- | ----------------
   12:00 AM - 4:30 AM | Sleep
4. Reproduce handwritten text exactly as written, including any quotes or notes at the bottom.
5. Do NOT add any commentary, explanation, or markdown code fences. Output ONLY the extracted text.
6. If some text is unclear, make your best guess based on context (e.g. a timetable context).`,
      },
    ]);

    const rawText = result.response.text().trim();

    // Second pass: ask Gemini to convert the extracted text into structured JSON tasks
    const structuredResult = await model.generateContent([
      {
        text: `You are a task parser. Given the following extracted timetable/schedule text, convert it into a JSON array of tasks.

EXTRACTED TEXT:
${rawText}

RULES:
1. Only include actual activities/tasks/subjects — skip headers, separators, decorative quotes, and motivational text.
2. Skip entries like "Sleep", "Nap", "Lunch", "Dinner", "Fresh" — these are NOT study tasks.
3. For each valid task, extract:
   - "title": The activity name (e.g. "Class work", "Revise Previous chapters", "Notes")
   - "subject": Best guess at the academic subject if applicable, otherwise use the activity name
   - "startTime": Start time in 12-hour format with AM/PM (e.g. "7:45 AM")
   - "endTime": End time in 12-hour format with AM/PM (e.g. "10:00 AM")  
   - "priority": "High" if it's study/revision/exam related, "Medium" for classes, "Low" for others
4. Output ONLY a valid JSON array. No markdown, no explanation, no code fences.

Example output:
[
  {"title": "Revise Previous chapters", "subject": "Revision", "startTime": "4:30 AM", "endTime": "7:00 AM", "priority": "High"},
  {"title": "Class work", "subject": "General", "startTime": "7:45 AM", "endTime": "10:00 AM", "priority": "Medium"}
]`,
      },
    ]);

    let tasks = [];
    try {
      const jsonText = structuredResult.response.text().trim()
        .replace(/```json/g, "").replace(/```/g, "").trim();
      tasks = JSON.parse(jsonText);
    } catch {
      // If JSON parsing fails, return raw text only
      tasks = [];
    }

    return NextResponse.json({ text: rawText, tasks });
  } catch (error) {
    console.error("Gemini Vision OCR failed:", error);
    return NextResponse.json(
      { error: "OCR failed. Please try again.", details: String(error) },
      { status: 500 }
    );
  }
}
