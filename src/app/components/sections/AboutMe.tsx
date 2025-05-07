import React from 'react';
import ProfilePicture from '../ui/ProfilePicture';
import SkillsComponent from '../ui/SkillsComponent';
import LandingName from '../ui/LandingName';
import ContactButtons from '../ui/ContactButtons';
const AboutMe = () => {
    return (
        <div className="font-rubik text-[30px] lg:text-[50px] reveal-item ">
            about me
        <div className="mb-10 max-w-screen h-px md:block animate-glow bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
        <div className="grid grid-cols-[25%_75%] ">
            <div className="flex flex-col items-center gap-5">
                <ProfilePicture width={250} height={250}/>
                <SkillsComponent skills={["JavaScript", "TypeScript", "Python", "React", "Next.js", "Tailwind CSS", "Node.js"]} />
            </div>
            <div className="flex flex-col justify-items-start md:ml-25">
                <p className="mg:text-[20px] md:font-bold items-start">
                Jake Laurence R. Neverida
                </p>
                <div className="mt-0">
                    <LandingName phrases={["Web Developer", "Problem Solver", "Computer Science Student", "Iskolar ng Bayan"]}/>
                </div>
                <div className="mt-8">
                    <ContactButtons/>
                </div>
                <div className="mt-16">
                    <p className="text-[18px]">
                        I am a web developer with a passion for creating beautiful and functional websites.
                    </p>
                </div>
            </div>
        </div>

      </div>
    )
}

export default AboutMe