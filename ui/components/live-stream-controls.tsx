"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Radio, Square, Loader2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface LiveStreamControlsProps {
  isLive: boolean
  onGoLive: (title: string, description: string) => void
  onEndLive: () => void
  isLoading: boolean
}

export function LiveStreamControls({ isLive, onGoLive, onEndLive, isLoading }: LiveStreamControlsProps) {
  const [showGoLiveDialog, setShowGoLiveDialog] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleGoLive = () => {
    onGoLive(title || "Live Stream", description || "Live streaming session")
    setShowGoLiveDialog(false)
    setTitle("")
    setDescription("")
  }

  if (isLive) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2"
      >
        {/* Live indicator */}
        <div className="flex items-center gap-2 bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          LIVE
        </div>

        {/* End live button */}
        <Button
          variant="destructive"
          size="sm"
          onClick={onEndLive}
          disabled={isLoading}
          className="gap-2 bg-red-600 hover:bg-red-700 shadow-lg"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
          End Stream
        </Button>
      </motion.div>
    )
  }

  return (
    <Dialog open={showGoLiveDialog} onOpenChange={setShowGoLiveDialog}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            className="gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg border-0"
          >
            <Radio className="h-4 w-4" />
            Go Live
            <Sparkles className="h-3 w-3" />
          </Button>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <Radio className="h-4 w-4 text-white" />
            </div>
            Start Live Stream
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">Ready to go live?</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-300">
              Your stream will be broadcast to viewers on the watch page. Make sure you're ready!
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Stream Title *
              </Label>
              <Input
                id="title"
                placeholder="What's your stream about?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-2 focus:border-red-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Tell viewers what to expect..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="border-2 focus:border-red-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleGoLive}
              disabled={isLoading || !title.trim()}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Radio className="h-4 w-4" />
                  Start Live Stream
                </>
              )}
            </Button>

            <Button variant="outline" onClick={() => setShowGoLiveDialog(false)} className="border-2">
              Cancel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Your stream will appear on the watch page immediately after going live
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
