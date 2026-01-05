import React from 'react';
import Card from '../ui/Card';

const WhyWorkWithMeSection = () => {
    return (
        <div className="reveal-item px-4 sm:px-6 md:px-0">
            <h2 className="text-[24px] sm:text-[28px] md:text-[36px] lg:text-[44px] mb-4 sm:mb-6 md:mb-10 text-center font-bold">
                my contribution
            </h2>
            <div className="mb-6 sm:mb-8 md:mb-12 max-w-screen h-px animate-glow bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />

            <div className='flex flex-col items-center justify-center gap-4 sm:gap-5 md:gap-6 md:flex-row md:flex-wrap lg:gap-10'>
                <div className="reveal-item w-full md:w-auto flex justify-center">
                    <Card
                        title="Fast & Efficient"
                        description="Deliver high-quality work on time, every time. I prioritize efficiency without compromising on quality."
                        icon={<span className="text-[28px] sm:text-[32px] md:text-[40px]">🚀</span>}
                    />
                </div>
                <div className="reveal-item w-full md:w-auto flex justify-center">
                    <Card
                        title="Innovative Solutions"
                        description="Creative problem-solving approach that brings fresh perspectives to your projects."
                        icon={<span className="text-[28px] sm:text-[32px] md:text-[40px]">💡</span>}
                    />
                </div>
                <div className="reveal-item w-full md:w-auto flex justify-center">
                    <Card
                        title="Collaborative Approach"
                        description="Strong communication skills and a team-first mindset ensure smooth collaboration."
                        icon={<span className="text-[28px] sm:text-[32px] md:text-[40px]">🤝</span>}
                    />
                </div>
            </div>
        </div>
    );
};

export default WhyWorkWithMeSection;

