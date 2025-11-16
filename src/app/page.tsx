import { HandGestureDetector } from "@/components/HandGestureDetector";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black text-white">
      <HandGestureDetector />
    </main>
  );
}
