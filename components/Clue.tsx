import React from 'react';
import { Clue } from '../types';

interface ClueDisplayProps {
  clue: Clue | null;
  isAIsTurn: boolean;
}

const ClueDisplay: React.FC<ClueDisplayProps> = ({ clue, isAIsTurn }) => {
  return (
    <div className="my-4 p-4 h-20 flex items-center justify-center text-center bg-gray-800 rounded-lg">
      {isAIsTurn ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse delay-200"></div>
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse delay-400"></div>
          <span className="text-xl text-gray-400 ml-2">AI is thinking...</span>
        </div>
      ) : clue ? (
        <h2 className="text-2xl md:text-3xl font-bold">
          Clue: <span className="text-yellow-400 uppercase">{clue.word}</span>, <span className="text-yellow-400">{clue.count}</span>
        </h2>
      ) : (
        <h2 className="text-xl text-gray-500">Waiting for clue...</h2>
      )}
    </div>
  );
};

export default ClueDisplay;