import Link from 'next/link';
import React from 'react';
import { IoMdHome } from "react-icons/io";


interface NavigationButtonProps {
    text?: string;
    isHome?: boolean;
    href: string;
    className?: string;
    isCurrentPage?: boolean;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
    text,
    isHome,
    href,
    className,
    isCurrentPage
}) => {

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
                        <Link href={href}>
                            <button className = {`text-white text-[13px] hover:bg-[#464646] duration-300 transition-colors ease-linear font-rubik font-bold items-center rounded-[10px] h-[28px] w-[80px] cursor-pointer ${className}`}>
                                {text}
                            </button>
                        </Link>
                }
            </div>
    )
}

export default NavigationButton