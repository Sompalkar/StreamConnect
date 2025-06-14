"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Quote, Star } from "lucide-react"
import { motion } from "framer-motion"

const testimonials = [
  {
    quote:
      "StreamConnect has transformed how we conduct our virtual events. The quality is exceptional and the real-time interaction is game-changing.",
    author: "Sarah Johnson",
    role: "Event Manager",
    company: "GlobalEvents Inc.",
    rating: 5,
    avatar: "SJ",
  },
  {
    quote:
      "As an educator, I needed a reliable platform for my online classes. StreamConnect delivers with its low-latency streaming and intuitive interface.",
    author: "Dr. Michael Chen",
    role: "Professor",
    company: "Tech University",
    rating: 5,
    avatar: "MC",
  },
  {
    quote:
      "The combination of WebRTC and HLS gives us flexibility for different audience needs. Our webinars have never been more engaging.",
    author: "Alex Rodriguez",
    role: "Marketing Director",
    company: "Innovate Solutions",
    rating: 5,
    avatar: "AR",
  },
  {
    quote:
      "Simple setup, powerful features, and excellent performance. StreamConnect is exactly what we needed for our remote team meetings.",
    author: "Emily Davis",
    role: "Team Lead",
    company: "Remote First Co.",
    rating: 5,
    avatar: "ED",
  },
  {
    quote:
      "The room-based system with unique codes makes it so easy to manage different streaming sessions. Highly recommended!",
    author: "James Wilson",
    role: "Content Creator",
    company: "Creative Studios",
    rating: 5,
    avatar: "JW",
  },
  {
    quote: "Outstanding video quality and the chat feature keeps our audience engaged throughout the entire stream.",
    author: "Lisa Thompson",
    role: "Community Manager",
    company: "Social Media Hub",
    rating: 5,
    avatar: "LT",
  },
]

export function TestimonialSection() {
  return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover how StreamConnect is helping creators and businesses connect with their audiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-2 border-primary/10 hover:border-primary/20 transition-colors shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <p className="text-sm mb-6 leading-relaxed">{testimonial.quote}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                      <span className="font-bold text-primary-foreground text-sm">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
