import { JSX } from "react";
import "./style.css";
export interface VoiceRecorderProps {
    onDataRecorded?: (data: {
        blob: Blob;
        url: string;
        type: string;
        isRecording: boolean;
        size?: number;
    }) => void;
    duration?: number;
    compressionLevel?: 'none' | 'low' | 'medium' | 'high';
}
export declare function VoiceRecorder({ onDataRecorded, duration, compressionLevel, }: VoiceRecorderProps): JSX.Element | null;
interface PreviewVoiceNoteProps {
    audioUrl: string | null;
}
export declare function PreviewVoiceNote({ audioUrl, }: PreviewVoiceNoteProps): JSX.Element;
export declare function RecordingStatus({ isRecording }: {
    isRecording: boolean;
}): false | JSX.Element;
export declare function AudioSize(audioData: {
    size: number | null;
}): string;
export {};
