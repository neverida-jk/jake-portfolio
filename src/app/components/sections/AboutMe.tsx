import React from "react";
import HeroSection from "./HeroSection";
import JourneySection from "./JourneySection";
import WorkSection from "./WorkSection";
import ToolkitSection from "./ToolkitSection";
import TestimonialsSection from "./TestimonialsSection";
import { copy } from "@/content/copy";
import BeyondResumeSection from "./BeyondResumeSection";
import ContactSection from "./ContactSection";

interface AboutMeProps {
  onOpenTerminal?: () => void;
  onCopyEmail?: () => void;
}

// Section order follows the timeline (ASCENT_MASTERPLAN.md §4, concept
// changed to time): hero (Now) -> journey (Then) -> work (Shipped) ->
// toolkit -> testimonials (only when real quotes exist) -> beyond -> contact (Next).
export default function AboutMe({ onCopyEmail }: AboutMeProps) {
  return (
    <div className="font-sans space-y-12 sm:space-y-16 md:space-y-20">
      <HeroSection onCopyEmail={onCopyEmail} />
      <JourneySection />
      <WorkSection />
      <ToolkitSection />
      {copy.testimonials.items.length > 0 && <TestimonialsSection />}
      <BeyondResumeSection />
      <ContactSection onCopyEmail={onCopyEmail} />
    </div>
  );
}
