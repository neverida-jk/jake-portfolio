import React from "react";
import HeroSection from "./HeroSection";
import JourneySection from "./JourneySection";
import WorkSection from "./WorkSection";
import ToolkitSection from "./ToolkitSection";
import ApproachSection from "./ApproachSection";
import BeyondResumeSection from "./BeyondResumeSection";
import ContactSection from "./ContactSection";

interface AboutMeProps {
  onOpenTerminal?: () => void;
  onCopyEmail?: () => void;
}

// Section order follows the climb (ASCENT_MASTERPLAN.md §4):
// hero -> journey -> work -> toolkit -> approach -> beyond -> contact.
export default function AboutMe({ onCopyEmail }: AboutMeProps) {
  return (
    <div className="font-sans space-y-12 sm:space-y-16 md:space-y-20">
      <HeroSection onCopyEmail={onCopyEmail} />
      <JourneySection />
      <WorkSection />
      <ToolkitSection />
      <ApproachSection />
      <BeyondResumeSection />
      <ContactSection onCopyEmail={onCopyEmail} />
    </div>
  );
}
