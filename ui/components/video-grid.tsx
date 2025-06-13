"use client"

import { useRef, useEffect } from "react"
import { MicOff, User, Maximize2 } from "lucide-react"
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

  // Calculate grid layout based on mode and number of streams
  const getGridLayout = () => {
    const totalStreams = remoteStreams.length + (localStream ? 1 : 0)

    if (layoutMode === "focus") {
      return {
        container: "flex flex-col h-full gap-2",
        main: "flex-1",
        thumbnails: "flex gap-2 h-24",
      }
    }

    // Equal layout
    if (totalStreams <= 1) return "grid grid-cols-1 h-full"
    if (totalStreams === 2) return "grid grid-cols-2 h-full gap-2"
    if (totalStreams <= 4) return "grid grid-cols-2 grid-rows-2 h-full gap-2"
    return "grid grid-cols-3 grid-rows-2 h-full gap-2"
  }

  const gridLayout = getGridLayout()

  // Focus mode layout
  if (layoutMode === "focus") {
    const mainStream = remoteStreams[0] || localStream
    const thumbnailStreams =
      localStream && remoteStreams.length > 0 ? [localStream, ...remoteStreams.slice(1)] : remoteStreams.slice(1)

    return (
      <div className={typeof gridLayout === "object" ? gridLayout.container : "h-full"}>
        {/* Main video */}
        <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
          {mainStream ? (
            <VideoElement
              stream={mainStream}
              isLocal={mainStream === localStream}
              isMicOn={mainStream === localStream ? isMicOn : true}
              isCameraOn={mainStream === localStream ? isCameraOn : true}
              label={mainStream === localStream ? "You (Main)" : "Participant (Main)"}
              isMain={true}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>No video stream</p>
            </div>
          )}
        </div>

        {/* Thumbnail videos */}
        {thumbnailStreams.length > 0 && (
          <div className="flex gap-2 h-24">
            {thumbnailStreams.map((stream, index) => (
              <div key={index} className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
                <VideoElement
                  stream={stream}
                  isLocal={stream === localStream}
                  isMicOn={stream === localStream ? isMicOn : true}
                  isCameraOn={stream === localStream ? isCameraOn : true}
                  label={stream === localStream ? "You" : `Participant ${index + 1}`}
                  isMain={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Equal layout
  return (
    <div className={typeof gridLayout === "string" ? gridLayout : "grid grid-cols-2 h-full gap-2"}>
      {/* Local stream */}
      {localStream && (
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
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
        <div key={index} className="relative bg-gray-900 rounded-lg overflow-hidden">
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

      {/* Placeholder when no streams */}
      {!localStream && remoteStreams.length === 0 && (
        <div className="col-span-full flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Camera access required</p>
          </div>
        </div>
      )}

      {/* Waiting for others placeholder */}
      {localStream && remoteStreams.length === 0 && (
        <div className="flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Waiting for others to join...</p>
          </div>
        </div>
      )}
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
    <>
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local video to prevent feedback
        className={`w-full h-full object-cover ${!isCameraOn ? "hidden" : ""}`}
      />

      {/* Camera off placeholder */}
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="h-8 w-8" />
            </div>
            <p className="text-sm">{label}</p>
          </div>
        </div>
      )}

      {/* Video controls overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
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
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
