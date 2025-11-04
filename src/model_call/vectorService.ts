import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function getVectorCollection() {
    try{
        if (!client.topology?.isConnected()) {
            await client.connect();
        }
        return client.db("univest").collection("meetings_vector");
    } catch (error) {
        console.error("Error getting vector collection", error);
        throw error;
    }
}