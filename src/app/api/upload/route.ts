import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@/lib/supabase/server'
import { r2, R2_BUCKET } from '@/lib/r2'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { filename, contentType } = await req.json()
  if (!filename || !contentType) {
    return NextResponse.json({ error: 'filename and contentType are required' }, { status: 400 })
  }

  // Sanitise filename to prevent path traversal and special-char issues
  const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `uploads/${user.id}/${Date.now()}-${safeName}`

  const presignedUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 120 } // 2 minutes to complete the upload
  )

  const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`

  return NextResponse.json({ presignedUrl, publicUrl })
}
