import React from "react";
import HeroSection from "./HeroSection";
import CredentialsSection from "./CredentialsSection";
import TechnicalExpertiseSection from "./TechnicalExpertiseSection";
import MyWorksSection from "./MyWorksSection";
import WhyWorkWithMeSection from "./WhyWorkWithMeSection";
import CallToActionSection from "./CallToActionSection";

interface MediaItem {
  src: string;
  type: "image" | "video";
  alt?: string;
}

interface AboutMeProps {
  onSkillClick?: (skill: string) => void;
  onCardClick?: (
    title: string,
    cardDescription: string,
    modalDescription: string,
    date?: string,
    imageSrc?: string,
    imageSize?: number,
    media?: MediaItem[]
  ) => void;
  onOpenTerminal?: () => void;
  onCopyEmail?: () => void;
}

const AboutMe: React.FC<AboutMeProps> = ({
  onSkillClick,
  onCardClick,
  onOpenTerminal,
  onCopyEmail,
}) => {
  return (
    <div className="font-rubik space-y-12 sm:space-y-16 md:space-y-20">
      <div className="pt-20 sm:pt-24">
        <HeroSection
          onOpenTerminal={onOpenTerminal}
          onCopyEmail={onCopyEmail}
          onSkillClick={onSkillClick}
        />
      </div>
      <CredentialsSection onCardClick={onCardClick} />
      <TechnicalExpertiseSection />
      <MyWorksSection onCardClick={onCardClick} />
      <WhyWorkWithMeSection />
      <CallToActionSection onCopyEmail={onCopyEmail} />
    </div>
  );
};

export default AboutMe;