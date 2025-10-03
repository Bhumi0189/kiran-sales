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
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
  }
  try {
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }
    // Don't return password
    delete user.password
    // Set cookie for middleware
    const response = NextResponse.json(user)
    response.cookies.set("kiran-sales-user", encodeURIComponent(JSON.stringify(user)), {
      path: "/",
      httpOnly: false, // must be false so client can read/write too
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
