"use client";
import React, { useState, useEffect } from 'react';
import { useReducedMotion } from "@/lib/useReducedMotion";

interface LandingNameProps {
    className?: string;
    phrases?: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    delayBetweenPhrases?: number;
    showCursor?: boolean;
}

const LandingName: React.FC<LandingNameProps> = ({
    className,
    phrases = [],
    typingSpeed = 100,
    deletingSpeed = 50,
    delayBetweenPhrases = 2000,
    showCursor = true,
}) => {
    const reduceMotion = useReducedMotion();
    const [text, setText] = useState('');
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);

    useEffect(() => {
        if (reduceMotion) return;

        const currentPhrase = phrases[phraseIndex];

        const typeEffect = () => {
            if (isWaiting) return;

            if (!isDeleting && text === currentPhrase) {
                // Finished typing, wait before deleting
                setIsWaiting(true);
                setTimeout(() => {
                    setIsDeleting(true);
                    setIsWaiting(false);
                }, delayBetweenPhrases);
                return;
            }

            if (isDeleting && text === '') {
                // Finished deleting, move to next phrase
                setIsDeleting(false);
                setPhraseIndex((prev) => (prev + 1) % phrases.length);
                return;
            }

            // Calculate typing/deleting speed
            const speed = isDeleting ? deletingSpeed : typingSpeed;

            // Set timeout for next character
            const timeout = setTimeout(() => {
                setText(prev => {
                    if (isDeleting) {
                        return prev.substring(0, prev.length - 1);
                    } else {
                        return currentPhrase.substring(0, prev.length + 1);
                    }
                });
            }, speed);

            return () => clearTimeout(timeout);
        };

        typeEffect();
    }, [text, phraseIndex, isDeleting, isWaiting, phrases, typingSpeed, deletingSpeed, delayBetweenPhrases, reduceMotion]);

    // Reduced motion: skip the typewriter entirely and just show the final
    // phrase, statically — no flashing cursor, no per-character timers.
    const displayText = reduceMotion ? (phrases[0] ?? '') : text;

    return (
        <div className={`font-sans ${className}`}>
            <div className='text-gray-500 md:text-[20px] cursor-default break-words'>
                {displayText}
                {showCursor && !reduceMotion && <span className="animate-pulse">|</span>}
            </div>
        </div>
    )
};

export default LandingName;
