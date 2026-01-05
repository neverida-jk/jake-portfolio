import React from 'react';
import LandingName from '../ui/LandingName';
import ContactButtons from '../ui/ContactButtons';

const HeroSection = () => {
    return (
        <div className="reveal-item px-4 sm:px-6 md:px-0">
            <div className="flex flex-col items-center">
                <div className="flex flex-col items-center text-center">
                    <h2 className="text-[18px] sm:text-[22px] md:text-[28px] lg:text-[32px] font-bold mb-1 sm:mb-2">
                        hi, i'm
                    </h2>
                    <h1 className="text-[80px] sm:text-[128px] md:text-[200px] lg:text-[320px] font-bold mb-0 sm:mb-2 leading-none">
                        JAKE
                    </h1>
                    <div className="mb-4 sm:mb-6 md:mb-8">
                        <LandingName phrases={["Web Developer", "Problem Solver", "Computer Science Student", "Iskolar ng Bayan"]}/>
                    </div>
                    <div className="hidden sm:block mb-6 sm:mb-8 md:mb-10">
                        <ContactButtons/>
                    </div>
                    <p className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] text-zinc-400 leading-relaxed">
                        i bring value, outputs, and improvement.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;

