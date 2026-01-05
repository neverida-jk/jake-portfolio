"use client";
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
import { IoMdHome } from "react-icons/io";


interface NavigationButtonProps {
    text?: string;
    isHome?: boolean;
    href: string;
    className?: string;
    isCurrentPage?: boolean;
    scrollToId?: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
    text,
    isHome,
    href,
    className,
    isCurrentPage,
    scrollToId
}) => {
    const pathname = usePathname();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (scrollToId) {
            e.preventDefault();
            // If we're already on the contact page, scroll to the section
            if (pathname === '/contact') {
                const element = document.getElementById(scrollToId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                // Otherwise, navigate to contact page with hash
                window.location.href = href;
            }
        }
    };

    if (isHome){
        return(
            <div>
                {
                    isCurrentPage ?
                        <button className = {`bg-[#464646] flex flex-row justify-center items-center rounded-[10px] h-[28px] w-[40px] cursor-default ${className}`}>
                           <IoMdHome size={20}/>
                        </button>
                    :
                        <Link href={href}>
                            <button className = {`hover:bg-[#464646] duration-300 transition-colors ease-linear flex flex-row justify-center items-center rounded-[10px] h-[28px] w-[40px] cursor-pointer ${className}`}>
                                <IoMdHome size={20}/>
                            </button>
                        </Link>
                }
            </div>
        )
    }



    return(
        <div>
                {
                    isCurrentPage ?
                        <button className = {`text-white text-[13px] bg-[#464646] font-rubik font-bold items-center rounded-[10px] h-[28px] w-[80px] cursor-default ${className}`}>
                            {text}
                         </button>
                    :
                        scrollToId ? (
                            <button
                                onClick={handleClick}
                                className = {`text-white text-[13px] hover:bg-[#464646] duration-300 transition-colors ease-linear font-rubik font-bold items-center rounded-[10px] h-[28px] w-[80px] cursor-pointer ${className}`}>
                                {text}
                            </button>
                        ) : (
                            <Link href={href}>
                                <button className = {`text-white text-[13px] hover:bg-[#464646] duration-300 transition-colors ease-linear font-rubik font-bold items-center rounded-[10px] h-[28px] w-[80px] cursor-pointer ${className}`}>
                                    {text}
                                </button>
                            </Link>
                        )
                }
            </div>
    )
}

export default NavigationButton