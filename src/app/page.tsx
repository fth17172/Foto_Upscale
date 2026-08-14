'use client';

import { useState } from 'react';
import ReactCompareImage from 'react-compare-image';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState<string>('1080p');
  const [loading, setLoading] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number | ''>('');
  const [customHeight, setCustomHeight] = useState<number | ''>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 2048;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            } else {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setImage(optimizedBase64);
          setEnhancedImage(null);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    if (!image) return;
    setLoading(true);

    try {
      const res = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: image, targetQuality: quality }),
      });

      const data = await res.json();
      
      if (res.ok && data.enhancedImageUrl) {
        setEnhancedImage(data.enhancedImageUrl);
      } else {
        alert(`Hata: ${data.error || 'Netleştirme yapılamadı.'}`);
      }
    } catch (err) {
      alert('Vercel sunucusu yanıt vermedi veya zaman aşımına uğradı.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!enhancedImage) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = enhancedImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetW = customWidth ? Number(customWidth) : img.width;
      const targetH = customHeight ? Number(customHeight) : img.height;

      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, targetW, targetH);

      const link = document.createElement('a');
      link.download = `netlestirilmis-${quality}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white p-4 md:p-10 flex flex-col items-center justify-between">
      <header className="w-full max-w-4xl text-center space-y-2 mt-4">
        <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-2">
          PWA & AI Powered
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-500">
          Sihirli Netleştirici
        </h1>
        <p className="text-sm md:text-base text-slate-400 max-w-lg mx-auto">
          Fotoğraflarınızı tek tıkla 8K kalitesine çıkarın, karşılaştırın ve istediğiniz boyutta indirin.
        </p>
      </header>

      <section className="w-full max-w-xl my-8 bg-slate-900/60 backdrop-blur-xl p-5 md:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="relative border-2 border-dashed border-slate-700 hover:border-blue-500 transition rounded-2xl p-6 text-center cursor-pointer group bg-slate-950/40">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="space-y-2 pointer-events-none">
            <svg className="w-10 h-10 mx-auto text-slate-500 group-hover:text-blue-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-slate-300 font-medium">
              {image ? 'Görsel Hazırlandı (Değiştirmek için tıkla)' : 'Fotoğraf Yükle veya Sürükle'}
            </p>
          </div>
        </div>

        {image && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-xs md:text-sm font-medium text-slate-400">Çözünürlük Hedefi:</span>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="bg-slate-900 text-blue-400 font-semibold px-3 py-1.5 rounded-lg border border-slate-700 text-xs md:text-sm outline-none focus:border-blue-500"
              >
                <option value="720p">720p (2x)</option>
                <option value="1080p">1080p (FHD)</option>
                <option value="4k">4K (UHD)</option>
                <option value="8k">8K (Ultra HD)</option>
              </select>
            </div>

            <button
              onClick={handleEnhance}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-blue-500/20 active:scale-[0.98] transition"
            >
              {loading ? 'Yapay Zeka İşliyor...' : 'Netleştir ve Büyüt'}
            </button>
          </div>
        )}
      </section>

      {image && enhancedImage && (
        <section className="w-full max-w-4xl space-y-6 mb-12 animate-fade-in">
          <div className="overflow-hidden rounded-3xl border border-slate-800 shadow-2xl bg-slate-900">
            <ReactCompareImage
              leftImage={image}
              rightImage={enhancedImage}
              leftImageLabel="Önce"
              rightImageLabel="Sonra (Net)"
              sliderLineColor="#3b82f6"
            />
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full md:w-auto justify-center">
              <input
                type="number"
                placeholder="Genişlik (px)"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value ? Number(e.target.value) : '')}
                className="w-28 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs text-center outline-none focus:border-blue-500"
              />
              <span className="text-slate-600">x</span>
              <input
                type="number"
                placeholder="Yükseklik (px)"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value ? Number(e.target.value) : '')}
                className="w-28 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs text-center outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleDownload}
              className="w-full md:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-xs md:text-sm tracking-wide shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition"
            >
              Cihaza İndir
            </button>
          </div>
        </section>
      )}

      <footer className="text-xs text-slate-600 text-center py-4">
        Vercel Edge & Replicate AI tarafından desteklenmektedir.
      </footer>
    </main>
  );
}
