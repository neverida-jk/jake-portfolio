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
      <div className={`flex flex-row items-center justify-center gap-2 box-border hover:bg-[#3F3F3F] transition-all duration-300 bg-black border border-[#C5C5C5] rounded-[28px] w-[148px] h-[45px] ${className}`}>
        {iconSrc && (
          <div>
            <Image src={iconSrc} alt={`${title} icon`} width={24} height={24} />
          </div>
        )}
        <span className="font-rubik font-medium text-[18px] text-white">
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
    <div className={`flex flex-wrap gap-4 ${className}`}>
      <ContactButton title="GitHub" href="https://github.com/neverida-jk" iconSrc="/github-icon.png" />
      <ContactButton title="LinkedIn" href="https://linkedin.com/in/your-profile" iconSrc="/linkedin-icon.png" />
      <ContactButton title="Email" href="mailto:jrneverida@up.edu.ph" iconSrc="/email-icon.png" />
    </div>
  );
};

export default ContactButtons;
