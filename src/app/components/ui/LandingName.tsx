"use client";
import React, { useState, useEffect } from 'react';

interface LandingNameProps{
    // children: React.ReactNode;
    className?: string;
    phrases?: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    delayBetweenPhrases?: number;
}

const LandingName: React.FC<LandingNameProps> = ({
    // children,
    className,
    phrases = [],
    typingSpeed = 100,
    deletingSpeed = 50,
    delayBetweenPhrases = 2000,
}) => {
    const [text, setText] = useState('');
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);

    useEffect(() => {
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
    }, [text, phraseIndex, isDeleting, isWaiting, phrases, typingSpeed, deletingSpeed, delayBetweenPhrases]);

    return (
        <div className={`font-rubik grid gap-15 ${className}`}>
            <div className='flex flex-row  text-gray-500 md:text-[20px] cursor-default'>
                {text}<span className="animate-pulse">|</span>
            </div>
        </div>
    )
};

export default LandingName;
