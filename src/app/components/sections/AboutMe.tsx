import React from 'react';
import HeroSection from './HeroSection';
import MyWorksSection from './MyWorksSection';
import TechnicalExpertiseSection from './TechnicalExpertiseSection';
import WhyWorkWithMeSection from './WhyWorkWithMeSection';
import CredentialsSection from './CredentialsSection';
import CallToActionSection from './CallToActionSection';

interface MediaItem {
    src: string;
    type: 'image' | 'video';
    alt?: string;
}

interface AboutMeProps {
    onSkillClick?: (skill: string) => void;
    onCardClick?: (title: string, cardDescription: string, modalDescription: string, date?: string, imageSrc?: string, imageSize?: number, media?: MediaItem[]) => void;
}

const AboutMe: React.FC<AboutMeProps> = ({ onSkillClick, onCardClick }) => {
    return (
        <div className="font-rubik space-y-12 sm:space-y-16 md:space-y-24 lg:space-y-32">
            <div className="pt-16 sm:pt-12 md:pt-24 lg:pt-32">
                <HeroSection />
            </div>
            <CredentialsSection onCardClick={onCardClick} />
             <TechnicalExpertiseSection onSkillClick={onSkillClick} />
            <MyWorksSection onCardClick={onCardClick} />
            <WhyWorkWithMeSection />
            <CallToActionSection />
        </div>
    )
}

export default AboutMe