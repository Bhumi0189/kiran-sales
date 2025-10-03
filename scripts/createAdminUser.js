// Run this script with: node scripts/createAdminUser.js
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "kiransales";

async function main() {
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Check your .env.local file.");
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const email = "admin@kiransales.com";
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const adminUser = {
    email,
    password: hashedPassword,
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    status: "active",
    createdAt: new Date().toISOString(),
  };

  const existing = await db.collection("users").findOne({ email });
  if (existing) {
    await db.collection("users").updateOne({ email }, { $set: adminUser });
    console.log("Admin user updated.");
  } else {
    await db.collection("users").insertOne(adminUser);
    console.log("Admin user created.");
  }
  await client.close();
}

main().catch(console.error);
