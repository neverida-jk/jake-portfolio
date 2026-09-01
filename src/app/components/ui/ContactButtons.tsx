"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ContactButtonProps {
  title: string;
  href: string;
  iconSrc?: string;
  className?: string;
}

const ContactButton: React.FC<ContactButtonProps> = ({
  title,
  href,
  iconSrc,
  className = "",
}) => {
  return (
    <Link href={href} passHref target="_blank" rel="noopener noreferrer">
      <div className={`flex flex-row items-center justify-center gap-1.5 sm:gap-2 box-border hover:bg-[#3F3F3F] transition-all duration-300 bg-black border border-[#C5C5C5] rounded-[20px] sm:rounded-[24px] md:rounded-[28px] w-[110px] sm:w-[130px] md:w-[148px] h-[36px] sm:h-[40px] md:h-[45px] ${className}`}>
        {iconSrc && (
          <div className="w-[16px] h-[16px] sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px] relative">
            <Image src={iconSrc} alt={`${title} icon`} fill className="object-contain" />
          </div>
        )}
        <span className="font-rubik font-medium text-[14px] sm:text-[16px] md:text-[18px] text-white">
          {title}
        </span>
      </div>
    </Link>
  );
};

interface ContactButtonsProps {
  className?: string;
}

const ContactButtons: React.FC<ContactButtonsProps> = ({ className = "" }) => {
  return (
    <div className={`flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 md:gap-4 ${className}`}>
      <ContactButton title="GitHub" href="https://github.com/neverida-jk" iconSrc="/github-icon.png" />
      <ContactButton title="LinkedIn" href="https://linkedin.com/in/your-profile" iconSrc="/linkedin-icon.png" />
      <ContactButton title="Resume" href="mailto:jlrneverida@gmail.com" iconSrc="/email-icon.png" />
    </div>
  );
};

export default ContactButtons;
