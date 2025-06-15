"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageSquare, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ChatMessage } from "@/lib/store"

interface ChatPanelProps {
  messages: ChatMessage[]
  sendMessage: (text: string) => void
  isConnected: boolean
  onClose?: () => void
}

export function ChatPanel({ messages, sendMessage, isConnected, onClose }: ChatPanelProps) {
  const [message, setMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && isConnected) {
      sendMessage(message.trim())
      setMessage("")
    }
  }

  // Prevent event bubbling to avoid auto-close
  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="h-full flex flex-col bg-card" onClick={handleChatClick}>
      {/* Chat header */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Chat</h3>
          {messages.length > 0 && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">{messages.length}</span>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 min-h-0">
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
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.isLocal ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                      msg.isLocal ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {!msg.isLocal && <div className="text-xs font-medium mb-1 opacity-70">{msg.sender}</div>}
                    <div className="break-words text-sm">{msg.text}</div>
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
      </div>

      {/* Message input */}
      <div className="flex-shrink-0 p-4 border-t bg-muted/30">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder={isConnected ? "Type a message..." : "Join stream to chat"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isConnected}
            className="flex-1 border-2 focus:border-primary"
            onClick={handleChatClick}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!isConnected || !message.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
