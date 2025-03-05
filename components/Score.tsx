import React from 'react';

interface ScoreProps {
  score: number;
  resources: number;
  lives: number;
  paused: boolean;
  pauseGame: () => void;
}

const Score: React.FC<ScoreProps> = ({ score, resources, lives, paused, pauseGame }) => {
  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:block bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 mb-3 border border-gray-700/50 shadow-lg">
        <div className="flex flex-col text-white">
          <div className="flex justify-between items-center mb-3">
            <div className="font-bold text-xl">Score: <span className="text-blue-400">{score}</span></div>
            <button
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md text-sm transition-colors"
              onClick={pauseGame}
            >
              {paused ? 'Resume' : 'Pause'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-700/50 p-2 rounded-lg">
              <span className="text-gray-400">Resources:</span>
              <span className="font-bold text-yellow-400 ml-1">{resources}</span>
            </div>
            <div className="bg-gray-700/50 p-2 rounded-lg">
              <span className="text-gray-400">Lives:</span>
              <span className="font-bold text-red-500 ml-1">{lives}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden flex justify-between items-center bg-gray-900/90 p-2 rounded-t-lg border-b border-gray-700 backdrop-blur-sm mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg text-white">Score: <span className="text-blue-400">{score}</span></span>
        </div>
        <div className="flex space-x-2">
          <div className="bg-gray-800 px-2 py-1 rounded-md flex items-center">
            <span className="text-yellow-400 font-bold">{resources}</span>
            <span className="text-yellow-600 ml-1">💰</span>
          </div>
          <div className="bg-gray-800 px-2 py-1 rounded-md flex items-center">
            <span className="text-red-500 font-bold">{lives}</span>
            <span className="text-red-600 ml-1">❤️</span>
          </div>
          <button
            className="bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center"
            onClick={pauseGame}
          >
            {paused ? 
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-400">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
              : 
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            }
          </button>
        </div>
      </div>
    </>
  );
};

export default Score;
