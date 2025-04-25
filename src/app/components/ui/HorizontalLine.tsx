import React from 'react';

interface HorizontalLineProps{
    height: string; 
    color?: string; 
    thickness?: string
}
const HorizontalLine: React.FC<HorizontalLineProps> = ({ height, color = 'white', thickness = '.5px' }) => {
  const style = {
    width: thickness,
    height: height,
    backgroundColor: color,
    display: 'block',
  };

  return <div style={style}></div>;
};

export default HorizontalLine;