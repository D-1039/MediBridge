import { Navbar } from "@/components/landing/navbar";
import { ProblemSection } from "@/components/landing/problem-section";
import { StatsSection } from "@/components/landing/stats-section";
import { Footer } from "@/components/landing/footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24">
        <ProblemSection />
        <StatsSection />
      </div>
      <Footer />
    </main>
  );
}
