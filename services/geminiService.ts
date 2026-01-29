import { GoogleGenAI } from "@google/genai";

// NOTE: In a production environment, never expose your API key in the frontend.
// However, for this demo "Out-of-the-box" Puter app, we rely on the process.env if available,
// or we prompt the user for one if they want to use AI features.
// For the purpose of this code generation, we will assume the key is available via environment or a placeholder logic.

const getAiClient = () => {
  const apiKey = process.env.API_KEY; 
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateDomainDescription = async (domainName: string, extension: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "Premium virtual domain ready for development. (AI Key missing for auto-description)";
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Write a short, catchy, marketing description (max 20 words) for a premium crypto domain name: "${domainName}${extension}". Make it sound valuable and futuristic.`;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "A premium digital asset.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "A premium digital asset waiting for a visionary owner.";
  }
};

export const checkApiKey = () => {
    return !!process.env.API_KEY;
}