# React Voice Recorder with Compression

A lightweight, customizable React voice recorder component with automatic audio compression.

## Features

- 🎙️ Simple voice recording with automatic compression
- ⏱️ Configurable recording duration
- 🗜️ Multiple compression levels (none, low, medium, high)
- 🔊 Built-in audio playback
- 📊 File size reporting
- 🎛️ Audio enhancement (noise suppression, echo cancellation)
- 📱 Mobile-friendly and responsive

## Installation

```bash
npm install @ananay-nag/react-voice-recorder
# or
yarn add @ananay-nag/react-voice-recorder
```

## Components

### VoiceRecorder

The primary component that handles recording audio with compression.

```jsx
import { VoiceRecorder } from '@ananay-nag/react-voice-recorder';

function MyRecorder() {
  const handleDataRecorded = (data) => {
    console.log('Audio recorded:', data);
    // data contains: blob, url, type, isRecording, size
  };

  return (
    <VoiceRecorder 
      onDataRecorded={handleDataRecorded} 
      duration={60} 
      compressionLevel="medium" 
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onDataRecorded` | function | - | Callback function that receives recorded audio data |
| `duration` | number | 60 | Maximum recording duration in seconds |
| `compressionLevel` | string | 'medium' | Compression level: 'none', 'low', 'medium', or 'high' |

#### Data Structure

The `onDataRecorded` callback receives an object with:

```typescript
{
  blob: Blob;           // The audio data blob
  url: string;          // Object URL for the audio blob
  type: string;         // MIME type of the audio (e.g., "audio/webm")
  isRecording: boolean; // Recording status
  size?: number;        // File size in KB
}
```

### PreviewVoiceNote

Component for playing back recorded audio with file information.

```jsx
import { PreviewVoiceNote } from '@ananay-nag/react-voice-recorder';

function AudioPlayer({ audioUrl }) {
  return (
    <PreviewVoiceNote 
      audioUrl={audioUrl} 
    />
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `audioUrl` | string \| null | URL to the audio file |

### RecordingStatus

A simple component that displays a recording indicator.

```jsx
import { RecordingStatus } from '@ananay-nag/react-voice-recorder';

function MyRecordingApp({ isCurrentlyRecording }) {
  return (
    <div>
      <RecordingStatus isRecording={isCurrentlyRecording} />
    </div>
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `isRecording` | boolean | Whether recording is in progress |

### AudioSize

A utility function to calculate the size of an audio blob in KB.

```jsx
import { AudioSize } from '@ananay-nag/react-voice-recorder';

function MyAudioInfo({ audioData }) {
  const sizeInKB = AudioSize(audioData);
  
  return <div>File size: {sizeInKB} KB</div>;
}
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `audioData` | { blob: Blob \| null } | Object containing an audio blob |

## Compression Details

The component supports four compression levels:

| Level | Format | Bitrate | Description |
|-------|--------|---------|-------------|
| none | WAV | - | Uncompressed audio for highest quality |
| low | WebM | 96 kbps | Low compression, good quality |
| medium | WebM | 64 kbps | Balanced compression (default) |
| high | WebM | 32 kbps | High compression, smaller file size |

## Complete Example

```jsx
import React, { useState } from "react";
import {
  PreviewVoiceNote,
  VoiceRecorder,
  RecordingStatus,
  AudioSize,
} from "@ananay-nag/react-voice-recorder";

function App() {
  const [audioData, setAudioData] = useState<{
    blob: Blob;
    url: string;
    isRecording: boolean;
    size?: number | 0;
  } | null>(null);

  const handleRecordedData = (
    data: {
      blob: Blob;
      url: string;
      type: string;
      isRecording: boolean;
      size?: number;
    }
  ) => {
    setAudioData(data);

    // Now you can do whatever you want with the data:
    // - Store it in state
    // - Send it to a server
    // - Process it further

    // Example of sending to server:
    // sendToServer(data.blob);
  };

  return (
    <div className="App">
      <h1>My Voice Recording App</h1>
      <VoiceRecorder
        onDataRecorded={handleRecordedData}
        duration={10}
        compressionLevel={"low"}
      />
      <RecordingStatus isRecording={audioData?.isRecording ?? false} />

      {audioData && (
        <PreviewVoiceNote audioUrl={audioData?.url ?? null}></PreviewVoiceNote>
      )}

      {audioData && (
        <div>
          {audioData.size!= 0 && (
            <p>
              Size: <AudioSize size={audioData?.blob?.size ?? null} />
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Example function to send data to server
// function sendToServer(audioBlob: Blob) {
//   const formData = new FormData();
//   formData.append('audio', audioBlob, 'recording.wav');

//   fetch('/api/upload-audio', {
//     method: 'POST',
//     body: formData
//   })
//   .then(response => response.json())
//   .then(data => console.log('Success:', data))
//   .catch(error => console.error('Error:', error));
// }

export default App;

```

## Browser Compatibility

- Chrome 49+
- Firefox 53+
- Safari 11+
- Edge 79+

## CSS Styling

The component includes basic styling, but you can customize it by overriding the CSS classes:

```css
/* Example custom styling */
.voice-recorder-container {
  background-color: #f7f9fc;
  border-radius: 8px;
  padding: 20px;
}

.record-button {
  font-weight: bold;
}

.audio-player {
  width: 100%;
  margin-top: 10px;
}
```

## License

ISC