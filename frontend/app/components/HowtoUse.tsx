import React from "react";
import { Poppins, Michroma } from "next/font/google";
import { CardCarousel } from "@/app/components/ui/card-carousel";
// import { tree } from "next/dist/build/templates/app-page";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
});

const michroma = Michroma({
  weight: "400", // Michroma only has one weight
  subsets: ["latin"],
});

const images = [
  { src: "/imageCar1.jpeg", alt: "Image 1" },
  { src: "/imageCar2.jpeg", alt: "Image 2" },
  { src: "/imageCar3.jpeg", alt: "Image 3" },
  { src: "/imageCar4.jpeg", alt: "Image 4" },
  { src: "/imageCar5.jpeg", alt: "Image 5" },
  { src: "/imageCar6.jpeg", alt: "Image 6" },
  { src: "/imageCar7.jpeg", alt: "Image 7" },
];

const HowtoUse = () => {
  return (
    <div className="lg:mx-[100px] mt-[80px] mx-[20px] mb-20 ">
      {/* heading and description */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        {/* heading */}
        <div className={`text-3xl lg:text-4xl ${michroma.className}`}>
          <span className="text-[#5D85A1]">Yuki</span> Demos
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
      {/* Card Slider */}
      <div className="mt-10 w-full ">
        <div className="relative w-full sm:h-[250px] md:h-[300px] lg:h-[400px]">
          <CardCarousel
            images={images}
            autoplayDelay={1000}
            showPagination={true}
            showNavigation={true}
          />
        </div>
      </div>
    </div>
  );
};

export default HowtoUse;
