"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules";

interface CarouselProps {
  images: { src: string; alt: string }[];
  autoplayDelay?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
}

export const CardCarousel: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 1500,
  showPagination = true,
  showNavigation = false,
}) => {
  const css = `
    .swiper {
      width: 100%;
      padding-bottom: 40px;
    }
    
    .swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  width: 70%;           /* default mobile width */
  max-width: 580px;     /* large screens max */
  height: 200px;        /* default mobile height */
}

@media (min-width: 640px) {
  .swiper-slide {
    width: 60%;         /* small screens slightly bigger */
    height: 250px;
  }
}

@media (min-width: 768px) {
  .swiper-slide {
    width: 50%;         /* medium screens */
    height: 300px;
  }
}

@media (min-width: 1024px) {
  .swiper-slide {
    width: 45%;         /* large screens */
    height: 340px;
  }
}

    .swiper-slide img {
      width: 100%;
      height: 100%;
      border-radius: 16px;
      object-fit: cover;
    }

    /* Center card bigger */
    .swiper-slide-active {
      transform: scale(1.1);
      transition: transform 0.8s ease-in-out;
    }

    .swiper-slide-next,
    .swiper-slide-prev {
      transform: scale(0.9);
      transition: transform 0.8s ease-in-out;
    }
  `;

  return (
    <div className="w-full flex justify-center items-center">
      <style>{css}</style>
      <Swiper
        spaceBetween={30}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
        }}
        speed={1800} // smooth speed
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        loop={true}
        slidesPerView={"auto"}
        coverflowEffect={{
          rotate: -20, // tilt left/right
          stretch: 0,
          depth: 150,
          modifier: 1.5,
          slideShadows: false,
        }}
        pagination={showPagination}
        navigation={
          showNavigation
            ? { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
            : undefined
        }
        modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <Image
              src={image.src}
              width={400}
              height={500}
              alt={image.alt}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
