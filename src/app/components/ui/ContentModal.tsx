"use client";
import React, { useEffect } from 'react';
import Image from 'next/image';

interface MediaItem {
  src: string;
  type: 'image' | 'video';
  alt?: string;
}

interface ContentModalProps {
  title: string;
  description?: string;
  date?: string;
  media?: MediaItem[];
  imageSrc?: string; // Keep for backward compatibility
  isOpen: boolean;
  onClose: () => void;
}

const ContentModal: React.FC<ContentModalProps> = ({
  title,
  description,
  date,
  media,
  imageSrc, // Backward compatibility
  isOpen,
  onClose
}) => {
  // Convert single imageSrc to media array for backward compatibility
  const mediaItems: MediaItem[] = media || (imageSrc ? [{ src: imageSrc, type: 'image' as const, alt: title }] : []);
  useEffect(() => {
    // Prevent scrollbar from appearing
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-black border border-[#C5C5C5] rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide animate-modal-enter"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-rubik font-bold text-white capitalize">
                {title}
              </h2>
              {date && (
                <div className="text-zinc-400 font-rubik text-sm md:text-base mt-1">
                  {date}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-zinc-400 transition-colors text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {mediaItems.length > 0 && (
            <div className="mb-6 space-y-4">
              {mediaItems.map((item, index) => (
                <div key={index} className="flex justify-center items-center w-full">
                  {item.type === 'image' ? (
                    <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden">
                      <Image
                        src={item.src}
                        alt={item.alt || title}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden">
                      <video
                        src={item.src}
                        controls
                        className="w-full h-full object-contain"
                        playsInline
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {description && (
            <div className="text-zinc-400 font-rubik">
              <p className="text-lg leading-relaxed">
                {description}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContentModal;

