"use client"

import { useRef, useEffect } from "react"
import { MicOff, User } from "lucide-react"

interface VideoGridProps {
  localStream: MediaStream | null
  remoteStreams: MediaStream[]
  isMicOn: boolean
  isCameraOn: boolean
}

export function VideoGrid({ localStream, remoteStreams, isMicOn, isCameraOn }: VideoGridProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Calculate grid columns based on number of participants
  const getGridClass = () => {
    const totalStreams = remoteStreams.length + (localStream ? 1 : 0)
    if (totalStreams <= 1) return "grid-cols-1"
    if (totalStreams === 2) return "grid-cols-2"
    if (totalStreams <= 4) return "grid-cols-2"
    return "grid-cols-3"
  }

  return (
    <div className={`grid ${getGridClass()} gap-4`}>
      {localStream && (
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-primary">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!isCameraOn ? "hidden" : ""}`}
          />

          {!isCameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
          )}

          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <div className="bg-black/50 text-white px-2 py-1 rounded-md text-sm">You</div>
            {!isMicOn && (
              <div className="bg-destructive/80 text-white p-1 rounded-full">
                <MicOff className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      )}

      {remoteStreams.map((stream, index) => (
        <RemoteVideo key={index} stream={stream} index={index} />
      ))}

      {/* Placeholder videos when no remote streams */}
      {remoteStreams.length === 0 && localStream && (
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          <p className="text-muted-foreground">Waiting for others to join...</p>
        </div>
      )}

      {!localStream && !remoteStreams.length && (
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          <p className="text-muted-foreground">Camera access required</p>
        </div>
      )}
    </div>
  )
}

interface RemoteVideoProps {
  stream: MediaStream
  index: number
}

function RemoteVideo({ stream, index }: RemoteVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Check if audio track is enabled (not muted)
  const audioTracks = stream.getAudioTracks()
  const isAudioEnabled = audioTracks.length > 0 && audioTracks[0].enabled

  return (
    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />

      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <div className="bg-black/50 text-white px-2 py-1 rounded-md text-sm">Participant {index + 1}</div>
        {!isAudioEnabled && (
          <div className="bg-destructive/80 text-white p-1 rounded-full">
            <MicOff className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  )
}
