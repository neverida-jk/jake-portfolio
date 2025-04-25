import React from 'react';

interface VerticalLineProps{
    height: string; 
    color?: string; 
    thickness?: string
}
const VerticalLine: React.FC<VerticalLineProps> = ({ height, color = 'white', thickness = '.5px' }) => {
  const style = {
    width: thickness,
    height: height,
    backgroundColor: color,
    display: 'inline-block',
  };

  return <div style={style}></div>;
};

export default VerticalLine;