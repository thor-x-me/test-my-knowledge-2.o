import React from "react";
import { Poppins, Michroma } from "next/font/google";
import FeatureCard from "./ui-m/FeatureCard";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
});

const michroma = Michroma({
  weight: "400", // Michroma only has one weight
  subsets: ["latin"],
});

const Features = () => {
  return (
    <div className="lg:mx-[100px] mt-[80px] mx-[20px] ">
      {/* heading and description */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        {/* heading */}
        <div className={`text-3xl lg:text-4xl ${michroma.className}`}>
          <span className="text-[#5D85A1]">Smart</span> Tools
        </div>

        {/* description */}
        <div
          className={`text-sm lg:text-lg text-[#646464] ${poppins.className} w-full lg:w-1/2 whitespace-normal lg:text-right`}
        >
          Upload a YouTube link, Video, document, image, or voice note and let
          Yuki, your AI study companion, explain, answer questions, and guide
          you like a personal digital teacher.
        </div>
      </div>

      {/* main feature div */}
      <div className="lg:flex-col mt-8 grid-rows-4 ">
        {/* feature 1 div  */}

        <div className="lg:flex gap-4 lg:mb-8 grid-cols-1 mb-2">
          <FeatureCard
            heading="Solve doubt about a video lecture"
            subheading="Make sure you have learned everything by evaluating your understanding"
            size="large"
          />

          <FeatureCard
            heading="Quiz Your Video"
            subheading="Make sure you have learned everything by evaluating your understanding"
            size="small"
          />
        </div>

        {/* feature 2 div  */}
        <div className="lg:flex gap-4 grid-cols-1 ">
          <FeatureCard
            heading="Curate study plan"
            subheading="Make sure you have learned everything by evaluating your understanding"
            size="small"
          />

          <FeatureCard
            heading="Chat with study materials"
            subheading="Make sure you have learned everything by evaluating your understanding"
            size="large"
          />
        </div>
      </div>
    </div>
  );
};

export default Features;
