import React from "react";
import { Poppins, Michroma } from "next/font/google";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
});

const michroma = Michroma({
  weight: "400",
  subsets: ["latin"],
});

interface FeatureCardProps {
  heading: string;
  subheading: string;
  size?: "large" | "small"; // default = large
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  heading,
  subheading,
  size = "large",
  className = "",
}) => {
  const isLarge = size === "large";

  return (
    <div
      className={`
        rounded-2xl flex flex-col gap-2 p-4 border border-[#B9CDDD] 
        bg-gradient-to-r from-white to-[#B8CCDB] mb-2
        ${isLarge ? "lg:w-[830px] w-full" : "lg:w-[480px] w-full"}
        ${className}
      `}
    >
      <h2 className={`${michroma.className} text-lg`}>{heading}</h2>

      <p className={`${poppins.className} text-[#646464] text-sm`}>
        {subheading}
      </p>

      <div
        className={`bg-white h-[208px] rounded-2xl p-5 
        ${isLarge ? "lg:w-[790px] w-full" : "lg:w-[440px] w-full"}`}
      ></div>
    </div>
  );
};

export default FeatureCard;



