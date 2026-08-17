import React, { useState } from 'react';
import { CarConfiguration } from '../types';
import { TRIM_SPECS } from '../data/configOptions';
import { Share2, Copy, Check, X, FileText, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShareModalProps {
  config: CarConfiguration;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ config, onClose }) => {
  const [copied, setCopied] = useState(false);
  const currentTrim = TRIM_SPECS[config.trim];

  const totalMSRP =
    currentTrim.basePrice +
    config.paint.price +
    config.stripe.price +
    config.wheel.price +
    config.caliper.price +
    config.interior.price +
    (config.carbonPackage ? 2850 : 0);

  const buildCode = `MSTNG-${config.trim.toUpperCase().slice(0, 4)}-${config.paint.id.slice(0, 3)}-${config.wheel.id.slice(0, 3)}-${Math.floor(Math.random() * 9000 + 1000)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider">
              SAVE & SHARE MUSTANG BUILD
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Build Summary Card */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-sky-400 font-bold block">{currentTrim.badge}</span>
              <h4 className="text-base font-extrabold text-white">{currentTrim.name}</h4>
            </div>
            <span className="text-lg font-black font-mono text-emerald-400">
              ${totalMSRP.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
            <div>
              <span className="text-neutral-500 block text-[10px]">PAINT</span>
              <span className="font-semibold">{config.paint.name}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">WHEELS</span>
              <span className="font-semibold">{config.wheel.name}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">INTERIOR</span>
              <span className="font-semibold">{config.interior.name}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">BRAKES</span>
              <span className="font-semibold">{config.caliper.name}</span>
            </div>
          </div>
        </div>

        {/* Build Code */}
        <div className="flex items-center justify-between p-3 bg-black/60 border border-neutral-800 rounded-xl">
          <div>
            <span className="text-[10px] font-mono text-neutral-400 block uppercase">MUSTANG ORDER CODE</span>
            <span className="text-xs font-mono font-bold text-sky-400">{buildCode}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold flex items-center gap-1 text-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Action button */}
        <button
          onClick={handleCopyLink}
          className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-sky-500 hover:brightness-110 text-neutral-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Link Copied to Clipboard!' : 'Share Configuration'}</span>
        </button>

      </div>
    </div>
  );
};
