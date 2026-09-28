import React from "react";
import HeroSection from "./HeroSection";
import JourneySection from "./JourneySection";
import WorkSection from "./WorkSection";
import ToolkitSection from "./ToolkitSection";
import ApproachSection from "./ApproachSection";
import BeyondResumeSection from "./BeyondResumeSection";
import ContactSection from "./ContactSection";

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

// Section order/ids follow the climb in ASCENT_MASTERPLAN.md §4:
// hero -> journey -> work -> toolkit -> approach -> beyond -> contact.
const AboutMe: React.FC<AboutMeProps> = ({
  onSkillClick,
  onCardClick,
  onOpenTerminal,
  onCopyEmail,
}) => {
  return (
    <div className="font-sans space-y-12 sm:space-y-16 md:space-y-20">
      <div className="pt-20 sm:pt-24">
        <HeroSection
          onOpenTerminal={onOpenTerminal}
          onCopyEmail={onCopyEmail}
          onSkillClick={onSkillClick}
        />
      </div>
      <JourneySection onCardClick={onCardClick} />
      <WorkSection onCardClick={onCardClick} />
      <ToolkitSection />
      <ApproachSection />
      <BeyondResumeSection />
      <ContactSection onCopyEmail={onCopyEmail} />
    </div>
  );
};

export default AboutMe;
