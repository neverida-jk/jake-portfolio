import React from 'react';
import ContactButtons from '../ui/ContactButtons';

const CallToActionSection = () => {
    return (
        <div className="reveal-item px-4 sm:px-6 md:px-0">
            <h2 className="text-[24px] sm:text-[28px] md:text-[36px] lg:text-[44px] mb-4 sm:mb-6 md:mb-10 text-center font-bold">
                let's work together
            </h2>
            <div className="mb-6 sm:mb-8 md:mb-12 max-w-screen h-px animate-glow bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />

            <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8">
                <p className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] text-zinc-400 text-center leading-relaxed">
                    Ready to bring your ideas to life? Let's discuss how I can help you achieve your goals.
                    Get in touch through any of the platforms below.
                </p>
                <div className="w-full md:w-auto">
                    <ContactButtons/>
                </div>
            </div>
        </div>
    );
};

export default CallToActionSection;

