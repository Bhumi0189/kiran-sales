// For App Router (app/api/upload/route.ts)
import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = uniqueSuffix + '-' + file.name.replace(/\s/g, '-')
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename)

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  try {
    await mkdir(uploadsDir, { recursive: true })
    // Save to public/uploads directory
    await writeFile(filepath, buffer)
    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (fsErr) {
    // Many serverless hosts (Vercel) don't allow writing to disk. In that case
    // return a data URL so the client can still display/store the image.
    try {
      const base64 = buffer.toString('base64')
      const contentType = (file as any).type || 'application/octet-stream'
      const dataUrl = `data:${contentType};base64,${base64}`
      return NextResponse.json({ url: dataUrl })
    } catch (innerErr) {
      console.error('Failed to fallback to data URL for upload:', innerErr)
      return NextResponse.json({ error: 'Failed to save uploaded file' }, { status: 500 })
    }
  }
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}