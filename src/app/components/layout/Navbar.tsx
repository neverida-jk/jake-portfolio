import React from 'react';
// Import your component
import NavigationButton from '@/components/ui/NavigationButton';
import VerticalLine from '@/components/ui/VerticalLine';

interface NavbarProps{
  isCurrentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({
    isCurrentPage
}) => {
    return (

      <div className='flex justify-center items-center gap-2 border-1 rounded-[10px] p-2 border-[#c5c5c5]'>
        <NavigationButton isHome={true} href="/"  />
        <VerticalLine height='25px' color='#c5c5c5' />
        {(isCurrentPage === "work" ?
          <NavigationButton text="Work" href="/work" isCurrentPage />
          : <NavigationButton text="Work" href="/work" />
        )}
        {(isCurrentPage === "contact" ?
          <NavigationButton text="Contact" href="/contact" isCurrentPage />
          : <NavigationButton text="Contact" href="/contact" />
        )}
      </div>


  );
}

export default Navbar;
