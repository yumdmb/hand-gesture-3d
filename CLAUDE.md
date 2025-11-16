# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a real-time 3D hand gesture tracker that uses MediaPipe for hand landmark detection from webcam input and Three.js for 3D visualization. The application captures video from the user's webcam, detects hand landmarks using MediaPipe's hand landmarker model, and renders a real-time 3D representation of the hand.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

Development server runs on http://localhost:3000

## Architecture

### Data Flow Pipeline

1. **Video Capture** → 2. **Hand Detection** → 3. **3D Rendering**

```
WebcamFeed (video stream)
    ↓
useHandDetection hook (MediaPipe processing)
    ↓
HandGestureDetector (state management)
    ↓
Hand3D (Three.js visualization)
```

### Key Components

- **`HandGestureDetector`**: Main orchestrator component that manages video ref, hand detection state, and coordinates between webcam and 3D visualization
- **`WebcamFeed`**: Handles browser MediaStream API, camera permissions, and provides video element via callback
- **`Hand3D`**: Three.js Canvas wrapper containing the HandModel for 3D rendering
- **`HandModel`**: Core 3D rendering logic that converts MediaPipe landmarks into Three.js geometry

### Critical Hooks

**`useHandDetection(videoRef)`**: Custom hook that manages the MediaPipe hand detection lifecycle
- Loads MediaPipe WASM and model files from CDN on mount
- Uses `requestAnimationFrame` loop to process video frames continuously
- Detects 21 hand landmarks per frame and returns structured data
- Configuration: `numHands: 1`, `runningMode: "VIDEO"`, confidence thresholds at 0.5

### MediaPipe Hand Model

The application detects **21 landmarks** per hand in this specific order:
- 0: Wrist
- 1-4: Thumb (CMC, MCP, IP, Tip)
- 5-8: Index finger (MCP, PIP, DIP, Tip)
- 9-12: Middle finger
- 13-16: Ring finger
- 17-20: Pinky

**`HAND_CONNECTIONS`** in `Hand3D.tsx` defines the skeleton structure connecting these landmarks.

### 3D Coordinate Transformation

MediaPipe outputs normalized coordinates (0-1 range). The transformation to Three.js space:
```typescript
x: (landmark.x - 0.5) * 2    // Center and scale to [-1, 1]
y: -(landmark.y - 0.5) * 2   // Invert Y axis
z: -landmark.z * 2           // Scale Z depth
```

### Client-Side Components

All components use `"use client"` directive as they require browser APIs:
- WebcamFeed: `navigator.mediaDevices.getUserMedia()`
- useHandDetection: `requestAnimationFrame()`, MediaPipe WASM
- Hand3D: Three.js WebGL rendering

### Import Alias

Path alias `@/*` maps to `./src/*` (configured in tsconfig.json)

## Browser Requirements

- WebRTC support (camera access)
- WebGL support (Three.js rendering)
- Modern browser recommended: Chrome, Firefox, Safari, Edge

## MediaPipe Configuration

The hand landmarker model is loaded from Google's CDN:
- WASM files: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm`
- Model: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`

Running mode must be "VIDEO" (not "IMAGE") for webcam stream processing.
