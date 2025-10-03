import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

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

export async function POST(req: Request) {
  const { email, password, firstName, lastName, phone } = await req.json()
  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  try {
    const { db } = await connectToDatabase()
    const existing = await db.collection("users").findOne({ email })
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: "customer",
      createdAt: new Date().toISOString(),
      status: "active",
    }
    await db.collection("users").insertOne(user)
    // Don't return password
    delete user.password
    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
