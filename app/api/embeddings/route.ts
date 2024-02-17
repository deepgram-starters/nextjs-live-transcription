import type { NextApiRequest, NextApiResponse } from "next";
import { Pinecone } from "@pinecone-database/pinecone";

// Initialize Pinecone client
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});

// Target your index
const index = pc.index("your_index_name"); // Replace 'your_index_name' with your actual index name

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      // Extract embedding data from request body
      const { id, values, metadata } = req.body;

      // Upsert the embedding data into Pinecone
      await index.namespace("your_namespace").upsert([
        // Replace 'your_namespace' with your actual namespace
        { id, values, metadata },
      ]);

      // Respond with success message
      res.status(200).json({ message: "Embedding saved successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error saving embedding" });
    }
  } else {
    // Handle any non-POST requests
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
