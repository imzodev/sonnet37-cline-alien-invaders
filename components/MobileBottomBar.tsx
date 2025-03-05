import React from 'react';
import { DefenseType, DEFENSE_STATS } from '@/lib/gameTypes';

interface MobileBottomBarProps {
  gameState: any; // Replace with actual type
  selectDefense: (defenseType: DefenseType | null) => void;
}

const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ gameState, selectDefense }) => {
  return (
    <div className="bg-gray-900/90 p-3 rounded-b-lg border-t border-gray-700 backdrop-blur-sm mt-2">
      {/* Defense selection as horizontal scrollable bar */}
      <div className="flex overflow-x-auto pb-2 hide-scrollbar">
        {Object.values(DefenseType).map((type, index) => {
          const stats = DEFENSE_STATS[type];
          const isSelected = gameState.selectedDefense === type;
          const canAfford = gameState.player.resources >= stats.cost;
          const keyNumber = index + 1;

          return (
            <button
              key={type}
              className={`relative p-2 rounded-lg transition-all flex-shrink-0 mr-2 w-16 ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transform scale-105'
                  : canAfford
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-800 opacity-50 cursor-not-allowed'
              } border ${isSelected ? 'border-blue-400' : 'border-gray-600'}`}
              onClick={() => {
                if (!canAfford) return;
                
                // For mobile, directly place the defense at player position when tapped
                // This makes it easier to play on mobile without having to select then place
                if (window.innerWidth < 768) {
                  // First select the defense
                  selectDefense(type);
                  
                  // Then simulate pressing the corresponding number key to place it
                  const keyNumber = (index + 1).toString();
                  const event = new KeyboardEvent('keydown', { key: keyNumber });
                  window.dispatchEvent(event);
                  
                  // Then release the key
                  setTimeout(() => {
                    const releaseEvent = new KeyboardEvent('keyup', { key: keyNumber });
                    window.dispatchEvent(releaseEvent);
                  }, 100);
                } else {
                  // On desktop, just toggle selection as before
                  selectDefense(isSelected ? null : type);
                }
              }}
              disabled={!canAfford}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-md ${
                    type === DefenseType.BASIC_TURRET
                      ? 'bg-green-500'
                      : type === DefenseType.LASER
                      ? 'bg-blue-500'
                      : type === DefenseType.SHIELD
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  } mb-1`}
                />
                <div className="text-xs text-white font-medium">({keyNumber})</div>
                <div className="text-yellow-400 text-xs mt-1 bg-gray-900/50 px-2 py-1 rounded-full inline-block">{stats.cost}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile touch controls */}
      <div className="flex justify-between items-center mt-3">
        {/* Left movement button */}
        <button 
          className="w-16 h-16 bg-blue-500/40 rounded-full flex items-center justify-center border-2 border-blue-400/60 backdrop-blur-sm"
          onTouchStart={() => {
            // Simulate left arrow key press
            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            window.dispatchEvent(event);
          }}
          onTouchEnd={() => {
            // Simulate key release
            const event = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
            window.dispatchEvent(event);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Shoot button */}
        <button 
          className="w-20 h-20 bg-red-500/40 rounded-full flex items-center justify-center border-2 border-red-400/60 backdrop-blur-sm"
          onTouchStart={() => {
            // Simulate spacebar press
            const event = new KeyboardEvent('keydown', { key: ' ' });
            window.dispatchEvent(event);
          }}
          onTouchEnd={() => {
            // Simulate key release
            const event = new KeyboardEvent('keyup', { key: ' ' });
            window.dispatchEvent(event);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>

        {/* Right movement button */}
        <button 
          className="w-16 h-16 bg-blue-500/40 rounded-full flex items-center justify-center border-2 border-blue-400/60 backdrop-blur-sm"
          onTouchStart={() => {
            // Simulate right arrow key press
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            window.dispatchEvent(event);
          }}
          onTouchEnd={() => {
            // Simulate key release
            const event = new KeyboardEvent('keyup', { key: 'ArrowRight' });
            window.dispatchEvent(event);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Mobile action buttons for repair and upgrade */}
      <div className="flex justify-center gap-4 mt-3">
        <button
          className="flex-1 bg-green-600/80 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          onClick={() => {
            // Simulate pressing the R key
            const event = new KeyboardEvent('keydown', { key: 'r' });
            window.dispatchEvent(event);
            
            // Release the key
            setTimeout(() => {
              const releaseEvent = new KeyboardEvent('keyup', { key: 'r' });
              window.dispatchEvent(releaseEvent);
            }, 100);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Repair
        </button>
        
        <button
          className="flex-1 bg-purple-600/80 hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          onClick={() => {
            // Simulate pressing the U key
            const event = new KeyboardEvent('keydown', { key: 'u' });
            window.dispatchEvent(event);
            
            // Release the key
            setTimeout(() => {
              const releaseEvent = new KeyboardEvent('keyup', { key: 'u' });
              window.dispatchEvent(releaseEvent);
            }, 100);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Upgrade
        </button>
      </div>
    </div>
  );
};

export default MobileBottomBar;
