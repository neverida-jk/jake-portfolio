"use client";
import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/dist/server/api-utils';

interface LandingButtonProps {
  // Basic props
  title: React.ReactNode;
  href: string;
  onClick?: () => void;
  className?: string;
  
  // Add more props as needed
}

const LandingButton: React.FC<LandingButtonProps> = ({
  title,
  href,
  onClick,
  className,
  ...props
}) => {
  
    return (
      <div className='hover:text-gray'>
        <Link href={href}>
        <button className={`text-gray-500 hover:text-gray-300 transition-all duration-300 ease-in-out font-rubik md:text-l sm:text-md cursor-pointer ${className}`}>
            {title} 
        </button>
        </Link>

      </div>
    )
  

};

export default LandingButton;