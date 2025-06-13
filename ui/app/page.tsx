import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Video } from "lucide-react"
import { HeroSection } from "@/components/hero-section"
import { TestimonialSection } from "@/components/testimonial-section"
import { StatsSection } from "@/components/stats-section"
import { CTASection } from "@/components/cta-section"
import { EnhancedFeaturesSection } from "@/components/enhanced-features-section"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with navigation */}
      <header className="border-b sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-70 animate-pulse"></div>
              <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                <Video className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
              StreamConnect
            </h1>
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/stream" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Stream
            </Link>
            <Link href="/watch" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Watch
            </Link>
            <Link href="#features" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Features
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/stream">
              <Button
                size="sm"
                variant="outline"
                className="hidden md:flex border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                Start Streaming
              </Button>
            </Link>
            <Link href="/watch">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Watch Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <HeroSection />

        {/* Enhanced Features Section with vibrant colors and animations */}
        <EnhancedFeaturesSection />

        <StatsSection />

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-b from-white to-purple-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                How It Works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                StreamConnect makes it easy to create and watch high-quality streams in just a few steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Create a Room</h3>
                <p className="text-gray-600">
                  Start a new streaming room and get a unique room code to share with participants.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Join & Stream</h3>
                <p className="text-gray-600">
                  Others can join using the room code for WebRTC streaming or get a watch code for HLS viewing.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Interact & Engage</h3>
                <p className="text-gray-600">
                  Chat with participants, switch layouts, and create engaging content together in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <TestimonialSection />
        <CTASection />
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-70"></div>
                  <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                    <Video className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <h1 className="text-xl font-bold">StreamConnect</h1>
              </Link>
              <p className="text-sm text-gray-600 mb-4">
                Professional-quality streaming and viewing experiences for everyone.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/stream" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Stream
                  </Link>
                </li>
                <li>
                  <Link href="/watch" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Watch
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Features
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} StreamConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
