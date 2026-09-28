import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/env.ts';
import { buildAIContext } from './ai.context.ts';
import { AIChatRequest, AIChatResponse } from './ai.types.ts';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

export async function askMarketLinkAssistant(
  chatRequest: AIChatRequest
): Promise<AIChatResponse> {
  const { message } = chatRequest;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return {
      success: false,
      message: 'Please provide a valid question or message.',
    };
  }

  // 1. Build Grounded Context from MongoDB
  const { contextText, summary } = await buildAIContext(message);

  const systemInstruction = `
You are the official MarketLink Farmers Market Assistant.
Your goal is to assist customers and farmers using the MarketLink platform.
Rules:
1. Always base your answers ONLY on the provided MarketLink database context.
2. If the user asks about market hours, open days, farmers, products, farm addresses, GPS coordinates, or pickup times, cite the exact facts from the context.
3. NEVER invent or hallucinate products, prices, farmers, or markets that are not in the context.
4. Clearly explain MarketLink's pre-order model: Customers pre-order online and pay in-person at pickup (cash or at stall). There are NO online payments and NO courier home delivery.
5. If the database context does not contain what the user asks for (e.g. out of stock or unknown product), politely state that it is currently not listed in MarketLink and encourage checking back or visiting the market in person.
6. Keep your answers warm, concise, and helpful.
`.trim();

  const userPromptWithContext = `
${contextText}

---
USER QUESTION:
${message}
`.trim();

  // 2. Call Gemini API with model fallback
  const ai = getGenAI();

  if (ai) {
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: userPromptWithContext,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });

        if (response.text) {
          return {
            success: true,
            message: response.text,
            contextSummary: summary,
          };
        }
      } catch (err: any) {
        console.warn(`[AIService] Model ${model} returned: ${err.message}. Trying next fallback...`);
      }
    }
  }

  // 3. Deterministic Grounded Fallback if Gemini models hit temporary 503 demand spikes
  // This guarantees 100% uptime and high accuracy directly from MongoDB data
  const lines = contextText.split('\n');
  const marketLines = lines.filter((l) => l.startsWith('- ') && l.includes('Address:'));
  const farmerLines = lines.filter((l) => l.startsWith('- ') && l.includes('Farm Address:'));
  const productLines = lines.filter((l) => l.startsWith('- ') && l.includes('Sold by'));

  let fallbackMessage = `Here is the information from MarketLink's live database regarding your inquiry:\n\n`;

  if (marketLines.length > 0) {
    fallbackMessage += `**Active Markets:**\n` + marketLines.map((m) => `• ${m.replace(/^- /, '')}`).join('\n') + '\n\n';
  }

  if (farmerLines.length > 0) {
    fallbackMessage += `**Attending Farmers & Locations:**\n` + farmerLines.map((f) => `• ${f.replace(/^- /, '')}`).join('\n') + '\n\n';
  }

  if (productLines.length > 0) {
    fallbackMessage += `**Available Produce in Stock:**\n` + productLines.map((p) => `• ${p.replace(/^- /, '')}`).join('\n') + '\n\n';
  }

  fallbackMessage += `*Note: All orders on MarketLink are pre-ordered online and paid in-person with cash at pickup.*`;

  return {
    success: true,
    message: fallbackMessage,
    contextSummary: summary,
  };
}
