import { getVectorCollection } from "../model_call/vectorService";
import dotenv from "dotenv";

dotenv.config();

export async function storeMeetingVector({
  meetingId,
  userId,
  title,
  embedding,
  createdAt
}: {
  meetingId: string;
  userId: string;
  title: string;
  embedding: number[];
  createdAt: Date;
}) {

try{

    const coll = await getVectorCollection();
    
    await coll.insertOne({
        meetingId,
        userId,
        title,
        embedding,
        createdAt
    });
    
    console.log(`✅ Stored vector for meeting: ${meetingId}`);
}catch(error) {
    console.error("Error storing vector", error);
    throw error;
}
}



export async function searchSimilarMeetings(query: string, userId: string, topK = 5) {
    // Generate embedding for the query string only
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const embedding_model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embedding_result = await embedding_model.embedContent(query);
    const embedding = embedding_result.embedding.values || [];
    if (!embedding || embedding.length === 0) {
    //   throw new Error("No embedding found");
      console.error("No embedding found");
      return [];
    }
    const coll = await getVectorCollection();
  
    const results = await coll.aggregate([
      {
        $vectorSearch: {
          queryVector: embedding,
          path: "embedding",
          numCandidates: 100,
          limit: topK,
          index: "embedding_index",
          filter: { userId } // optional filter by user
        }
      },
      {
        $project: {
          meetingId: 1,
          title: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]).toArray();
  
    return results;
  }