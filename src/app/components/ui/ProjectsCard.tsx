"use client";
import React from "react";
import {
	motion,
	useMotionTemplate,
	useSpring,
} from "framer-motion";

interface ProjectsCardProps {
    projectTitle: string;
    date: string;
    description: string;
    href?: string;
    className?: string;
}

const ProjectsCard: React.FC<ProjectsCardProps> = ({
    projectTitle,
    date,
    description,
    href,
    className,
}) => {
    const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
	const mouseY = useSpring(0, { stiffness: 500, damping: 100 });

	function onMouseMove({ currentTarget, clientX, clientY }: any) {
		const { left, top } = currentTarget.getBoundingClientRect();
		mouseX.set(clientX - left);
		mouseY.set(clientY - top);
	}
	const maskImage = useMotionTemplate`radial-gradient(240px at ${mouseX}px ${mouseY}px, white, transparent)`;
	const style = { maskImage, WebkitMaskImage: maskImage };

    return (
             <div
			onMouseMove={onMouseMove}
			className={`overflow-hidden w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[550px]
                        lg:h-[300px] relative duration-700 border rounded-[15px] sm:rounded-[20px] hover:bg-zinc-800/10
                        p-5 sm:p-5 md:p-6 lg:p-[30px] hover:border-zinc-400/50 border-zinc-600 ${className}`}
        >
                <div className="pointer-events-none">
                <div className="absolute inset-0 z-0 transition duration-1000 [mask-image:linear-gradient(black,transparent)]" />
                    <motion.div
                    className="absolute inset-0 z-10 bg-gradient-to-br opacity-100 via-zinc-100/10 transition duration-1000 group-hover:opacity-50"
                        style={style}
                    />
                    <motion.div
                        className="absolute inset-0 z-10 opacity-0 mix-blend-overlay transition duration-1000 group-hover:opacity-100"
                        style={style}
                    />
                </div>

            <div className='font-rubik text-[#939292] text-[13px] sm:text-[14px] md:text-[18px] z-1 relative'>
                    {date}
                </div>

                <div className='font-rubik font-extrabold text-[26px] sm:text-[30px] md:text-[35px] lg:text-[55px]
                                mt-[-2px] sm:mt-0 md:mt-[-5px] lg:mt-[-10px]
                            max-w-full relative z-1'>
                    {projectTitle}
                </div>

                <div className='font-rubik text-[16px] sm:text-[18px] md:text-[20px] lg:text-[25px]
                                text-[#939292]
                                mt-2 sm:mt-3
                                overflow-ellipsis
                            max-h-[80px] sm:max-h-[100px] md:max-h-[100px] relative z-1'>
                    {description}
                </div>
		    </div>
    );
};

export default ProjectsCard;
