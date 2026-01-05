"use client";
import React from "react";
import Image from "next/image";
import {
	motion,
	useMotionTemplate,
	useSpring,
} from "framer-motion";

interface CardProps {
    title: string;
    date?: string;
    description?: string;
    className?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    imageSrc?: string;
    imageSize?: number;
}

const Card: React.FC<CardProps> = ({
    title,
    date,
    description,
    className,
    onClick,
    icon,
    imageSrc,
    imageSize,
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
            onClick={onClick}
			onMouseMove={onMouseMove}
			className={`overflow-hidden w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[550px]
                        relative duration-700 border rounded-[15px] sm:rounded-[20px] hover:bg-zinc-800/10
                        p-5 sm:p-5 md:p-6 lg:p-[30px] hover:border-zinc-400/50 border-zinc-600 transition-transform
                        ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}
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

            {imageSrc && (
                <div className="relative z-1 mb-3 sm:mb-4 w-full flex justify-center items-center">
                    <div
                        className="relative rounded-lg overflow-hidden w-full max-w-[120px] sm:max-w-[150px] md:max-w-[180px] lg:max-w-[200px] aspect-square"
                        style={imageSize ? {
                            maxWidth: `min(${imageSize}px, 80%)`,
                        } : undefined}
                    >
                        <Image
                            src={imageSrc}
                            alt={title}
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            )}

            {icon && (
                <div className="relative z-1 mb-4 flex items-center justify-center md:justify-start">
                    {icon}
                </div>
            )}

            <div className='font-rubik font-extrabold text-[22px] sm:text-[26px] md:text-[30px] lg:text-[40px]
                            mt-[-2px] sm:mt-0 md:mt-[-5px] lg:mt-[-10px]
                            max-w-full relative z-1'>
                {title}
            </div>

            {date && (
                <div className='font-rubik text-[#939292] text-[11px] sm:text-[12px] md:text-[14px] lg:text-[16px] z-1 relative mt-1 mb-2'>
                    {date}
                </div>
            )}

            {description && (
                <div className='font-rubik text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px]
                                text-[#939292]
                                mt-2 sm:mt-3 md:mt-4
                                overflow-ellipsis relative z-1'>
                    {description}
                </div>
            )}
        </div>
    );
};

export default Card;

