import { Hero } from "@/components/hero/Hero";
import { Footer } from "@/components/layout/Footer";
import { LoadingIntro } from "@/components/layout/LoadingIntro";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Architecture } from "@/components/sections/Architecture";
import { CloudInfrastructure } from "@/components/sections/CloudInfrastructure";
import { Conclusion } from "@/components/sections/Conclusion";
import { DashboardPreview } from "@/components/sections/DashboardPreview";
import { DataPipeline } from "@/components/sections/DataPipeline";
import { FrontendDesign } from "@/components/sections/FrontendDesign";
import { Gallery } from "@/components/sections/Gallery";
import { Hardware } from "@/components/sections/Hardware";
import { Introduction } from "@/components/sections/Introduction";
import { KeyFeatures } from "@/components/sections/KeyFeatures";
import { MachineLearning } from "@/components/sections/MachineLearning";
import { Metrics } from "@/components/sections/Metrics";
import { Objectives } from "@/components/sections/Objectives";
import { Roadmap } from "@/components/sections/Roadmap";
import { Team } from "@/components/sections/Team";
import { Testing } from "@/components/sections/Testing";
import { ProductVideos } from "@/components/video/ProductVideos";

export default function Home() {
  return (
    <SmoothScroll>
      <LoadingIntro />
      <ScrollProgress />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Metrics />
        <Introduction />
        <ProductVideos />
        <Objectives />
        <KeyFeatures />
        <Architecture />
        <Hardware />
        <CloudInfrastructure />
        <FrontendDesign />
        <DataPipeline />
        <MachineLearning />
        <DashboardPreview />
        <Testing />
        <Gallery />
        <Roadmap />
        <Team />
        <Conclusion />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
