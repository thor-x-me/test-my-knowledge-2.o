import HeroSection from "./components/HeroSection";
import Features from "./components/Features";
import HowToUse from "./components/HowtoUse";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import CTA from "./components/SubscribeCard";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <div className="w-full">
      <div
        className="relative w-full 
             bg-[url('/bgsmall.png')] lg:bg-[url('/backgroundHero.png')] 
             bg-no-repeat 
             bg-contain lg:bg-cover
             [mask-image:linear-gradient(to_bottom,black_90%,transparent_100%)]"
      >
        <Header />
        <HeroSection />
      </div>

      <Features />
      <HowToUse />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer/>
    </div>
  );
}
