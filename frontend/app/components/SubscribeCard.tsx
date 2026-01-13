import React from "react";

const SubscribeCard = () => {
  return (
    <div
      className=" max-w-[1240px] min-h-[360px] md:h-[515px] rounded-[20px] 
      bg-gradient-to-tr from-[#FFFFFF] to-[#B8CCDB] 
      flex flex-col items-center justify-center 
      p-6 md:p-10 mx-4 md:mx-8 lg:mx-auto my-12 lg:my-20 shadow-md"
    >
      {/* Title */}
      <h1
        className="font-[Michroma] text-3xl md:text-5xl lg:text-[60px] leading-snug md:leading-[70px] lg:leading-[85px] 
        text-center text-black max-w-[828px] mb-4 md:mb-6"
      >
        Stay Ahead in Your Learning Journey
      </h1>

      {/* Subtitle */}
      <p
        className="font-[Poppins] text-base md:text-lg lg:text-[22px] leading-relaxed md:leading-[28px] lg:leading-[33px] 
        text-center text-black max-w-[485px] mb-8 md:mb-12"
      >
        Get updates, insights, and learning tips from Yuki — straight to your inbox. 
  
     </p>

      {/* Search Bar */}
      <div className="w-full max-w-[822px] flex flex-col lg:flex-row items-center">
        {/* Input */}
        <input
          type="email"
          placeholder="abc@xyz.com"
          className="flex-1 w-full h-[66px] lg:h-[72px] outline-none bg-white border border-[#B9CDDD] 
          px-4 text-base md:text-lg lg:text-[22px] text-[#ACACAC] font-[Poppins]
          rounded-[20px] lg:rounded-l-[20px] lg:rounded-r-none"
        />

        {/* Button */}
        <button
          className="w-[70%] sm:w-[50%] md:w-[40%] lg:w-[200px] h-[48px] lg:h-[72px] 
          bg-gradient-to-tr from-[#FFFFFF] to-[#b6cee1] 
          border border-[#B9CDDD] font-[Poppins] text-base md:text-lg lg:text-[20px] text-black
          transition-all duration-300 ease-in-out
          hover:shadow-lg hover:from-[#e6f0f7] hover:to-[#a9c6de]
          rounded-[20px] lg:rounded-r-[20px] lg:rounded-l-none 
          mt-4 lg:mt-0 mx-4 sm:mx-6 md:mx-8 lg:mx-0"
        >
          Subscribe
        </button>
      </div>
    </div>
  );
};

export default SubscribeCard;
