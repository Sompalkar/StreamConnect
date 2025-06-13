import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function StreamHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
            StreamConnect
          </h1>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/stream">
            <Button variant="ghost" size="sm">
              Stream
            </Button>
          </Link>
          <Link href="/watch">
            <Button variant="ghost" size="sm">
              Watch
            </Button>
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}
