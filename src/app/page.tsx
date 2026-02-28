import Navbar from "@/components/landing/Navbar";
import ExperienceHero from "@/components/ui/experience-hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Story from "@/components/landing/Story";
import TechStack from "@/components/landing/TechStack";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <ExperienceHero />
        <Features />
        <HowItWorks />
        <Story />
        <TechStack />
      </main>
      <Footer />
    </>
  );
}
