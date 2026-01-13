import React from "react";
import { Inter } from "next/font/google";
import Image from "next/image";


const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
});

const FeatureSection = () => {
  return (
    <div className="flex flex-col gap-5 p-3 min-h-screen w-1/5 rounded-2xl relative items-center border-3 border-black mt-8">
      {/* Images and Videos */}
      
      <div className="right-2 absolute">
          <Image src={'/layouting.png'} alt="sectionBar" width={30} height={30}/>
      </div>


    </div>
  );
};

export default FeatureSection;
