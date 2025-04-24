"use client";
import React from 'react';

interface LandingNameProps{
    // children: React.ReactNode;
    className?: string;
    //add when needed
}

const LandingName: React.FC<LandingNameProps> = ({
    // children,
    className,
    ...props
}) => {

    // styling

    const styling = `font-rubik grid gap-15 ${className}`

    return (
        <div className={styling}>
            <div className='flex flex-row justify-center items-center text-white font-bold cursor-default'>
                jake neverida
            </div>
            <div className='flex flex-row justify-center items-center text-gray-500 md:text-[20px] cursor-default'>
                a computer science student
            </div>
        </div>
    )
};

export default LandingName;
