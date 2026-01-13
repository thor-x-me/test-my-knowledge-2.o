import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="w-full bg-gradient-to-tr from-[#FFFFFF] to-[#B8CCDB] border-t-1 border-black p-6">
      <div className="w-full flex justify-between items-center p-6 gap-8">
        {/* first box */}
        <div className="w-1/2 p-4 flex flex-col gap-6">
          <div className="flex gap-5 p-3 items-center">
            <MapPin className="bg-white rounded-2xl p-3 w-12 h-12 shadow-md border border-gray-200" />

            <p className="text-lg font-medium">Lucknow , Uttar Pradesh</p>
          </div>

          <div className="flex gap-5 p-3 items-center">
            <Phone size={10}  className="bg-white rounded-2xl p-3 w-12 h-12 shadow-md border border-gray-200"/>

            <p className="text-lg font-medium">+91 9305971086, 9878630341</p>
          </div>

          <div className="flex gap-5 p-3 items-center">
            <Mail className="bg-white rounded-2xl p-3 w-12 h-12 shadow-md border border-gray-200" />

            <p className="text-lg font-medium">432shobhit@gmail.com</p>
          </div>
        </div>

        {/* second box */}
        <div className="w-1/2 p-4 flex flex-col gap-5">
          {/* desc */}
          <div className="flex flex-col gap-4 mb-4">
            <h3 className="text-black text-4xl font-bold">About LearnWithYuki</h3>

            <p className="text-sm text-black text-wrap leading-relaxed">
              <span className="font-bold"> LearnWithYuki </span> is an EdTech
              project founded by four passionate innovators, dedicated to
              helping learners achieve their goals through personalized study
              plans and curated roadmaps. The platform analyzes each
              individual&apos;s strengths, goals, and interests to recommend tailored
              courses, resources, and learning paths—turning confusion into
              clarity and effort into progress.
            </p>
          </div>

          <div className="flex gap-6">
            {/* social media icons */}

            <Link href={""}>
              <Facebook className="bg-white rounded-md p-3 w-12 h-12 cursor-pointer shadow-md border border-gray-200 hover:shadow-lg transition-shadow" />
            </Link>

            <Link href="">
              <Twitter className="bg-white rounded-md p-3 w-12 h-12 cursor-pointer shadow-md border border-gray-200 hover:shadow-lg transition-shadow" />
            </Link>

            <Link href={""}>
              <Linkedin className="bg-white rounded-md p-3 w-12 h-12 cursor-pointer shadow-md border border-gray-200 hover:shadow-lg transition-shadow" />
            </Link>

            <Link href={""}>
              <Github className="bg-white rounded-md p-3 w-12 h-12 cursor-pointer shadow-md border border-gray-200 hover:shadow-lg transition-shadow" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
