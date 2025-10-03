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

// POST: Add feedback
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, message, type } = body
    if (!email || !message) {
      return NextResponse.json({ error: "Missing email or message" }, { status: 400 })
    }
    const { db } = await connectToDatabase()
    const feedback = {
      email,
      message,
      type: type || "general",
      createdAt: new Date()
    }
    await db.collection("feedback").insertOne(feedback)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET: List feedback (for admin)
export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const feedbacks = await db.collection("feedback").find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ feedbacks })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
