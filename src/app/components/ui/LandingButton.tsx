"use client";
import React from 'react';
import Link from 'next/link';

interface LandingButtonProps {
  // Basic props
  title: React.ReactNode;
  href?: string;
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
  // Basic button styles
  const styling = `text-gray-500 hover:text-gray-300 transition-all duration-300 ease-in-out font-rubik md:text-l sm:text-md cursor-pointer ${className}`;


  const handleClick = () => {
    alert('Clicked');
  }
  

    return (
      <div className='hover:text-gray'>
        <button onClick={handleClick} className={styling}>
            {title} 
        </button>
      </div>
    )
  

};

export default LandingButton;