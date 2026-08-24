import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '../../../lib/auth';

export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const ok = await isAuthenticated();
        if (!ok) {
          throw new Error('unauthorized');
        }
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'video/mp4',
            'video/quicktime',
            'video/webm',
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 200 * 1024 * 1024, // 200MB
        };
      },
      onUploadCompleted: async () => {
        // Metadata (evento, legenda, destaque) é salva separadamente
        // pelo cliente via POST /api/media-items depois que o upload termina.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
