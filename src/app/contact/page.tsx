import React from 'react';
import AboutMe from '../components/sections/AboutMe';
import Navbar from '../components/layout/Navbar';
import AnimationController from '../components/ui/AnimationController';

export default function ContactPage() {
  return (
    <div className="grid lg:grid lg:m-10">
      <AnimationController />
      <div className='flex flex-col flex-wrap pl-10 pr-10 lg:flex-col lg:flex-wrap lg:pl-50 lg:pr-50 gap-10'>
        <div className='lg:max-w-full grid place-items-end mt-5 xl:sticky xl:top-5 xl:z-50 '>
          <Navbar isCurrentPage='contact'/>
        </div>
        <AboutMe/>
      </div>
    </div>

  );
}