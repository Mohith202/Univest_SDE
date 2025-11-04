import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function getVectorCollection() {
    try{
        // Check if client is already connected, if not connect
        try {
            await client.db("admin").command({ ping: 1 });
        } catch {
            await client.connect();
        }
        return client.db("univest").collection("meetings_vector");
    } catch (error) {
        console.error("Error getting vector collection", error);
        throw error;
    }
}