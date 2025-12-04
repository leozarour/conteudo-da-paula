import { GoogleGenAI, Type } from "@google/genai";
import { AIParsedData } from "../types";

// Force TypeScript to recognize process even if node types are missing
declare const process: { env: { API_KEY: string } };

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateVideoMetadata = async (title: string, filename: string): Promise<AIParsedData> => {
  try {
    const model = "gemini-2.5-flash";
    
    // Updated prompt for Portuguese and local file context
    const prompt = `
      Estou catalogando um vídeo pessoal na minha biblioteca chamada "Paulinha Hot".
      O título que dei é "${title}" e o nome original do arquivo é "${filename}".
      
      Por favor, gere um resumo curto, picante e divertido (máximo 2 frases) em Português do Brasil sobre o que esse vídeo pode tratar (tente ser criativo baseado no título).
      Além disso, forneça de 3 a 5 categorias curtas (tags) em Português.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Um resumo curto e engajador do conteúdo do vídeo em Português.",
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Uma lista de categorias em Português.",
            },
          },
          required: ["summary", "tags"],
        },
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from Gemini");
    }

    const data = JSON.parse(text) as AIParsedData;
    return data;

  } catch (error) {
    console.error("Error generating metadata:", error);
    // Fallback if AI fails
    return {
      summary: "Sem resumo disponível. Assista para descobrir!",
      tags: ["Geral"],
    };
  }
};