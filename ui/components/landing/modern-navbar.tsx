"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Video, Menu, X } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { motion, AnimatePresence } from "framer-motion"

export function ModernNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 gradient-primary rounded-full opacity-70 animate-pulse-slow"></div>
              <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
                <Video className="h-4 w-4 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              StreamConnect
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link
              href="/stream"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
            >
              Stream
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/watch"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
            >
              Watch
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
            >
              Testimonials
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/stream">
              <Button size="sm" variant="outline" className="border-primary/20 hover:bg-primary/10">
                Start Streaming
              </Button>
            </Link>
            <Link href="/watch">
              <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow">
                Watch Now
              </Button>
            </Link>
            <ModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 border-t"
            >
              <nav className="flex flex-col gap-4 pt-4">
                <Link
                  href="/stream"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Stream
                </Link>
                <Link
                  href="/watch"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Watch
                </Link>
                <Link
                  href="#features"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#testimonials"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Testimonials
                </Link>
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <Link href="/stream" onClick={() => setIsOpen(false)}>
                    <Button size="sm" variant="outline" className="w-full">
                      Start Streaming
                    </Button>
                  </Link>
                  <Link href="/watch" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full gradient-primary text-primary-foreground">
                      Watch Now
                    </Button>
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
