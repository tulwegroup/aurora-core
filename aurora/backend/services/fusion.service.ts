
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export interface FusionInput {
  prior: number;
  likelihoods: number[];
  vetoes: string[];
}

export async function calculatePosterior(input: FusionInput) {
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    As a Geoscientific Bayesian Fusion Engine, calculate the posterior probability of discovery.
    
    Inputs:
    - Prior Probability: ${input.prior}
    - Likelihood Factors: ${input.likelihoods.join(", ")}
    - Active Vetoes: ${input.vetoes.length > 0 ? input.vetoes.join(", ") : "None"}
    
    Rules:
    1. If a critical Veto exists, the posterior is capped at 0.01.
    2. Use Bayesian update formula where posterior ~ prior * product(likelihoods).
    3. Normalize results to a 0-1 range.
    
    Return ONLY a JSON object:
    {
      "posterior": number,
      "confidence_score": number,
      "reasoning": "string summary"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Fusion Error:", error);
    return { posterior: 0, confidence_score: 0, reasoning: "Error in computation" };
  }
}
