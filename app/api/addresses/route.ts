import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongo'
import { ObjectId } from 'mongodb'

// GET /api/addresses?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    
    console.log('GET /api/addresses userId:', userId)
    
    if (!userId) {
      return NextResponse.json({ addresses: [] }, { status: 200 })
    }
    
    const client = await getMongoClient()
    const addresses = await client
      .db()
      .collection('addresses')
      .find({ userId })
      .sort({ primary: -1, createdAt: -1 }) // Primary addresses first
      .toArray()
    
    console.log('Addresses found:', addresses.length)
    
    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('GET /api/addresses error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch addresses' }, 
      { status: 500 }
    )
  }
}

// POST /api/addresses (add new address)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('POST /api/addresses body:', body)
    
    // Validate required fields
    if (!body.userId || !body.address || !body.city || !body.pincode) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, address, city, pincode' }, 
        { status: 400 }
      )
    }
    
    const client = await getMongoClient()
    const collection = client.db().collection('addresses')
    
    // Check if this is the user's first address
    const existingCount = await collection.countDocuments({ userId: body.userId })
    const isFirstAddress = existingCount === 0
    
    // If setting as primary or it's the first address, update all others to non-primary
    if (body.primary || isFirstAddress) {
      await collection.updateMany(
        { userId: body.userId }, 
        { $set: { primary: false } }
      )
    }
    
    // Insert new address
    const result = await collection.insertOne({
      userId: body.userId,
      address: body.address,
      city: body.city,
      pincode: body.pincode,
      primary: body.primary || isFirstAddress, // First address is always primary
      createdAt: new Date(),
    })
    
    console.log('Inserted address id:', result.insertedId)
    
    return NextResponse.json({ 
      success: true,
      id: result.insertedId 
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/addresses error:', error)
    return NextResponse.json(
      { error: 'Failed to create address' }, 
      { status: 500 }
    )
  }
}

// PUT /api/addresses (edit existing address)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate required fields
    if (!body.id || !body.userId || !body.address || !body.city || !body.pincode) {
      return NextResponse.json(
        { error: 'Missing required fields: id, userId, address, city, pincode' }, 
        { status: 400 }
      )
    }
    
    const client = await getMongoClient()
    const collection = client.db().collection('addresses')
    
    // Verify the address belongs to the user
    const existingAddress = await collection.findOne({ 
      _id: new ObjectId(body.id),
      userId: body.userId 
    })
    
    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Address not found or unauthorized' }, 
        { status: 404 }
      )
    }
    
    // If setting as primary, update all other addresses to non-primary
    if (body.primary) {
      await collection.updateMany(
        { userId: body.userId, _id: { $ne: new ObjectId(body.id) } }, 
        { $set: { primary: false } }
      )
    }
    
    // Update the address
    const result = await collection.updateOne(
      { _id: new ObjectId(body.id) },
      { 
        $set: { 
          address: body.address, 
          city: body.city, 
          pincode: body.pincode, 
          primary: !!body.primary,
          updatedAt: new Date()
        } 
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Address not found' }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/addresses error:', error)
    return NextResponse.json(
      { error: 'Failed to update address' }, 
      { status: 500 }
    )
  }
}

// PATCH /api/addresses (set as primary)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    
    if (!body.id || !body.userId) {
      return NextResponse.json(
        { error: 'Missing required fields: id, userId' }, 
        { status: 400 }
      )
    }
    
    const client = await getMongoClient()
    const collection = client.db().collection('addresses')
    
    // Verify the address exists and belongs to the user
    const address = await collection.findOne({ 
      _id: new ObjectId(body.id),
      userId: body.userId 
    })
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address not found or unauthorized' }, 
        { status: 404 }
      )
    }
    
    // Set all addresses to non-primary
    await collection.updateMany(
      { userId: body.userId }, 
      { $set: { primary: false } }
    )
    
    // Set this address as primary
    await collection.updateOne(
      { _id: new ObjectId(body.id) }, 
      { $set: { primary: true, updatedAt: new Date() } }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/addresses error:', error)
    return NextResponse.json(
      { error: 'Failed to set primary address' }, 
      { status: 500 }
    )
  }
}

// DELETE /api/addresses?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')
    
    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: id, userId' }, 
        { status: 400 }
      )
    }
    
    const client = await getMongoClient()
    const collection = client.db().collection('addresses')
    
    // Check if address exists and belongs to user
    const address = await collection.findOne({ 
      _id: new ObjectId(id),
      userId: userId
    })
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address not found or unauthorized' }, 
        { status: 404 }
      )
    }
    
    // Delete the address
    const result = await collection.deleteOne({ 
      _id: new ObjectId(id),
      userId: userId 
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete address' }, 
        { status: 500 }
      )
    }
    
    // If this was the primary address, set another as primary
    if (address.primary) {
      const remainingAddresses = await collection.find({ userId }).toArray()
      if (remainingAddresses.length > 0) {
        await collection.updateOne(
          { _id: remainingAddresses[0]._id },
          { $set: { primary: true } }
        )
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/addresses error:', error)
    return NextResponse.json(
      { error: 'Failed to delete address' }, 
      { status: 500 }
    )
  }
}