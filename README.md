# 3D Hand Gesture Tracker

A real-time hand gesture detection and 3D visualization web application built with Next.js, MediaPipe, and Three.js.

## Features

- **Real-time Hand Detection**: Uses MediaPipe's hand landmarker model to detect hand landmarks from webcam feed
- **3D Visualization**: Renders detected hand gestures as a 3D model using Three.js and React Three Fiber
- **Interactive Controls**: Orbit controls to view the 3D hand model from different angles
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **MediaPipe**: Hand landmark detection
- **Three.js**: 3D rendering
- **React Three Fiber**: React renderer for Three.js
- **Tailwind CSS**: Styling

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

4. Allow camera access when prompted

5. Show your hand to the camera and see it visualized in 3D!

## How It Works

1. **Webcam Feed**: The application captures video from your webcam using the browser's MediaStream API
2. **Hand Detection**: MediaPipe processes each video frame to detect 21 hand landmarks
3. **3D Rendering**: The landmarks are converted to 3D coordinates and rendered using Three.js
4. **Real-time Updates**: The 3D model updates in real-time as you move your hand

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── components/
│   ├── HandGestureDetector.tsx  # Main container component
│   ├── WebcamFeed.tsx          # Webcam component
│   └── Hand3D.tsx              # 3D hand visualization
├── hooks/
│   └── useHandDetection.ts     # MediaPipe hand detection hook
└── types/
    └── hand.ts                 # TypeScript types
```

## MediaPipe Hand Landmarks

The application detects 21 hand landmarks:
- Wrist (0)
- Thumb (1-4)
- Index finger (5-8)
- Middle finger (9-12)
- Ring finger (13-16)
- Pinky (17-20)

## Browser Compatibility

This application requires:
- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- Camera access
- WebGL support

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
