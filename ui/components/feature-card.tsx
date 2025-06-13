  "use client"

import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  badge?: string
}

export function FeatureCard({ icon, title, description, badge }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 h-full">
        <CardContent className="p-6">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <div className="text-primary">{icon}</div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold">{title}</h3>
            {badge && (
              <Badge
                variant={badge === "New" ? "default" : badge === "Coming Soon" ? "outline" : "secondary"}
                className="ml-2"
              >
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
