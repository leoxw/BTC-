
import { GoogleGenAI } from "@google/genai";
import { PriceDataPoint } from "../types";

export const getMarketAnalysis = async (data: PriceDataPoint[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Sample data to keep prompt size manageable
  const sampledData = data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 20)) === 0);
  const dataString = sampledData.map(d => `${d.formattedTime}: $${d.price.toFixed(2)}`).join(', ');

  const isLongTerm = data.length > 500;

  const prompt = `
    Analyze the following ${isLongTerm ? 'long-term historical' : 'recent'} Bitcoin (BTC) price trend data:
    ${dataString}

    Provide a concise, professional market insight (max 3 sentences). 
    ${isLongTerm ? 'Focus on the macro cycles, growth trajectory since inception, and historical resistance levels.' : 'Focus on recent volatility, potential short-term trends, and general market sentiment.'}
    Speak as a senior financial analyst and historian.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Market analysis temporarily unavailable.";
  }
};
