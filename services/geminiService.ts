
import { GoogleGenAI } from "@google/genai";

/**
 * Initialize the GoogleGenAI client with the required named parameter and environment variable.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a marketing description for a domain using the Gemini API.
 */
export const generateDomainDescription = async (domainName: string, extension: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Premium virtual domain ready for development. (AI Key missing for auto-description)";
  }

  try {
    // gemini-3-flash-preview is the recommended model for basic text generation tasks.
    const modelName = 'gemini-3-flash-preview';
    const prompt = `Write a short, catchy, marketing description (max 20 words) for a premium crypto domain name: "${domainName}${extension}". Make it sound valuable and futuristic.`;
    
    // Always call generateContent directly on ai.models with both the model and prompt.
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    // Access the extracted text directly via the .text property.
    return response.text || "A premium digital asset.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "A premium digital asset waiting for a visionary owner.";
  }
};

/**
 * Utility to check if the API key is configured.
 */
export const checkApiKey = () => {
    return !!process.env.API_KEY;
}
