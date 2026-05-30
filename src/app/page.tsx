import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { StatsSection } from "@/components/landing/stats-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <StatsSection />
      <WorkflowSection />
      <Footer />
    </main>
  );
}
