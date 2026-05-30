import { Navbar } from "@/components/landing/navbar";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/footer";

export default function FeaturesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24">
        <FeaturesSection />
      </div>
      <Footer />
    </main>
  );
}
