"use client"

import { useRef, useEffect } from "react"
import { MicOff, User, Maximize2, Camera, CameraOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoGridProps {
  localStream: MediaStream | null
  remoteStreams: MediaStream[]
  isMicOn: boolean
  isCameraOn: boolean
  layoutMode: "equal" | "focus"
}

export function VideoGrid({ localStream, remoteStreams, isMicOn, isCameraOn, layoutMode }: VideoGridProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  const totalStreams = remoteStreams.length + (localStream ? 1 : 0)

  // Calculate grid layout for Google Meet style
  const getGridLayout = () => {
    if (layoutMode === "focus" && remoteStreams.length > 0) {
      return {
        container: "h-full flex flex-col gap-2",
        main: "flex-1 min-h-0",
        thumbnails: "flex gap-2 h-20 overflow-x-auto",
      }
    }

    // Equal layout - responsive grid
    if (totalStreams === 1) return "h-full flex items-center justify-center"
    if (totalStreams === 2) return "h-full grid grid-cols-1 md:grid-cols-2 gap-2"
    if (totalStreams <= 4) return "h-full grid grid-cols-2 gap-2"
    if (totalStreams <= 6) return "h-full grid grid-cols-2 md:grid-cols-3 gap-2"
    return "h-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
  }

  const gridLayout = getGridLayout()

  // Focus mode layout
  if (layoutMode === "focus" && remoteStreams.length > 0) {
    const mainStream = remoteStreams[0] || localStream
    const thumbnailStreams =
      localStream && remoteStreams.length > 0 ? [localStream, ...remoteStreams.slice(1)] : remoteStreams.slice(1)

    return (
      <div className={typeof gridLayout === "object" ? gridLayout.container : "h-full"}>
        {/* Main video */}
        <div className="flex-1 min-h-0 relative bg-gray-900 rounded-lg overflow-hidden">
          {mainStream ? (
            <VideoElement
              stream={mainStream}
              isLocal={mainStream === localStream}
              isMicOn={mainStream === localStream ? isMicOn : true}
              isCameraOn={mainStream === localStream ? isCameraOn : true}
              label={mainStream === localStream ? "You" : "Participant"}
              isMain={true}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No video stream</p>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail videos */}
        {thumbnailStreams.length > 0 && (
          <div className="flex gap-2 h-20 overflow-x-auto">
            {thumbnailStreams.map((stream, index) => (
              <div key={index} className="flex-shrink-0 w-28 h-20 relative bg-gray-900 rounded-lg overflow-hidden">
                <VideoElement
                  stream={stream}
                  isLocal={stream === localStream}
                  isMicOn={stream === localStream ? isMicOn : true}
                  isCameraOn={stream === localStream ? isCameraOn : true}
                  label={stream === localStream ? "You" : `P${index + 1}`}
                  isMain={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Single participant view
  if (totalStreams === 1) {
    return (
      <div className={typeof gridLayout === "string" ? gridLayout : "h-full flex items-center justify-center"}>
        <div className="w-full max-w-2xl aspect-video relative bg-gray-900 rounded-lg overflow-hidden">
          {localStream ? (
            <VideoElement
              stream={localStream}
              isLocal={true}
              isMicOn={isMicOn}
              isCameraOn={isCameraOn}
              label="You"
              isMain={true}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Camera access required</p>
                <p className="text-sm">Please allow camera and microphone access</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Equal layout for multiple participants
  return (
    <div className={typeof gridLayout === "string" ? gridLayout : "h-full grid grid-cols-2 gap-2"}>
      {/* Local stream */}
      {localStream && (
        <div className="relative bg-gray-900 rounded-lg overflow-hidden min-h-0">
          <VideoElement
            stream={localStream}
            isLocal={true}
            isMicOn={isMicOn}
            isCameraOn={isCameraOn}
            label="You"
            isMain={false}
          />
        </div>
      )}

      {/* Remote streams */}
      {remoteStreams.map((stream, index) => (
        <div key={index} className="relative bg-gray-900 rounded-lg overflow-hidden min-h-0">
          <VideoElement
            stream={stream}
            isLocal={false}
            isMicOn={true}
            isCameraOn={true}
            label={`Participant ${index + 1}`}
            isMain={false}
          />
        </div>
      ))}
    </div>
  )
}

// Individual video element component
interface VideoElementProps {
  stream: MediaStream
  isLocal: boolean
  isMicOn: boolean
  isCameraOn: boolean
  label: string
  isMain: boolean
}

function VideoElement({ stream, isLocal, isMicOn, isCameraOn, label, isMain }: VideoElementProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative w-full h-full group">
      {/* Video element */}
      {isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video to prevent feedback
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <CameraOff className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-gray-400">Camera off</p>
          </div>
        </div>
      )}

      {/* Video controls overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">{label}</span>
            {!isMicOn && (
              <div className="bg-red-500 text-white p-1 rounded-full">
                <MicOff className="h-3 w-3" />
              </div>
            )}
          </div>

          {isMain && (
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1">
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
