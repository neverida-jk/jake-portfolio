import React from 'react';
import ProjectsCard from '../ui/ProjectsCard';

const Projects = () => {

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
        <div className="font-rubik text-[30px] lg:text-[50px] reveal-item">
          projects
            <div className="mb-10  max-w-screen h-px md:block animate-glow bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />

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
    )
}

export default Projects;