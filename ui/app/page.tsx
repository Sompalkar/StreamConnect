import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Video, Tv, MessageSquare, Cloud, Zap, Shield } from "lucide-react"
import { FeatureCard } from "@/components/feature-card"
import { HeroSection } from "@/components/hero-section"
import { TestimonialSection } from "@/components/testimonial-section"
import { StatsSection } from "@/components/stats-section"
import { CTASection } from "@/components/cta-section"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-primary rounded-full opacity-70 animate-pulse"></div>
              <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
                <Video className="h-4 w-4 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
              StreamConnect
            </h1>
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/stream" className="text-sm font-medium hover:text-primary transition-colors">
              Stream
            </Link>
            <Link href="/watch" className="text-sm font-medium hover:text-primary transition-colors">
              Watch
            </Link>
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/stream">
              <Button size="sm" variant="outline" className="hidden md:flex">
                Start Streaming
              </Button>
            </Link>
            <Link href="/watch">
              <Button size="sm">Watch Now</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <HeroSection />

        <section id="features" className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Streaming Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need for professional-quality streaming and viewing experiences, with more features
                coming soon.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Video className="h-6 w-6" />}
                title="WebRTC Streaming"
                description="Low-latency, high-quality video streaming using the latest WebRTC technology."
              />
              <FeatureCard
                icon={<Tv className="h-6 w-6" />}
                title="HLS Playback"
                description="Broadcast-quality streaming with adaptive bitrate for viewers on any device."
                badge="Enhanced"
              />
              <FeatureCard
                icon={<MessageSquare className="h-6 w-6" />}
                title="Real-time Chat"
                description="Communicate with other streamers through integrated P2P messaging."
                badge="New"
              />
              <FeatureCard
                icon={<Cloud className="h-6 w-6" />}
                title="Cloud Storage"
                description="Store your streams in the cloud for later access and sharing."
                badge="Coming Soon"
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="AI Transcription"
                description="Automatic transcription of your streams for improved accessibility."
                badge="Coming Soon"
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                title="Secure Streaming"
                description="End-to-end encryption ensures your streams remain private and secure."
              />
            </div>
          </div>
        </section>

        <StatsSection />

        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                StreamConnect makes it easy to create and watch high-quality streams in just a few steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Create a Stream</h3>
                <p className="text-muted-foreground">
                  Start a new stream with just a click. Allow camera and microphone access to begin.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Invite Others</h3>
                <p className="text-muted-foreground">
                  Share your stream link with others to join your WebRTC room or watch via HLS.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Interact & Engage</h3>
                <p className="text-muted-foreground">
                  Chat with participants, share your screen, and create engaging content together.
                </p>
              </div>
            </div>
          </div>
        </section>

        <TestimonialSection />
        <CTASection />
      </main>

      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-primary rounded-full opacity-70"></div>
                  <div className="absolute inset-1 bg-muted rounded-full flex items-center justify-center">
                    <Video className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <h1 className="text-xl font-bold">StreamConnect</h1>
              </Link>
              <p className="text-sm text-muted-foreground mb-4">
                Professional-quality streaming and viewing experiences for everyone.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/stream" className="text-muted-foreground hover:text-primary transition-colors">
                    Stream
                  </Link>
                </li>
                <li>
                  <Link href="/watch" className="text-muted-foreground hover:text-primary transition-colors">
                    Watch
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} StreamConnect. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
