import React from 'react';
// Import your component
import NavigationButton from '@/components/ui/NavigationButton';
import VerticalLine from '@/components/ui/VerticalLine';


export default function Navbar() {
  return (
    <div className="flex min-h-screen justify-center items-center gap-5">
      <div className='flex justify-center items-center gap-2 border-1 rounded-[10px] p-1.5 border-[#c5c5c5]'>
        <NavigationButton isHome={true} href="/"  />
        <VerticalLine height='25px' color='#c5c5c5' />
        <NavigationButton text="Work" href="/work" isCurrentPage/>
        <NavigationButton text="Contact" href="/contact" />
      </div>

    </div>
  );
}