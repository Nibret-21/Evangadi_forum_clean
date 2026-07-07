
import { GoogleGenAI } from "@google/genai";
import {
  NotFoundError,
  ServiceUnavailableError,
} from "../../../utils/errors/index.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_TEXT_MODEL =
  process.env.GEMINI_TEXT_MODEL || "gemini-2.0-flash-lite";

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

/**
 * Safely extract readable error message from Gemini/SDK errors
 */
const getGeminiErrorMessage = (error) => {
  // Case 1: already structured error object
  if (error?.error?.message) {
    return error.error.message;
  }

  // Case 2: message contains JSON string
  if (typeof error?.message === "string") {
    try {
      const jsonStart = error.message.indexOf("{");

      if (jsonStart !== -1) {
        const parsed = JSON.parse(error.message.slice(jsonStart));
        return parsed?.error?.message || error.message;
      }
    } catch {
      return error.message;
    }
  }

  return "AI service is temporarily unavailable.";
};

const extractJson = (text) => {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) return null;

    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
};

export const generateQuestionDraftCoachService = async ({
  title = "",
  content,
}) => {
  const prompt = `
You are a programming forum question coach.

Return ONLY valid JSON.

Title:
${title}

Content:
${content}

Format:
{
  "tips": ["tip1", "tip2", "tip3"]
}

Rules:
- 3 to 5 tips
- No markdown
`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
    });

    const text = response.text;
    const parsed = extractJson(text);

    if (!parsed || !Array.isArray(parsed.tips)) {
      return {
        tips: [
          "Add the exact error message.",
          "Include your code snippet.",
          "Explain expected vs actual result.",
        ],
      };
    }

    return { tips: parsed.tips };
  } catch (error) {
   
    const message = getGeminiErrorMessage(error);

    throw new ServiceUnavailableError(message);
  }
};

export const assessAnswerAgainstQuestionService = async ({
  questionHash,
  answerText,
}) => {
  try {
    const questionSql = `
      SELECT title, content
      FROM questions
      WHERE question_hash = ?
    `;

    const result = await safeExecute(questionSql, [questionHash]);
    const rows = Array.isArray(result) ? result[0] : result;

    if (!rows.length) {
      throw new NotFoundError("Question not found");
    }

    const question = rows[0];

    const prompt = `
You are evaluating an answer.

Question:
${question.title}

${question.content}

Answer:
${answerText}

Return JSON:
{
  "level": "strong",
  "note": "short explanation"
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
    });

    const text = response.text;
    const parsed = extractJson(text);

    if (!parsed || !["strong", "partial", "weak"].includes(parsed.level)) {
      return {
        level: "partial",
        note: "Could not reliably parse AI response.",
      };
    }

    return parsed;
  } catch (error) {
    const message = getGeminiErrorMessage(error);
    throw new ServiceUnavailableError(message);
  }
};