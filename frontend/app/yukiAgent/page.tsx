'use client'
import React from "react";
import GenerationSection from "./components/GenerationSection";
import FeatureSection from "./components/FeaturesSection";
import { ArrowLeft } from "lucide-react";
import ChatSection from "./components/ChatSection";
import { useRouter } from "next/navigation";


const YukiAgent = () => {

  const navigate = useRouter()
  return (
    <div className="w-full pb-2 min-h-screen flex-col absloute items-center bg-gradient-to-br flex from-white to-[#a8cce7] border border-[#B9CDDD]  ">
      {/* <Header /> if Header is fixed */}

      <button onClick={() => navigate.push('/')} className="border-3 border-gray-500 absolute left-6 rounded-full p-1 mt-2">
        <ArrowLeft />
      </button>


      <div className="flex gap-6 mt-7">
        {/* generationSecction */}
        <GenerationSection />

        {/* chat section */}
        <div className="w-[1380px] mt-8 rounded-[20px]">
            <ChatSection/>
        </div>


        {/* feature section */}
        <FeatureSection />

      </div>

      {/* Extra padding already added via pb-20 on container */}
    </div>
  );
};

export default YukiAgent;
