"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageSquare } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ChatMessage } from "@/lib/store"

interface ChatPanelProps {
  messages: ChatMessage[]
  sendMessage: (text: string) => void
  isConnected: boolean
}

export function ChatPanel({ messages, sendMessage, isConnected }: ChatPanelProps) {
  const [message, setMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && isConnected) {
      sendMessage(message.trim())
      setMessage("")
    }
  }

  return (
    <Card className="h-full flex flex-col bg-card shadow-card border-2 border-primary/10">
      {/* Chat header */}
      <CardHeader className="px-4 py-3 border-b bg-muted/30">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Chat
        </CardTitle>
      </CardHeader>

      {/* Messages area */}
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center p-4">
              <div className="text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No messages yet</p>
                <p className="text-sm mt-1">Start the conversation!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.isLocal ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.isLocal ? "gradient-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {!msg.isLocal && <div className="text-xs font-medium mb-1 opacity-70">{msg.sender}</div>}
                    <div className="break-words">{msg.text}</div>
                    <div className={`text-xs mt-1 text-right ${msg.isLocal ? "opacity-70" : "text-muted-foreground"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Message input */}
      <CardFooter className="p-4 border-t bg-muted/30">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder={isConnected ? "Type a message..." : "Join stream to chat"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isConnected}
            className="flex-1 border-2 focus:border-primary"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!isConnected || !message.trim()}
            className="gradient-primary text-primary-foreground shadow-glow"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
