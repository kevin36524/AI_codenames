import React from 'react';
import { CardData, Role } from '../types';

interface CardProps {
  cardData: CardData;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ cardData, onClick }) => {
  const { word, role, isRevealed } = cardData;

  const getCardColor = () => {
    if (!isRevealed) {
      return 'bg-gray-700 hover:bg-gray-600';
    }
    switch (role) {
      case Role.Red:
        return 'bg-red-600';
      case Role.Blue:
        return 'bg-blue-600';
      case Role.Bystander:
        return 'bg-yellow-700';
      case Role.Assassin:
        return 'bg-black';
      default:
        return 'bg-gray-700';
    }
  };

  const baseClasses = 'w-full h-20 md:h-24 flex items-center justify-center p-2 rounded-lg shadow-md transition-all duration-300 ease-in-out cursor-pointer';
  const revealedClasses = isRevealed ? 'text-white transform scale-105' : 'text-gray-300 hover:scale-105';
  const textClasses = 'font-bold text-sm md:text-base uppercase tracking-wider text-center break-all';

  return (
    <button
      onClick={onClick}
      disabled={isRevealed}
      className={`${baseClasses} ${getCardColor()} ${revealedClasses}`}
      aria-label={isRevealed ? `${word}: ${role}` : word}
    >
      <span className={textClasses}>{word}</span>
    </button>
  );
};

export default Card;
