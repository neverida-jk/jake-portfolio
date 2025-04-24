import {redirect} from 'next/navigation';
import LandingButton from './components/ui/LandingButton';
import LandingName from './components/ui/LandingName';

export default function Home(){

  // redirect('/development');

  return (
    <main>
        <div className="flex min-h-screen justify-center items-center">
          <div className="grid gap-15 items-center">
            <div className="flex justify-center gap-5">
              <LandingButton title="Work"/>
              <LandingButton title="Contact"/>
            </div>

            <div>
              <LandingName className='md:text-9xl' />
            </div>
          </div>
      </div>
    </main>
  );
}