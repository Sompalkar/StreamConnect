"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const testimonials = [
  {
    quote:
      "StreamConnect has transformed how we conduct our virtual events. The quality is exceptional and the real-time interaction is game-changing.",
    author: "Sarah Johnson",
    role: "Event Manager",
    company: "GlobalEvents Inc.",
  },
  {
    quote:
      "As an educator, I needed a reliable platform for my online classes. StreamConnect delivers with its low-latency streaming and intuitive interface.",
    author: "Dr. Michael Chen",
    role: "Professor",
    company: "Tech University",
  },
  {
    quote:
      "The combination of WebRTC and HLS gives us flexibility for different audience needs. Our webinars have never been more engaging.",
    author: "Alex Rodriguez",
    role: "Marketing Director",
    company: "Innovate Solutions",
  },
]

export function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover how StreamConnect is helping creators and businesses connect with their audiences.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-2 border-primary/10">
                  <CardContent className="p-8">
                    <Quote className="h-12 w-12 text-primary/30 mb-6" />
                    <p className="text-xl mb-6">{testimonials[currentIndex].quote}</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                        <span className="font-bold text-primary">{testimonials[currentIndex].author.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-bold">{testimonials[currentIndex].author}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonials[currentIndex].role}, {testimonials[currentIndex].company}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center mt-8 gap-2">
              <Button variant="outline" size="icon" onClick={prev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {testimonials.map((_, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className={`w-8 h-8 p-0 ${index === currentIndex ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  {index + 1}
                </Button>
              ))}
              <Button variant="outline" size="icon" onClick={next}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
