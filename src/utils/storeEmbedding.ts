import { getVectorCollection } from "../model_call/vectorService";
import { extractSummaryAndActions } from "../model_call/geminiApi";

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
    const result = await extractSummaryAndActions(query);
    const embedding = result.embedding || [];
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