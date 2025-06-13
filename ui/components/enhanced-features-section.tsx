"use client"

import type React from "react"

import { useState } from "react"
import { Video, Tv, MessageSquare, Cloud, Zap, Shield, Users, Sparkles, Camera, Monitor } from "lucide-react"
import { motion } from "framer-motion"

// Enhanced feature card with vibrant colors and animations
function VibrantFeatureCard({
  icon,
  title,
  description,
  gradient,
  delay = 0,
  badge,
}: {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
  delay?: number
  badge?: string
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Glowing background effect */}
      <div
        className={`absolute inset-0 ${gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
      ></div>

      {/* Main card */}
      <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500">
        {/* Icon container with gradient */}
        <div
          className={`w-16 h-16 rounded-2xl ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
        >
          <div className="text-white text-2xl">{icon}</div>
        </div>

        {/* Badge */}
        {badge && (
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                badge === "New"
                  ? "bg-green-100 text-green-700"
                  : badge === "Coming Soon"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {badge}
            </span>
          </div>
        )}

        {/* Content */}
        <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>

        {/* Animated arrow */}
        <motion.div
          className="mt-4 flex items-center text-sm font-medium"
          animate={{ x: isHovered ? 5 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <span
            className={`bg-gradient-to-r ${gradient.replace("bg-gradient-to-r", "")} text-transparent bg-clip-text`}
          >
            Learn more →
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function EnhancedFeaturesSection() {
  return (
    <section
      id="features"
      className="py-24 bg-gradient-to-b from-white via-purple-50/30 to-white relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header with enhanced styling */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Powerful Features</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text">
              Everything You Need
            </span>
            <br />
            <span className="text-gray-900">for Perfect Streaming</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From WebRTC streaming to HLS playback, we've got all the tools you need to create engaging,
            professional-quality streaming experiences.
          </p>
        </motion.div>

        {/* Features grid with vibrant cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <VibrantFeatureCard
            icon={<Video />}
            title="WebRTC Streaming"
            description="Ultra-low latency peer-to-peer video streaming with crystal clear quality. Perfect for real-time interactions and live conversations."
            gradient="bg-gradient-to-r from-purple-500 to-purple-600"
            delay={0.1}
          />

          <VibrantFeatureCard
            icon={<Tv />}
            title="HLS Broadcast"
            description="Scalable HLS streaming for unlimited viewers. Watch streams on any device with adaptive bitrate streaming."
            gradient="bg-gradient-to-r from-blue-500 to-blue-600"
            delay={0.2}
            badge="Enhanced"
          />

          <VibrantFeatureCard
            icon={<MessageSquare />}
            title="Real-time Chat"
            description="Instant P2P messaging between streamers with emoji support and message history. Stay connected while streaming."
            gradient="bg-gradient-to-r from-green-500 to-green-600"
            delay={0.3}
            badge="New"
          />

          <VibrantFeatureCard
            icon={<Users />}
            title="Room Management"
            description="Create private rooms with unique codes. Share room codes for streaming or watch codes for viewing."
            gradient="bg-gradient-to-r from-pink-500 to-pink-600"
            delay={0.4}
          />

          <VibrantFeatureCard
            icon={<Monitor />}
            title="Layout Switching"
            description="Switch between focus mode and equal split layouts. Customize your viewing experience on the fly."
            gradient="bg-gradient-to-r from-indigo-500 to-indigo-600"
            delay={0.5}
            badge="New"
          />

          <VibrantFeatureCard
            icon={<Shield />}
            title="Secure Streaming"
            description="End-to-end encryption for all communications. Your streams and chats remain private and secure."
            gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
            delay={0.6}
          />
        </div>

        {/* Coming Soon Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Coming Soon</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're constantly working on new features to make your streaming experience even better.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2">AI Transcription</h4>
              <p className="text-sm text-gray-600">Automatic real-time transcription of your streams</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Cloud Storage</h4>
              <p className="text-sm text-gray-600">Save and replay your streams in the cloud</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-400 to-violet-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Screen Sharing</h4>
              <p className="text-sm text-gray-600">Share your screen during live streams</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
