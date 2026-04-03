import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserData } from "./types";

export const callGemini = async (userData: UserData) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured. Please add GEMINI_API_KEY to your env.");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const customRules = userData.hardConstraints.length > 0 ? `HARD CONSTRAINTS:\n- ${userData.hardConstraints.join("\n- ")}` : "";
  const goals = userData.mainGoals.length > 0 ? `GOALS:\n- ${userData.mainGoals.join("\n- ")}` : "";

  const prompt = `You are an expert Indian college timetable planner.
Create a clash-free weekly timetable maximizing productivity and respecting all rules.

USER PROFILE:
${JSON.stringify(userData, null, 2)}

${customRules}
${goals}

INSTRUCTIONS:
1. Ensure sleep commitments and regular classes/commitments are strictly blocked exactly as specified.
2. Allocate ${userData.dailyHours} of study time daily.
3. Map Heavy/complex subjects strictly to the user's peakWindow: ${userData.peakWindow} if possible.
4. Auto-allocate breaks per the chosen break rules (${userData.breaksFreq}, ${userData.breakLength}).
5. Respect their Buffer time: ${userData.bufferTime}.
6. Output ONLY valid JSON with this exact structure:
{
  "title": "My Perfect Semester",
  "days": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
  "timeSlots": ["07:00 AM-08:00 AM", "08:00 AM-09:00 AM", "09:00 AM-10:00 AM", "10:00 AM-11:00 AM", "11:00 AM-12:00 PM", "12:00 PM-01:00 PM", "01:00 PM-02:00 PM", "02:00 PM-03:00 PM", "03:00 PM-04:00 PM", "04:00 PM-05:00 PM", "05:00 PM-06:00 PM", "06:00 PM-07:00 PM", "07:00 PM-08:00 PM", "08:00 PM-09:00 PM", "09:00 PM-10:00 PM", "10:00 PM-11:00 PM"],
  "grid": {
    "Monday": {
      "07:00 AM-08:00 AM": { "subject": "Maths", "type": "Lecture", "color": "#3b82f6", "notes": "From 12 PM - 1 PM" }
    }
  }
}
Do not include \`\`\`json markdown blocks, just raw JSON.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse Gemini output:", error);
    throw new Error("Invalid output format from AI");
  }
};
