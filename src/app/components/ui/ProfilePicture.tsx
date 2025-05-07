"use client";
import React from 'react';
import Image from 'next/image';

interface ProfilePictureProps {
  src?: string;
  alt?: string;
  className?: string;
  fallbackInitials?: string;
  width?: string | number;
  height?: string | number;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  src = "/jake.jpg",
  alt = "Profile Picture",
  className = "",
  fallbackInitials = "JN",
  width = 200,
  height = 200,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const containerStyle = {
    width,
    height,
  };

  return (
    <div
      className={`relative rounded-full overflow-hidden ${className}`}
      style={containerStyle}
    >
      {!imageError && src ? (
        <Image
          src={src}
          alt={alt}
          width={Number(width)}
          height={Number(height)}
          className="object-cover w-full h-full"
          onError={handleImageError}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-medium"
          style={{ fontSize: typeof width === 'number' ? width * 0.4 : '2rem' }}
        >
          {fallbackInitials}
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
