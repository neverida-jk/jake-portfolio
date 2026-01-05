import React from 'react';
import ScrollingSkills from '../ui/ScrollingSkills';

interface TechnicalExpertiseSectionProps {
    onSkillClick?: (skill: string) => void;
}

const TechnicalExpertiseSection: React.FC<TechnicalExpertiseSectionProps> = ({ onSkillClick }) => {
    return (
        <div className="reveal-item px-4 sm:px-6 md:px-0">
            <h2 className="text-[24px] sm:text-[28px] md:text-[36px] lg:text-[44px] mb-4 sm:mb-6 md:mb-10 text-center font-bold">
                technical expertise
            </h2>
            <div className="mb-6 sm:mb-8 md:mb-12 max-w-screen h-px animate-glow bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />

            <ScrollingSkills
                skills={[
                    "javascript",
                    "python",
                    "react",
                    "TailwindCSS",
                    "nodejs",
                    "github",
                    "mongodb",
                ]}
                onSkillClick={onSkillClick}
            />
        </div>
    );
};

export default TechnicalExpertiseSection;

