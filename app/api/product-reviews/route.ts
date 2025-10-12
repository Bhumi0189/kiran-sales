import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI as string
const dbName = process.env.MONGODB_DB || "kiransales"
let cachedClient: MongoClient | null = null
let cachedDb: any = null
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }
  const client = await MongoClient.connect(uri)
  const db = client.db(dbName)
  cachedClient = client
  cachedDb = db
  return { client, db }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const productIdsParam = searchParams.get("productIds")

  if (!productIdsParam) {
    return NextResponse.json({ error: "Missing productIds" }, { status: 400 })
  }

  const productIds = productIdsParam.split(",").map((id) => id.trim())

  try {
    const { db } = await connectToDatabase()
    const reviews = await db
      .collection("reviews")
      .find({ productId: { $in: productIds } })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(reviews)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
