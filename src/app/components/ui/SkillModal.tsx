"use client";
import React, { useEffect } from 'react';
import Image from 'next/image';

interface SkillModalProps {
  skill: string;
  isOpen: boolean;
  onClose: () => void;
}

const SkillModal: React.FC<SkillModalProps> = ({ skill, isOpen, onClose }) => {
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
          className="bg-black border border-[#C5C5C5] rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-modal-enter"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl md:text-4xl font-rubik font-bold text-white capitalize">
              {skill}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-zinc-400 transition-colors text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="flex justify-center items-center mb-6">
            <div className="w-48 h-48 md:w-64 md:h-64 relative">
              <Image
                src={`/${skill.toLowerCase().replace(/\s+/g, '-')}.png`}
                alt={skill}
                width={256}
                height={256}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="text-zinc-400 font-rubik">
            <p className="text-lg">
              {/* Add your skill description here */}
              This is a placeholder description for {skill}. You can customize this content.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SkillModal;

