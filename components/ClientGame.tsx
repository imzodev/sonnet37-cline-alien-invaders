'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for the Game component
// This is necessary because the game uses browser APIs like requestAnimationFrame
const Game = dynamic(() => import('./Game'), { ssr: false });

export default function ClientGame() {
  return <Game />;
}
