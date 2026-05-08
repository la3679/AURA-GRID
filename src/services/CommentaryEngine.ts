import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

const getAI = () => {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
       genAI = new GoogleGenAI({ apiKey: key });
    }
  }
  return genAI;
};

export const getCommentary = async (event: string, p1: any, p2: any) => {
  const ai = getAI();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        System Context: Futuristic Cyber-Board Game "SPLIT".
        Players: ${p1.callsign} (${p1.character}) vs ${p2.callsign} (${p2.character}).
        Event: ${event}
        
        Instruction: 
        - Provide a sharp, punchy, cynical cyber-commentary line (max 15 words).
        - Sound like a glitchy AI overseer.
        - Use cyberpunk terminology.
        - If it is a bump, be mocking.
        - If it is a win, be grand.
      `,
    });

    return response.text?.trim() || null;
  } catch (e) {
    console.error("AI Commentary Fail", e);
    return null;
  }
};
