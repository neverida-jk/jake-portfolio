import React from 'react';
import ProjectsCard from '../ui/ProjectsCard';


const Experiences = () => {
    const experiences = [
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
        // ... other experiences
      ];

    return (
        <div className="font-rubik reveal-item px-4 sm:px-6 md:px-0">
            <h2 className="text-[24px] sm:text-[28px] md:text-[36px] lg:text-[44px] mb-4 sm:mb-6 md:mb-10 text-center font-bold">
                experiences
            </h2>
            <div className="mb-6 sm:mb-8 md:mb-12 max-w-screen h-px animate-glow bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />

            <div className='flex flex-col items-center justify-center gap-4 sm:gap-5 md:gap-6 md:flex-row md:flex-wrap lg:gap-10'>
                {experiences.map((project, index) => (
                    <div key={index} className="reveal-item w-full md:w-auto flex justify-center">
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
    )
}

export default Experiences;