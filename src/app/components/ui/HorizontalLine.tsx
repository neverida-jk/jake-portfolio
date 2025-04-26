import React from 'react';

interface HorizontalLineProps{
    width: string; 
    color?: string; 
    thickness?: string
}
const HorizontalLine: React.FC<HorizontalLineProps> = ({ width, color = 'white', thickness = '.5px' }) => {
  const style = {
    thickness: thickness,
    width: width,
    backgroundColor: color,
    display: 'block',
  };

  return <div style={style}></div>;
};

export default HorizontalLine;