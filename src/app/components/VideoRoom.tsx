import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize, Minimize } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

type VideoRoomProps = {
  roomId: string;
  onLeave: () => void;
};

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function VideoRoom({ roomId, onLeave }: VideoRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let interval: any;
    if (isConnected) {
      interval = setInterval(() => {
        setSecondsElapsed(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let alive = true;

    const startCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!alive) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const getSocketUrl = () => {
          const url = import.meta.env.VITE_API_URL;
          if (!url) return '/';
          try { return new URL(url).origin; } catch { return url; }
        };
        const socketUrl = getSocketUrl();
        const socket = io(socketUrl, { path: '/socket.io' });
        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('join-room', roomId);
        });

        socket.on('user-connected', async () => {
          // Other user joined, we create the offer
          const peer = createPeerConnection(socket);
          peerRef.current = peer;

          stream.getTracks().forEach(track => {
            peer.addTrack(track, stream);
          });

          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          socket.emit('offer', offer, roomId);
        });

        socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
          // Received an offer, create answer
          const peer = createPeerConnection(socket);
          peerRef.current = peer;

          stream.getTracks().forEach(track => {
            peer.addTrack(track, stream);
          });

          await peer.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit('answer', answer, roomId);
        });

        socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
          if (peerRef.current) {
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            setIsConnected(true);
          }
        });

        socket.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
          if (peerRef.current) {
            try {
              await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error('Error adding ice candidate', e);
            }
          }
        });

        socket.on('user-disconnected', () => {
          setIsConnected(false);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
          }
        });

      } catch (err) {
        console.error('Error accessing media devices.', err);
        alert('Could not access camera/microphone. Please check permissions.');
      }
    };

    startCall();

    return () => {
      alive = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  const createPeerConnection = (socket: Socket) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate, roomId);
      }
    };

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        if (!remoteVideoRef.current.srcObject) {
          remoteVideoRef.current.srcObject = event.streams[0] || new MediaStream([event.track]);
        } else if (!event.streams[0]) {
          (remoteVideoRef.current.srcObject as MediaStream).addTrack(event.track);
        }
        setIsConnected(true);
      }
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
        setIsConnected(false);
      } else if (peer.connectionState === 'connected') {
        setIsConnected(true);
      }
    };

    return peer;
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleLeave = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    onLeave();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#050505] flex flex-col"
    >
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        
        {/* Timer */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white font-mono font-bold tracking-wider shadow-lg border border-white/10 flex items-center gap-2 text-sm sm:text-base">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
          {formatTime(secondsElapsed)}
        </div>

        {/* Remote Video (Main) */}
        {!isConnected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#111]">
            <div className="w-16 h-16 border-4 border-[#0d5d3a] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
              Waiting for other participant to join...
            </p>
          </div>
        )}
        
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />

        {/* Local Video (PIP) */}
        <motion.div 
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.1}
          className="absolute top-6 right-6 w-32 sm:w-48 aspect-[3/4] sm:aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 z-20 cursor-move"
        >
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#222]">
              <VideoOff className="w-8 h-8 text-gray-500" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white font-semibold backdrop-blur-sm">
            You
          </div>
        </motion.div>
      </div>

      {/* Controls Bar */}
      <div className="h-20 sm:h-24 bg-[#111] border-t border-white/10 flex items-center justify-center gap-4 sm:gap-6 px-6 shrink-0">
        
        <button 
          onClick={toggleMute}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isMuted 
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button 
          onClick={toggleVideo}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isVideoOff 
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title={isVideoOff ? "Turn on camera" : "Turn off camera"}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        <button 
          onClick={() => setShowConfirmEnd(true)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-lg shadow-red-600/30 ml-2 mr-2"
          title="End Call"
        >
          <PhoneOff size={28} />
        </button>

        <button 
          onClick={toggleFullscreen}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-all shadow-lg"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>

      </div>

      <AnimatePresence>
        {showConfirmEnd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-[#111111] p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl border border-white/10">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneOff size={32} />
              </div>
              <h3 className="text-xl font-black text-[#0a2617] dark:text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>End Session?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm font-medium">Are you sure you want to end this video session?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmEnd(false)} className="flex-1 py-3 rounded-xl font-bold bg-[#fbfdfb] border border-gray-200 text-gray-700 dark:bg-[#1a1a1a] dark:border-white/10 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition">
                  Cancel
                </button>
                <button onClick={handleLeave} className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition shadow-md shadow-red-600/20">
                  End Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
