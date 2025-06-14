"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, Users, Eye, Clock } from "lucide-react"
import type { Room } from "@/lib/store"

interface RoomSettingsProps {
  room: Room
  isCreator: boolean
  onClose: () => void
  onUpdateRoom: (title: string, description: string) => void
}

export function RoomSettings({ room, isCreator, onClose, onUpdateRoom }: RoomSettingsProps) {
  const [title, setTitle] = useState(room.title || "")
  const [description, setDescription] = useState(room.description || "")
  const [allowRecording, setAllowRecording] = useState(false)
  const [isPublic, setIsPublic] = useState(true)

  const handleSave = () => {
    onUpdateRoom(title, description)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Room Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Room Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Room Information</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Room Code</p>
                  <p className="text-muted-foreground">{room.roomCode}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Eye className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Watch Code</p>
                  <p className="text-muted-foreground">{room.watchCode}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg col-span-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-muted-foreground">{new Date(room.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Editable Settings (Creator Only) */}
          {isCreator && (
            <div className="space-y-4">
              <h3 className="font-semibold">Stream Settings</h3>

              <div className="space-y-2">
                <Label htmlFor="room-title">Stream Title</Label>
                <Input
                  id="room-title"
                  placeholder="Enter stream title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-description">Description</Label>
                <Textarea
                  id="room-description"
                  placeholder="Describe your stream"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-stream">Public Stream</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow your stream to be discovered on the watch page
                    </p>
                  </div>
                  <Switch id="public-stream" checked={isPublic} onCheckedChange={setIsPublic} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-recording">Allow Recording</Label>
                    <p className="text-sm text-muted-foreground">Let participants record the stream</p>
                  </div>
                  <Switch id="allow-recording" checked={allowRecording} onCheckedChange={setAllowRecording} />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {isCreator && (
              <Button onClick={handleSave} className="flex-1 gradient-primary">
                Save Changes
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className={isCreator ? "" : "flex-1"}>
              {isCreator ? "Cancel" : "Close"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
