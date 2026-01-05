import React from 'react';
import Card from '../ui/Card';

interface MediaItem {
    src: string;
    type: 'image' | 'video';
    alt?: string;
}

interface CredentialsSectionProps {
    onCardClick?: (title: string, cardDescription: string, modalDescription: string, date?: string, imageSrc?: string, imageSize?: number, media?: MediaItem[]) => void;
}

const CredentialsSection: React.FC<CredentialsSectionProps> = ({ onCardClick }) => {
    const credentials = [
        {
            title: "BS Computer Science",
            cardDescription: "Graduating student with cumulative GWA of 1.95",
            modalDescription: "Computer Science Student at University of the Philippines Los Baños. Iskolar ng Bayan. Currently a graduating student with a cumulative GWA of 1.95. Specializing in web development and software engineering.",
            date: "2022 - Present",
            imageSrc: "/uplb.png", // Add image path here, e.g., "/education.png"
            imageSize: 250, // Add custom size here (both width and height will be this value in pixels)
            media: [
                { src: "/uplb.png", type: "image" as const, alt: "UP Los Baños" }
                // Add more images or videos here:
                // { src: "/video.mp4", type: "video" as const }
            ]
        },
        {
            title: "Software Engineer Internship",
            cardDescription: "Web Developer building modern web applications.",
            modalDescription: "Web Developer building modern web applications. Freelance & Personal Projects. Experienced in React, Next.js, TypeScript, and various web technologies.",
            date: "May 2025 - July 2025", // Add date here, e.g., "2022 - Present"
            imageSrc: "/limitlesslab.jpeg", // Add image path here, e.g., "/experience.png"
            imageSize: 192, // Add custom size here (both width and height will be this value in pixels)
            media: undefined // Add media array here: [{ src: "/image.png", type: "image" }, { src: "/video.mp4", type: "video" }]
        }
    ];

    return (
        <div className="reveal-item px-4 sm:px-6 md:px-0">
            <h2 className="text-[24px] sm:text-[28px] md:text-[36px] lg:text-[44px] mb-4 sm:mb-6 md:mb-10 text-center font-bold">
                credentials
            </h2>
            <div className="mb-6 sm:mb-8 md:mb-12 max-w-screen h-px animate-glow bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />

            <div className='flex flex-col items-center justify-center gap-4 sm:gap-5 md:gap-6 md:flex-row md:flex-wrap lg:gap-10'>
                {credentials.map((credential, index) => (
                    <div key={index} className="reveal-item w-full md:w-auto flex justify-center">
                        <Card
                            title={credential.title}
                            description={credential.cardDescription}
                            date={credential.date}
                            imageSrc={credential.imageSrc}
                            imageSize={credential.imageSize}
                            onClick={() => onCardClick?.(credential.title, credential.cardDescription, credential.modalDescription, credential.date, credential.imageSrc, credential.imageSize, credential.media)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CredentialsSection;

