import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserData } from "./types";
import { z } from "zod";

const TimetableOutputSchema = z.object({
  blocks: z.array(z.object({
    subject: z.string(),
    day: z.enum(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    color: z.string(),
  }))
});

export const callGemini = async (userData: UserData) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured. Please add GEMINI_API_KEY to your env.");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const customRules = userData.hardConstraints?.length > 0 ? `HARD CONSTRAINTS:\n- ${userData.hardConstraints.join("\n- ")}` : "";
  const goals = userData.mainGoals?.length > 0 ? `GOALS:\n- ${userData.mainGoals.join("\n- ")}` : "";

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
6. Respond ONLY with valid JSON. No markdown, no backticks, no commentary. Your output must match this exact schema:
{
  "blocks": [
    {
      "subject": "string",
      "day": "Monday | Tuesday | Wednesday | Thursday | Friday | Saturday | Sunday",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "color": "string (hex)"
    }
  ]
}
Do not include \`\`\`json markdown blocks, just raw JSON.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const rawData = JSON.parse(cleanText);
    
    const parsed = TimetableOutputSchema.safeParse(rawData);
    if (!parsed.success) {
      console.error('Validation Error for AI Generation:', parsed.error);
      throw new Error("Invalid schema from AI");
    }
    
    return parsed.data;
  } catch (error) {
    console.error("Failed to parse Gemini output:", error);
    throw new Error("Invalid output format from AI");
  }
};
