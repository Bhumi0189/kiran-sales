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
  const email = searchParams.get("email")
  const limit = parseInt(searchParams.get("limit") || "0", 10)
  const page = parseInt(searchParams.get("page") || "1", 10)
  const skip = limit > 0 ? (page - 1) * limit : 0
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 })
  }
  try {
    const { db } = await connectToDatabase()
    // Case-insensitive email match
    const wishlist = await db.collection("wishlists").findOne({ email: { $regex: `^${email}$`, $options: "i" } })
    const items = wishlist?.items || []
    let pagedItems = items
    let hasMore = false
    if (limit > 0) {
      pagedItems = items.slice(skip, skip + limit)
      hasMore = page * limit < items.length
    }
    return NextResponse.json({ items: pagedItems, hasMore })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Add or remove a product from the user's wishlist
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, product, action } = body;
    if (!email || !product || !product.id) {
      return NextResponse.json({ error: "Missing email or product info" }, { status: 400 });
    }
    const { db } = await connectToDatabase();
    const wishlistCol = db.collection("wishlists");
  // Case-insensitive email match
  const wishlist = await wishlistCol.findOne({ email: { $regex: `^${email}$`, $options: "i" } });
    let updatedItems = [];
    if (action === "remove") {
      // Remove product from wishlist
      updatedItems = (wishlist?.items || []).filter((item: any) => item.id !== product.id && item._id !== product.id);
    } else {
      // Add product to wishlist if not already present
      const exists = (wishlist?.items || []).some((item: any) => item.id === product.id || item._id === product.id);
      if (exists) {
        updatedItems = wishlist.items;
      } else {
        updatedItems = [...(wishlist?.items || []), product];
      }
    }
    await wishlistCol.updateOne(
      { email: { $regex: `^${email}$`, $options: "i" } },
      { $set: { email, items: updatedItems } },
      { upsert: true }
    );
    return NextResponse.json({ success: true, items: updatedItems });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
