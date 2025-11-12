import React from 'react';
import { Team } from '../types';

interface ScoreboardProps {
  scores: { [Team.Red]: number; [Team.Blue]: number };
  currentTeam: Team;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ scores, currentTeam }) => {
  const isRedTurn = currentTeam === Team.Red;
  const isBlueTurn = currentTeam === Team.Blue;

  return (
    <div className="flex justify-around items-center p-4 bg-gray-800 rounded-lg text-white mb-4">
      <div className={`p-4 rounded-lg transition-all ${isRedTurn ? 'bg-red-700 scale-110' : 'bg-red-900'}`}>
        <h2 className="text-2xl md:text-3xl font-bold">Red Team</h2>
        <p className="text-xl md:text-2xl text-center">{scores[Team.Red]}</p>
      </div>
      <div className="text-xl font-mono">VS</div>
      <div className={`p-4 rounded-lg transition-all ${isBlueTurn ? 'bg-blue-700 scale-110' : 'bg-blue-900'}`}>
        <h2 className="text-2xl md:text-3xl font-bold">Blue Team</h2>
        <p className="text-xl md:text-2xl text-center">{scores[Team.Blue]}</p>
      </div>
    </div>
  );
};

export default Scoreboard;
