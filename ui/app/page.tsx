import { HeroSection } from "@/components/hero-section"
import { TestimonialSection } from "@/components/testimonial-section"
import { StatsSection } from "@/components/stats-section"
import { CTASection } from "@/components/cta-section"
import { EnhancedFeaturesSection } from "@/components/enhanced-features-section"
// import { ModernNavbar } from "@/components/modern-navbar"
import { ModernNavbar } from "@/components/landing/modern-navbar"

import { ModernFooter } from "@/components/landing/modern-footer"
import { TechStackSection } from "@/components/landing/tech-stack-section"
import { FAQSection } from "@/components/landing/faq-section"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <ModernNavbar />

      <main className="flex-1">
        <HeroSection />
        <EnhancedFeaturesSection />
        <StatsSection />
        <TechStackSection />

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                StreamConnect makes it easy to create and watch high-quality streams in just a few steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                  <span className="text-primary-foreground font-bold text-lg">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Create a Room</h3>
                <p className="text-muted-foreground">
                  Start a new streaming room and get a unique room code to share with participants.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full gradient-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                  <span className="text-primary-foreground font-bold text-lg">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Join & Stream</h3>
                <p className="text-muted-foreground">
                  Others can join using the room code for WebRTC streaming or get a watch code for HLS viewing.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                  <span className="text-primary-foreground font-bold text-lg">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Interact & Engage</h3>
                <p className="text-muted-foreground">
                  Chat with participants, switch layouts, and create engaging content together in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <TestimonialSection />
        <FAQSection />
        <CTASection />
      </main>

      <ModernFooter />
    </div>
  )
}
