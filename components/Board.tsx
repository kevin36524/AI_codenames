import React from 'react';
import { CardData } from '../types';
import Card from './Card';

interface BoardProps {
  board: CardData[];
  onCardClick: (index: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, onCardClick }) => {
  return (
    <div className="grid grid-cols-5 gap-2 md:gap-4 p-4 bg-gray-800 rounded-lg">
      {board.map((card, index) => (
        <Card key={index} cardData={card} onClick={() => onCardClick(index)} />
      ))}
    </div>
  );
};

export default Board;
