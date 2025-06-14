"use client"

import { motion } from "framer-motion"
import { Code, Database, Zap, Shield, Globe, Cpu } from "lucide-react"

const techStack = [
  {
    icon: <Code className="h-6 w-6" />,
    name: "Next.js",
    description: "React framework for production",
    color: "from-gray-900 to-gray-700",
  },
  {
    icon: <Database className="h-6 w-6" />,
    name: "WebRTC",
    description: "Real-time communication",
    color: "from-blue-600 to-blue-800",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    name: "Socket.IO",
    description: "Real-time bidirectional events",
    color: "from-green-600 to-green-800",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    name: "TypeScript",
    description: "Type-safe development",
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    name: "HLS Streaming",
    description: "Adaptive bitrate streaming",
    color: "from-purple-600 to-purple-800",
  },
  {
    icon: <Cpu className="h-6 w-6" />,
    name: "Mediasoup",
    description: "WebRTC SFU library",
    color: "from-red-600 to-red-800",
  },
]

export function TechStackSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Built with Modern Technology
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            StreamConnect is powered by cutting-edge technologies to deliver the best streaming experience.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
          {techStack.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-card border hover:shadow-card transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tech.color} flex items-center justify-center mb-3 text-white`}
              >
                {tech.icon}
              </div>
              <h3 className="font-semibold text-sm mb-1">{tech.name}</h3>
              <p className="text-xs text-muted-foreground">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
