"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const faqs = [
  {
    question: "How do I create a streaming room?",
    answer:
      "Simply go to the /stream page and click 'Create Room'. You'll get a unique room code to share with participants and a watch code for viewers.",
  },
  {
    question: "What's the difference between room codes and watch codes?",
    answer:
      "Room codes are for participants who want to join the WebRTC stream and interact. Watch codes are for viewers who want to watch the stream via HLS without participating.",
  },
  {
    question: "How many people can join a room?",
    answer:
      "For WebRTC streaming, we recommend up to 4-6 active participants for optimal performance. For HLS viewing, there's no limit on the number of viewers.",
  },
  {
    question: "Do I need to install any software?",
    answer:
      "No! StreamConnect works entirely in your web browser. Just allow camera and microphone access when prompted, and you're ready to stream.",
  },
  {
    question: "Is my stream secure and private?",
    answer:
      "Yes, all WebRTC connections are encrypted end-to-end. Room codes are unique and temporary, ensuring only invited participants can join your stream.",
  },
  {
    question: "Can I record my streams?",
    answer:
      "Stream recording is coming soon! We're working on cloud storage features that will allow you to save and replay your streams.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about StreamConnect and how it works.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-border last:border-b-0">
              <button
                className="w-full py-6 flex items-center justify-between text-left hover:text-primary transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold pr-4">{faq.question}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6 text-muted-foreground leading-relaxed">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
