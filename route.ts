import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export async function POST(request: Request) {
  try {
    const { imageUrl, targetQuality } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Görsel gerekli' }, { status: 400 });
    }

    let scale = 2;
    if (targetQuality === '1080p') scale = 2;
    if (targetQuality === '4k') scale = 4;
    if (targetQuality === '8k') scale = 8;

    const model = "nightmareai/real-esrgan:422037353142e4e882a0f70324545b8399e01f6145a8de372013d1ace3074b46";
    
    const output = await replicate.run(model, {
      input: {
        image: imageUrl,
        scale: scale,
        face_enhance: true
      }
    });

    return NextResponse.json({ enhancedImageUrl: output }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}
