"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import Image from "next/image";



export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
    image?: string; // optional: path to image in public/ or remote
    headline?: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);



    useEffect(() => {
    if (!scrollerRef.current) return;

    const scroller = scrollerRef.current;
    const scrollerContent = Array.from(scroller.children);


    const getDirection = () => {
      if (containerRef.current) {
        containerRef.current.style.setProperty(
          "--animation-direction",
          direction === "left" ? "forwards" : "reverse"
        );
      }
    };
  
    const getSpeed = () => {
      if (containerRef.current) {
        let duration = "40s";
        if (speed === "fast") duration = "20s";
        if (speed === "slow") duration = "80s";
        containerRef.current.style.setProperty("--animation-duration", duration);
      }
    };

    // Clone cards for infinite effect
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      scroller.appendChild(duplicatedItem);
    });

    getDirection();
    getSpeed();
    setStart(true);
  }, [direction, speed]);


  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-full overflow-hidden [mask-image:linear-gradient(to_right,rgba(255,255,255,0.4),white_10%,white_90%,rgba(255,255,255,0.4))]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            className="
              flex justify-between bg-[#B9CDDD] rounded-2xl
              w-[250px] sm:w-[300px] md:w-[400px] lg:w-[500px]
              h-[200px] sm:h-[230px] md:h-[260px] lg:h-[283px]
              p-2
            "
          >
            {/* Image */}
            <Image
              src={item.image ?? "/userTestimonial.png"}
              alt={item.name || "Testimonial"}
              width={214}
              height={214}
              className="
                w-[100px] sm:w-[150px] md:w-[180px] lg:w-[214px]
                h-auto mt-4
              "
            />



            {/* Content */}
            <div className="flex-col p-2 mt-2">
              <svg
                width="30"
                height="22"
                viewBox="0 0 33 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.829546 25V18.608C0.829546 16.6667 1.17282 14.607 1.85938 12.429C2.5696 10.2273 3.5876 8.10843 4.91335 6.07244C6.26278 4.01278 7.88447 2.22538 9.77841 0.710225L14.3239 4.40341C12.8324 6.53409 11.5303 8.75947 10.4176 11.0795C9.3286 13.3759 8.78409 15.8381 8.78409 18.4659V25H0.829546ZM19.0114 25V18.608C19.0114 16.6667 19.3546 14.607 20.0412 12.429C20.7514 10.2273 21.7694 8.10843 23.0952 6.07244C24.4446 4.01278 26.0663 2.22538 27.9602 0.710225L32.5057 4.40341C31.0142 6.53409 29.7121 8.75947 28.5994 11.0795C27.5104 13.3759 26.9659 15.8381 26.9659 18.4659V25H19.0114Z"
                  fill="url(#paint0_linear_190_218)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_190_218"
                    x1="0.632353"
                    y1="24.1029"
                    x2="38.4437"
                    y2="18.993"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#C3D1E0" />
                    <stop offset="1" stopColor="#647F91" />
                  </linearGradient>
                </defs>
              </svg>

              {/* heading and content */}
              <div className="flex flex-col lg:gap-3 p-2">
                <div className="mb-4">
                  <p className="text-[#646464] font-bold text-[0.6rem] sm:text-base lg:text-lg break-words">
                    {item.headline ?? "WHAT A UNIQUE SOLUTION"}
                  </p>

                  <p className="text-[#646464]  text-[0.45rem] lg:text-sm break-words overflow-hidden">
                    {/* Upload a YouTube link, Video, document, image, or voice note
                    and let Yuki, your AI study companion, explain, answer */}
                    {item.quote}
                  </p>
                </div>

                <div>
                  <h2 className="text-[#646464] font-semibold text-sm sm:text-base lg:text-lg break-words text-[0.6rem] ">
                    {item.name}
                  </h2>

                  <p className="text-[#646464] text-xs sm:text-sm lg:text-sm break-words overflow-hidden text-[0.45rem]">
                    {item.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
};
