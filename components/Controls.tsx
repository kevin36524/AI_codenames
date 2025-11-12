import React, { useState } from 'react';
import { Personality } from '../types';

interface ControlsProps {
  onNewGame: (personality: Personality) => void;
  disabled: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onNewGame, disabled }) => {
  const [personality, setPersonality] = useState<Personality>(Personality.Safe);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNewGame(personality);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
        <div className="flex flex-col items-center">
          <label className="mb-2 font-bold text-lg">AI Personality:</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPersonality(Personality.Safe)} className={`px-4 py-2 rounded-lg font-semibold ${personality === Personality.Safe ? 'bg-green-600 text-white' : 'bg-gray-700'}`}>Safe</button>
            <button type="button" onClick={() => setPersonality(Personality.Aggressive)} className={`px-4 py-2 rounded-lg font-semibold ${personality === Personality.Aggressive ? 'bg-yellow-600 text-white' : 'bg-gray-700'}`}>Aggressive</button>
          </div>
        </div>
        
        <button type="submit" disabled={disabled} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors disabled:opacity-50 mt-4 md:mt-0">
          Start New Game
        </button>
      </form>
    </div>
  );
};

export default Controls;