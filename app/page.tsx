import { AnimatedBackground } from "@/components/animated-background";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { MoodRecommender } from "@/components/mood-recommender";
import { SpotifySearch } from "@/components/spotify-search";
import { MusicCards } from "@/components/music-cards";
import { Testimonials } from "@/components/testimonials";
import { ExperienceReportSection } from "@/components/experience-report-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main>
        <HeroSection />
        <MoodRecommender />
        <SpotifySearch />
        <MusicCards />
        <Testimonials />
        <ExperienceReportSection />
      </main>
      <SiteFooter />
    </>
  );
}
