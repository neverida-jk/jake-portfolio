import React from 'react';
import Card from '../ui/Card';

interface MediaItem {
    src: string;
    type: 'image' | 'video';
    alt?: string;
}

interface MyWorksSectionProps {
    onCardClick?: (title: string, cardDescription: string, modalDescription: string, date?: string, imageSrc?: string, imageSize?: number, media?: MediaItem[]) => void;
}

const MyWorksSection: React.FC<MyWorksSectionProps> = ({ onCardClick }) => {
    const works = [
        {
            title: "Web Development",
            cardDescription: "Building modern, responsive web applications.",
            modalDescription: "Building modern, responsive web applications using cutting-edge technologies like React, Next.js, and TypeScript. I specialize in creating user-friendly interfaces and scalable architectures.",
            date: undefined, // Add date here, e.g., "2022 - Present"
            imageSrc: undefined, // Add image path here, e.g., "/web-dev.png"
            imageSize: undefined, // Add custom size here (both width and height will be this value in pixels)
            media: undefined // Add media array here: [{ src: "/image.png", type: "image" }, { src: "/video.mp4", type: "video" }]
        },
        {
            title: "Problem Solving",
            cardDescription: "Analyzing complex challenges and developing elegant solutions.",
            modalDescription: "Analyzing complex challenges and developing elegant solutions that are both efficient and maintainable. I approach problems systematically and create innovative solutions.",
            date: undefined, // Add date here, e.g., "2022 - Present"
            imageSrc: undefined, // Add image path here, e.g., "/problem-solving.png"
            imageSize: undefined, // Add custom size here (both width and height will be this value in pixels)
            media: undefined // Add media array here: [{ src: "/image.png", type: "image" }, { src: "/video.mp4", type: "video" }]
        },
        {
            title: "Continuous Learning",
            cardDescription: "Staying updated with the latest technologies and best practices.",
            modalDescription: "Staying updated with the latest technologies and best practices to deliver cutting-edge solutions. I continuously expand my knowledge through courses, projects, and industry trends.",
            date: undefined, // Add date here, e.g., "2022 - Present"
            imageSrc: undefined, // Add image path here, e.g., "/learning.png"
            imageSize: undefined, // Add custom size here (both width and height will be this value in pixels)
            media: undefined // Add media array here: [{ src: "/image.png", type: "image" }, { src: "/video.mp4", type: "video" }]
        }
    ];

    return (
        <div className="reveal-item px-4 sm:px-6 md:px-0">
            <h2 className="text-[24px] sm:text-[28px] md:text-[36px] lg:text-[44px] mb-4 sm:mb-6 md:mb-10 text-center font-bold">
                some of my works
            </h2>
            <div className="mb-6 sm:mb-8 md:mb-12 max-w-screen h-px animate-glow bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />

            <div className='flex flex-col items-center justify-center gap-4 sm:gap-5 md:gap-6 md:flex-row md:flex-wrap lg:gap-10'>
                {works.map((work, index) => (
                    <div key={index} className="reveal-item w-full md:w-auto flex justify-center">
                        <Card
                            title={work.title}
                            description={work.cardDescription}
                            date={work.date}
                            imageSrc={work.imageSrc}
                            imageSize={work.imageSize}
                            onClick={() => onCardClick?.(work.title, work.cardDescription, work.modalDescription, work.date, work.imageSrc, work.imageSize, work.media)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyWorksSection;

