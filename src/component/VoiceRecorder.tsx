import React, { useState, useRef, useEffect, JSX } from "react";
import { Mic, Square } from "lucide-react";

import "./style.css";

export interface VoiceRecorderProps {
  onDataRecorded?: (data: {
    blob: Blob;
    url: string;
    type: string;
    isRecording: boolean;
    size?: number; // Size in KB
  }) => void;
  duration?: number; // Duration prop
  compressionLevel?: 'none' | 'low' | 'medium' | 'high'; // Optional compression level
}

export function VoiceRecorder({
  onDataRecorded,
  duration = 60,
  compressionLevel = 'medium', // Default medium compression
}: VoiceRecorderProps): JSX.Element | null {
  // State to manage recording status and audio data
  const [isRecording, setIsRecording] = useState(false);
  const [, setRemainingTime] = useState(duration);
  const [, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Compression settings mapped to audio parameters
  const compressionSettings = {
    none: { 
      mimeType: 'audio/wav',
      audioBitsPerSecond: undefined 
    },
    low: { 
      mimeType: 'audio/webm',
      audioBitsPerSecond: 96000 // 96 kbps
    },
    medium: { 
      mimeType: 'audio/webm',
      audioBitsPerSecond: 64000 // 64 kbps
    },
    high: {
      mimeType: 'audio/webm',
      audioBitsPerSecond: 32000 // 32 kbps
    }
  };

  // Check if the browser supports recording
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      setError("Audio recording is not supported in this browser.");
    }
    
    // Initialize audio context
    try {
      audioContextRef.current = new (window.AudioContext)();
    } catch (err) {
      console.error("Could not create AudioContext:", err);
    }
  }, []);

  // Reset remaining time when duration prop changes
  useEffect(() => {
    if (!isRecording) {
      setRemainingTime(duration);
    }
  }, [duration, isRecording]);

  // Timer countdown effect - using precise timing
  useEffect(() => {
    if (isRecording) {
      // Use interval for more accurate countdown
      timerRef.current = window.setInterval(() => {
        const elapsedTime = Math.floor(
          startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0
        );
        const newRemainingTime = Math.max(0, duration - elapsedTime);

        setRemainingTime(newRemainingTime);

        // Stop exactly when we hit 0
        if (newRemainingTime <= 0) {
          stopRecording();
        }
      }, 100); // Update more frequently for accuracy
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, duration]);

  // Get supported mime type based on browser capabilities
  const getSupportedMimeType = () => {
    const setting = compressionSettings[compressionLevel];
    
    // First check if the specified mime type is supported
    if (setting.mimeType && MediaRecorder.isTypeSupported(setting.mimeType)) {
      return setting.mimeType;
    }
    
    // Fallback options in order of preference
    const options = [
      'audio/webm',
      'audio/ogg',
      'audio/mp4',
      'audio/wav'
    ];
    
    for (const type of options) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    // If none of the preferred types are supported, let the browser choose
    return '';
  };

  const startRecording = async () => {
    try {
      setError(null);
      // Reset any previous recordings
      audioChunksRef.current = [];
      setAudioBlob(null);
      // Set initial Data
      if (onDataRecorded) {
        onDataRecorded({
          blob: new Blob(),
          url: '',
          type: 'audio/wav',
          isRecording: true,
          size: 0
        });
      }
      // Set the start time
      startTimeRef.current = Date.now();

      // Reset timer
      setRemainingTime(duration);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Configure MediaRecorder with compression settings
      const setting = compressionSettings[compressionLevel];
      const mimeType = getSupportedMimeType();
      
      const options: MediaRecorderOptions = {
        mimeType: mimeType
      };
      
      // Only set bitrate if we're using compression
      if (compressionLevel !== 'none' && setting.audioBitsPerSecond) {
        options.audioBitsPerSecond = setting.audioBitsPerSecond;
      }
      
      console.log("Recording with options:", options);

      // Create a new MediaRecorder instance with compression options
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      // Set up event listeners
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Create a Blob from the recorded audio chunks
        if (audioChunksRef.current.length > 0) {
          // Use the appropriate MIME type for the blob
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType || 'audio/wav'
          });
          setAudioBlob(audioBlob);

          // Calculate file size in KB
          const fileSizeKB = Math.round(audioBlob.size / 1024);

          // Return the recorded data to the parent component
          if (onDataRecorded) {
            onDataRecorded({
              blob: audioBlob,
              url: URL.createObjectURL(audioBlob),
              type: mimeType || 'audio/wav',
              isRecording: isRecording,
              size: fileSizeKB
            });
          }
        }

        // Stop all audio tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      // Request data every 1000ms to get chunks during recording
      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (error: any) {
      console.error("Error accessing microphone:", error);
      setError(`Could not access microphone: ${error.message}`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error("Error stopping recording:", err);
      }
      setIsRecording(false);
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="unsupported-message">
        {error || "Audio recording is not supported in this browser."}
      </div>
    );
  }

  return (
    <div className="voice-recorder-container">
      <button
        onClick={toggleRecording}
        className={`record-button ${
          isRecording ? "record-button-recording" : "record-button-idle"
        }`}
      >
        {isRecording ? (
          <>
            <Square size={20} />
            Stop Recording
          </>
        ) : (
          <>
            <Mic size={20} />
            Start Recording
          </>
        )}
      </button>
    </div>
  );
}

interface PreviewVoiceNoteProps {
  audioUrl: string | null;
}

export function PreviewVoiceNote({ 
  audioUrl,
}: PreviewVoiceNoteProps) {
  return (
    <div className="audio-container">
      {audioUrl && (
        <>
          <audio controls src={audioUrl} className="audio-player"></audio>
          
        </>
      )}
    </div>
  );
}

export function RecordingStatus({ isRecording }: { isRecording: boolean }) {
  return (
    isRecording && (
      <div className="recording-indicator">
        <span className="recording-dot"></span>
        Recording in progress...
      </div>
    )
  );
}

export function AudioSize(audioData: { size: number | null }) {
  return ((audioData.size ?? 0) / 1024).toFixed(2);
}