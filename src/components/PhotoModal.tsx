import React, { useState } from 'react';
import { CarConfiguration } from '../types';
import { TRIM_SPECS } from '../data/configOptions';
import { Download, X, Check, Camera, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PhotoModalProps {
  imageDataUrl: string | null;
  config: CarConfiguration;
  onClose: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  imageDataUrl,
  config,
  onClose,
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const currentTrim = TRIM_SPECS[config.trim];

  const handleDownload = () => {
    if (!imageDataUrl) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const link = document.createElement('a');
    link.download = `mustang-${config.trim}-${Date.now()}.png`;
    link.href = imageDataUrl;
    link.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider">
              STUDIO PHOTO CAPTURE • {currentTrim.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview Canvas */}
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 aspect-video flex items-center justify-center shadow-inner group">
          {imageDataUrl ? (
            <img
              src={imageDataUrl}
              alt="Mustang Build"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-neutral-500 text-sm">Rendering high resolution snapshot...</div>
          )}

          {/* Watermark overlay */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-neutral-300">
            {currentTrim.name} • {config.paint.name}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-neutral-400">
            Rendered with 3D Ray-Traced Studio Lighting & PBR Materials
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
            >
              Cancel
            </button>
            <button
              id="download-photo-btn"
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-neutral-950 flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
            >
              {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{downloaded ? 'Saved to Device!' : 'Download High-Res PNG'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
