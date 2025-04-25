import React from 'react';

interface ProjectsCardProps {
    projectTitle: string;
    date: string;
    description: string;
}

const ProjectsCard: React.FC<ProjectsCardProps> = ({
    projectTitle,
    date,
    description
}) => {
    return (
        <div className='border-1 w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[580px] 
                        lg:h-[350px] 
                        rounded-[15px] sm:rounded-[20px] 
                        flex flex-col 
                        p-4 sm:p-5 md:p-6
                        bg-[#202020] border-[#818181]'>
            <div className='font-rubik text-[#939292] text-[13px] sm:text-[14px] md:text-[18px] z-1'>
                {date}
            </div>

            <div className='font-rubik font-extrabold text-[26px] sm:text-[30px] md:text-[35px] lg:text-[50px] 
                            mt-[-2px] sm:mt-0 md:mt-[-5px] lg:mt-[-10px] 
                            max-w-full'>          
                {projectTitle} 
            </div>

            <div className='font-rubik text-[16px] sm:text-[18px] md:text-[20px] lg:text-[23px] 
                            text-[#939292] 
                            mt-2 sm:mt-3 
                            overflow-clip 
                            max-h-[80px] sm:max-h-[100px] md:max-h-[120px] lg:max-h-[170px]'>
                {description} 
            </div>
        </div>
    )
}

export default ProjectsCard;