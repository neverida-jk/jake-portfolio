import {redirect} from 'next/navigation';
import LandingButton from './components/ui/LandingButton';
import LandingName from './components/ui/LandingName';
import Particles from './components/ui/Particles';
import Link from 'next/link';

export default function Home(){

  // redirect('/development');


  return (
 <div className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/15 to-black">
      <div className="my-16 animate-fade-in">
        <div className="grid gap-15 items-center">
            <div className="flex justify-center gap-5">
              <LandingButton title="Work" href="/work" />
              <LandingButton title="Contact" href="/contact" />
            </div>
        </div>
      </div>
      <div className="hidden w-screen h-px md:block animate-fade-left bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
      <Particles
        className="absolute inset-0 -z-10 animate-fade-in"
        quantity={1000}
      />
      <h1 className="py-3.5  px-3 z-10 text-4xl text-transparent font-rubik duration-1000 bg-white cursor-default text-edge-outline animate-title font-display sm:text-6xl md:text-9xl whitespace-nowrap bg-clip-text ">
        neverida-jk
      </h1>

      <div className="hidden w-screen h-px md:block animate-fade-right bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
      <div className="my-16 text-center animate-fade-in">
        <h2 className="text-sm text-zinc-500 ">
            <LandingName/>
        </h2>
      </div>
    </div>
  );
}