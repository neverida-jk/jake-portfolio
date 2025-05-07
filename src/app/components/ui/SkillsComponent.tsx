"use client";
import React from 'react';

interface SkillProps {
  name: string;
  className?: string;
}

const Skill: React.FC<SkillProps> = ({ name, className = "" }) => {
  return (
      <div className="box-border bg-black border border-[#C5C5C5] rounded-[28px] w-[100px] max-h-[30px] flex items-center justify-center">
        <span className="font-rubik font-medium text-[13px] leading-[15px] text-[#C5C5C5] px-2 py-1">
          {name}
        </span>
      </div>
  );
};

interface SkillsComponentProps {
  skills: string[];
  className?: string;
}

const SkillsComponent: React.FC<SkillsComponentProps> = ({
  skills = [],
  className = ""
}) => {
  return (
    <div className={`flex flex-wrap gap-2 justify-center ${className}`}>
      {skills.map((skill, index) => (
        <Skill key={index} name={skill} />
      ))}
    </div>
  );
};

export default SkillsComponent;
