import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Video } from "lucide-react"

export function StreamHeader() {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
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
        <nav className="flex items-center gap-4">
          <Link href="/stream">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              Stream
            </Button>
          </Link>
          <Link href="/watch">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              Watch
            </Button>
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}
