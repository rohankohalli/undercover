import { GoogleGenAI, Type } from '@google/genai';
import { FALLBACK_WORD_PAIRS } from './constants.js';

let genAIClient = null;

function getClient() {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    try {
      genAIClient = new GoogleGenAI({});
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err.message);
    }
  }
  return genAIClient;
}

export async function generateWordPairs(category = 'random', count = 15) {
  const ai = getClient();
  if (ai) {
    try {
      const prompt = `Generate exactly ${count} word pairs for the party game Undercover.
Theme/category: ${category === 'random' ? 'Any general, common knowledge topic' : category}.
Requirements:
1. Each pair must consist of two words that are closely related, highly similar in concept, yet distinct (e.g. "Coffee" vs "Tea", "Guitar" vs "Piano").
2. The "innocent" word is for the majority. The "undercover" word is for the spy.
3. Words should be recognizable, fun, and easy for party players to give short clues about.
4. Do NOT use identical words, synonyms that are exact, or overly obscure terms.`;

      // 4-second timeout promise race
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout (4s)')), 4000)
      );

      const apiPromise = ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                innocent: { type: Type.STRING, description: 'Word for the majority of players' },
                undercover: { type: Type.STRING, description: 'Similar word for the undercover infiltrator' }
              },
              required: ['innocent', 'undercover'],
              propertyOrdering: ['innocent', 'undercover']
            }
          }
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      const rawText = response.text;
      const parsed = JSON.parse(rawText);

      if (Array.isArray(parsed) && parsed.length >= 3) {
        const sanitized = parsed
          .filter(
            p =>
              p &&
              typeof p.innocent === 'string' &&
              typeof p.undercover === 'string' &&
              p.innocent.trim().toLowerCase() !== p.undercover.trim().toLowerCase() &&
              p.innocent.trim().length >= 2 &&
              p.undercover.trim().length >= 2
          )
          .map(p => [p.innocent.trim(), p.undercover.trim()]);

        if (sanitized.length >= 3) {
          console.log(`[Gemini] Generated ${sanitized.length} word pairs for category '${category}'`);
          return sanitized;
        }
      }
    } catch (err) {
      console.warn(`[WordService] Gemini generation skipped/failed (${err.message}). Using curated fallback pairs.`);
    }
  }

  // Fallback to internal curated pairs
  const pool = FALLBACK_WORD_PAIRS[category] || FALLBACK_WORD_PAIRS.random;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled;
}
