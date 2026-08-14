import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

// Vercel Serverless Zaman Aşımı Süresini Maksimuma Çıkar (Edge Config)
export const maxDuration = 60; 

export async function POST(request: Request) {
  try {
    const { imageUrl, targetQuality } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Görsel URLsi veya verisi bulunamadı.' }, { status: 400 });
    }

    let scale = 2;
    if (targetQuality === '1080p') scale = 2;
    if (targetQuality === '4k') scale = 4;
    if (targetQuality === '8k') scale = 8;

    // Real-ESRGAN Modeli
    const model = "nightmareai/real-esrgan:422037353142e4e882a0f70324545b8399e01f6145a8de372013d1ace3074b46";
    
    // AI işlemini başlat
    const output = await replicate.run(model, {
      input: {
        image: imageUrl,
        scale: scale,
        face_enhance: true
      }
    });

    return NextResponse.json({ enhancedImageUrl: output }, { status: 200 });

  } catch (error: any) {
    console.error('Vercel API Hatası:', error);
    return NextResponse.json({ error: error?.message || 'İşlem sırasında hata oluştu' }, { status: 500 });
  }
}
