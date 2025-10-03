import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
// Simple admin check using a header (replace with JWT/session/cookie in production)
function isAdmin(req: Request) {
  const auth = req.headers.get("authorization")
  // Example: pass 'Bearer admin-token' for admin requests
  return auth === "Bearer admin-token"
}

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
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()
    const result = await db.collection("orders").insertOne(body)
    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()
    const { _id, ...update } = body
    const result = await db.collection("orders").updateOne({ _id: new ObjectId(_id) }, { $set: update })
    return NextResponse.json({ modifiedCount: result.modifiedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const { _id } = await req.json()
    const result = await db.collection("orders").deleteOne({ _id: new ObjectId(_id) })
    return NextResponse.json({ deletedCount: result.deletedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { db } = await connectToDatabase();
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const userId = url.searchParams.get("userId");
    const status = url.searchParams.get("status");
    const limit = parseInt(url.searchParams.get("limit") || "0", 10);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const skip = limit > 0 ? (page - 1) * limit : 0;

    // Admin: return all orders (no pagination for admin for now)
    if (isAdmin(req)) {
      const orders = await db.collection("orders").find({}).toArray();
      return NextResponse.json(orders);
    }

    // User by email
    if (email) {
      const query: any = {
        $or: [
          { "customer.email": email },
          { customerEmail: email }
        ]
      };
      if (status) {
        // Match either status or deliveryStatus
        query.$or = query.$or.map((q: any) => ({
          $and: [q, { $or: [ { status }, { deliveryStatus: status } ] }]
        }));
      }
      const cursor = db.collection("orders").find(query).sort({ orderDate: -1, createdAt: -1 });
      if (limit > 0) cursor.skip(skip).limit(limit);
      const orders = await cursor.toArray();
      let hasMore = false;
      if (limit > 0) {
        const total = await db.collection("orders").countDocuments(query);
        hasMore = page * limit < total;
      }
      return NextResponse.json({ orders, hasMore });
    }

    // User by userId (for ReviewsTab)
    if (userId) {
      const query: any = { $or: [ { userId }, { "customer.id": userId } ] };
      if (status) {
        query.$or = query.$or.map((q: any) => ({
          $and: [q, { $or: [ { status }, { deliveryStatus: status } ] }]
        }));
      }
      const cursor = db.collection("orders").find(query).sort({ orderDate: -1, createdAt: -1 });
      if (limit > 0) cursor.skip(skip).limit(limit);
      const orders = await cursor.toArray();
      return NextResponse.json(orders);
    }

    return NextResponse.json({ error: "Unauthorized or missing email/userId" }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
