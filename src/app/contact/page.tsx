"use client";
import React, { useState } from 'react';
import AboutMe from '../components/sections/AboutMe';
import Navbar from '../components/layout/Navbar';
import AnimationController from '../components/ui/AnimationController';
import Particles from '../components/ui/Particles';
import SkillModal from '../components/ui/SkillModal';
import ContentModal from '../components/ui/ContentModal';

export default function ContactPage() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);

  const [selectedCard, setSelectedCard] = useState<{ title: string; description: string; date?: string; imageSrc?: string; media?: Array<{ src: string; type: 'image' | 'video'; alt?: string }> } | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  const handleSkillClick = (skill: string) => {
    setSelectedSkill(skill);
    setIsSkillModalOpen(true);
  };

  const handleCloseSkillModal = () => {
    setIsSkillModalOpen(false);
    setTimeout(() => setSelectedSkill(null), 300);
  };

  const handleCardClick = (title: string, cardDescription: string, modalDescription: string, date?: string, imageSrc?: string, imageSize?: number, media?: Array<{ src: string; type: 'image' | 'video'; alt?: string }>) => {
    setSelectedCard({ title, description: modalDescription, date, imageSrc, media });
    setIsCardModalOpen(true);
  };

  const handleCloseCardModal = () => {
    setIsCardModalOpen(false);
    setTimeout(() => setSelectedCard(null), 300);
  };

  const isModalOpen = isSkillModalOpen || isCardModalOpen;

  return (
    <>
      <div className={`relative min-h-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/15 to-black transition-all duration-300 ${isModalOpen ? 'blur-sm' : ''}`}>
        <Particles
          className="absolute inset-0 -z-10 animate-fade-in"
          quantity={1000}
        />
        <AnimationController />
        <div className='sticky top-4 z-50 w-full hidden sm:flex justify-center md:justify-end px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-4 pb-2 pointer-events-none'>
          <div className='pointer-events-auto'>
            <Navbar isCurrentPage='contact'/>
          </div>
        </div>
        <div className='absolute inset-0 flex flex-col w-full overflow-y-auto scrollbar-hide gap-8 md:gap-10 pb-6 md:pb-8 lg:pb-10'>
          <AboutMe onSkillClick={handleSkillClick} onCardClick={handleCardClick}/>
        </div>
      </div>

      <SkillModal
        skill={selectedSkill || ''}
        isOpen={isSkillModalOpen}
        onClose={handleCloseSkillModal}
      />

      <ContentModal
        title={selectedCard?.title || ''}
        description={selectedCard?.description}
        date={selectedCard?.date}
        media={selectedCard?.media}
        imageSrc={selectedCard?.imageSrc}
        isOpen={isCardModalOpen}
        onClose={handleCloseCardModal}
      />
    </>
  );
}