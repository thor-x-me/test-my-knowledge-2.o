import React from "react";
import { Michroma, Poppins } from "next/font/google";
import { InfiniteMovingCards } from "./ui-m/TestimonialCardCarousel";

// Fonts
const michroma = Michroma({
  weight: "400",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
});

// Testimonials data
const cardsData = [
  {
    id: 1,
    quote: "This is the best product I’ve ever used!",
    name: "Abhishek Verma",
    title: "Student",
    image: "/verma_testimonials.png",
    headline: "TURNING STUDY TIME INTO WIN TIME",
  },
  {
    id: 2,
    quote: "A fantastic experience from start to finish.",
    name: "Vidhik",
    title: "Student",
    image: "/vidhik-testmionial.png",
    headline: "LEARNING THAT FEELS EFFORTLESS",
  },
  {
    id: 3,
    quote: "Highly recommended for anyone looking for quality.",
    name: "Shubham ",
    title: "Student",
    image: "/shubham-testimonial (1).png",
    headline : "SMART ANSWERS. ZERO WAIT."
  },
  {
    id: 4,
    quote: "Good for students to learn effectively.",
    name: "Arjun",
    title: "Student",
    headline: "YOUR NOTES, NOW A CONVERSATION",
  },
];

const Testimonials = () => {
  return (
    <div className=" mt-[80px] mx-[20px] mb-20 ">
      {/* heading and description */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 lg:mx-[100px]">
        {/* heading */}
        <div className={`text-3xl lg:text-4xl ${michroma.className}`}>
          <span className="text-[#5D85A1]">Trusted</span> Voices
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

      {/* Carousel */}
      <div className="my-10">
        <InfiniteMovingCards
          items={cardsData}
          direction="left" // or "right"
          speed="normal" // "fast", "normal", "slow"
          pauseOnHover={true}
        />
      </div>
    </div>
  );
};

export default Testimonials;
