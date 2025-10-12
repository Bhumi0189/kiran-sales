import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('[app-route][cart][GET] incoming URL:', req.url)
    try { console.log('[app-route][cart][GET] headers:', Object.fromEntries(req.headers)) } catch (e) { console.log('[app-route][cart][GET] headers: <unserializable>') }
  } catch (e) {}

  return NextResponse.json({
    items: [
      {
        id: '1',
        name: 'Sample Product',
        quantity: 2,
        price: 100,
        size: 'M',
        color: 'Red',
        image: 'sample-image-url',
        category: 'Clothing',
      },
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Add logic to handle cart creation or updates
    return NextResponse.json({ message: 'Cart POST endpoint is working', body });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
}