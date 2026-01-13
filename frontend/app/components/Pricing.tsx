"use client";
import React from "react";
import { Michroma, Poppins } from "next/font/google";
import PricingCard from "./ui-m/PricingCard";

const poppins = Poppins({ weight: "400", subsets: ["latin"] });
const michroma = Michroma({ weight: "400", subsets: ["latin"] });

const features = [
  "Powerful AI analysis",
  "Advanced reporting",
  "Real-time AI",
  "Data analysis",
  "24/7 Support",
];

const Pricing = () => {
  // const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="lg:mx-[100px] mt-[80px] mb-20 mx-[20px]">
      {/* heading and description */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 ">
        <div className={`text-3xl lg:text-4xl ${michroma.className}`}>
          <span className="text-[#5D85A1]">Pricing</span>
        </div>

        {/* description */}
        <div
          className={`text-sm lg:text-lg text-[#646464] ${poppins.className} w-full lg:w-1/2 whitespace-normal lg:text-right`}
        >
          Yuki gives you everything you need to study efficiently from solving
          doubts on any lecture to creating quizzes, crafting personalized study
          plans, and chatting directly with your study materials.
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="flex flex-col md:flex-col lg:flex-row justify-between gap-6 mt-10">
        {[
          { content: "Casual Learner", price: "$0" },
          { content: "Topper's Plan", price: "$20" },
          { content: "Pro Learner", price: "$40" },
        ].map((card, index) => (
          <PricingCard
            key={index}
            content={card.content}
            price={card.price}
            features={features}
          />
        ))}
      </div>
    </div>
  );
};

export default Pricing;
