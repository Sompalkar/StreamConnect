"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"

interface StatProps {
  value: number
  label: string
  suffix?: string
  duration?: number
}

function Stat({ value, label, suffix = "", duration = 2000 }: StatProps) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  })

  useEffect(() => {
    if (inView) {
      let start = 0
      const end = value
      const increment = end / (duration / 16) // 60fps
      const timer = setInterval(() => {
        start += increment
        if (start > end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [inView, value, duration])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold mb-2">
        {count}
        {suffix}
      </div>
      <p className="text-muted-foreground">{label}</p>
    </motion.div>
  )
}

export function StatsSection() {
  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat value={10000} label="Active Users" suffix="+" />
          <Stat value={5000} label="Streams Created" suffix="+" />
          <Stat value={99} label="Uptime" suffix="%" />
          <Stat value={24} label="Support" suffix="/7" />
        </div>
      </div>
    </section>
  )
}
