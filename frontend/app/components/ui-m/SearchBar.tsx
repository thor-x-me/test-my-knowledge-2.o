"use client";
import React from "react";

const SubscribeCard = () => {
  return (
    <div className="w-[1240px] h-[515px] rounded-[20px] bg-gradient-to-tr from-[#FFFFFF] to-[#B8CCDB] flex flex-col items-center justify-center p-10 mx-auto">
      
      {/* Title */}
      <h1 className="font-[Michroma] text-[60px] leading-[85px] text-center text-black max-w-[828px]">
        Lorem Ipsum is simply dummy text of the
      </h1>

      {/* Subtitle */}
      <p className="font-[Poppins] text-[22px] leading-[33px] text-center text-black mt-6 max-w-[485px]">
        Lorem Ipsum is simply dummy text of the
      </p>

      {/* Search Bar */}
      <div className="mt-12 w-[822px] h-[72px] flex items-center bg-white border border-[#B9CDDD] rounded-[20px] px-4">
        <input
          type="email"
          placeholder="abc@xyz.com"
          className="flex-1 h-full outline-none bg-transparent text-[22px] text-[#ACACAC] font-[Poppins] px-4"
        />
        <button className="w-[302px] h-[52px] bg-gradient-to-tr from-[#FFFFFF] to-[#B8CCDB] border border-[#B9CDDD] rounded-[20px] font-[Poppins] text-[22px] text-black">
          Subscribe
        </button>
      </div>
    </div>
  );
};

export default SubscribeCard;
