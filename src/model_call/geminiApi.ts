import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type ExtractResult = {
  summary: string;
  actionItems: string[];
  embedding?: number[] | null;
};

export async function extractSummaryAndActions(title: string, transcript: string): Promise<ExtractResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `You are an AI meeting assistant.\n\nHere is a meeting title: ${title}\n\nHere is a meeting transcript:\n${transcript}\n\nExtract the following:\n1. A concise summary (3–5 sentences).\n2. A list of action items with responsible persons and deadlines if mentioned.\n\nReturn only valid JSON with this structure:\n{\n  "summary": "string",\n  "actions": [\n    { "task": "string", "owner": "string", "deadline": "string (if mentioned)" }\n  ]\n}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const embedding_model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const embedding_result = await embedding_model.embedContent(text);
  const embedding = embedding_result.embedding.values || [];



  let parsed: { summary?: string; actions?: Array<{ task?: string; owner?: string; deadline?: string }> } = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    // Try to extract JSON substring if model wrapped it in extra text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error("Failed to parse model output as JSON");
    }
  }

  const summary = (parsed.summary || "").toString();
  const actionItems = (parsed.actions || []).map((a) => {
    const task = (a.task || "").toString();
    const owner = (a.owner || "").toString();
    const deadline = (a.deadline || "").toString();
    const ownerPart = owner ? ` - ${owner}` : "";
    const deadlinePart = deadline ? ` (${deadline})` : "";
    return `${task}${ownerPart}${deadlinePart}`.trim();
  }).filter(Boolean);

  return { summary, actionItems, embedding: embedding as number[] };
}
