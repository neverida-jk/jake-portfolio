import React from 'react';
import NavigationButton from '../components/ui/NavigationButton';
import Navbar from '../components/layout/Navbar';
import ProjectsCard from '../components/ui/ProjectsCard';
import AnimationController from '@/components/ui/AnimationController';

export default function WorkPage() {
  const projects = [
    {
      href: "/work",
      date: 'May 19, 2024',
      projectTitle: 'Portfolio.dev',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus venenatis bibendum maximus...'
    },
    {
      href: "/work",
      date: 'May 19, 2024',
      projectTitle: 'Portfolio.dev',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus venenatis bibendum maximus...'
    },
    {
      href: "/work",
      date: 'May 19, 2024',
      projectTitle: 'Portfolio.dev',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus venenatis bibendum maximus...'
    },
    {
      href: "/work",
      date: 'May 19, 2024',
      projectTitle: 'Portfolio.dev',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus venenatis bibendum maximus...'
    },
    {
      href: "/work",
      date: 'May 19, 2024',
      projectTitle: 'Portfolio.dev',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus venenatis bibendum maximus...'
    },
    {
      href: "/work",
      date: 'May 19, 2024',
      projectTitle: 'Portfolio.dev',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus venenatis bibendum maximus...'
    },
    // ... other projects
  ];

  return (
    <div className="grid lg:grid lg:m-10">
      <AnimationController />
      
      <div className='flex flex-col flex-wrap pl-10 pr-10 lg:flex-col lg:flex-wrap lg:pl-50 lg:pr-50 gap-10'>
        <div className='lg:max-w-full grid place-items-end mt-5 xl:sticky xl:top-5 '>   
          <Navbar isCurrentPage='work'/>
        </div>
        
        <div className="font-rubik text-[30px] lg:text-[50px] reveal-item">
          projects
        </div>
        
        <div className="max-w-screen h-px md:block animate-glow bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />

        <div className='flex flex-col items-center justify-center gap-5 lg:justify-start lg:flex-row lg:flex-wrap lg:gap-10'>
          {projects.map((project, index) => (
            <div 
              key={index}
              className="reveal-item"
            >
              <ProjectsCard 
                href={project.href}
                date={project.date}
                projectTitle={project.projectTitle}
                description={project.description}
              />
            </div>
          ))}
        </div>
        
        <div className="font-rubik mt-10 text-[30px] lg:text-[50px] reveal-item">
          experiences
        </div>
        
        <div className="max-w-screen h-px md:block animate-glow bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />

        <div className='flex flex-col items-center justify-center gap-5 lg:justify-start lg:flex-row lg:flex-wrap lg:gap-10'>
          {projects.map((project, index) => (
            <div 
              key={index} 
              className="reveal-item"
            >
              <ProjectsCard 
                href={project.href}
                date={project.date}
                projectTitle={project.projectTitle}
                description={project.description}
              />
            </div>
          ))}
        </div>    
      </div>
    </div>
  );
}