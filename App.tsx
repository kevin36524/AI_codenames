import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Team, Role, Personality, GamePhase, CardData, Clue } from './types';
import { WORD_LIST } from './constants';
import Board from './components/Board';
import Controls from './components/Controls';
import Scoreboard from './components/Scoreboard';
import ClueDisplay from './components/Clue';

const App = () => {
  const [board, setBoard] = useState<CardData[]>([]);
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.Setup);
  const [currentTeam, setCurrentTeam] = useState<Team>(Team.Red);
  const [personality, setPersonality] = useState<Personality>(Personality.Safe);
  const [clue, setClue] = useState<Clue | null>(null);
  const [guessesLeft, setGuessesLeft] = useState(0);
  const [scores, setScores] = useState({ [Team.Red]: 0, [Team.Blue]: 0 });
  const [gameOverMessage, setGameOverMessage] = useState('');

  const shuffle = <T,>(array: T[]): T[] => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  const handleNewGame = useCallback((pers: Personality) => {
    setPersonality(pers);
    setClue(null);
    setGuessesLeft(0);
    setGameOverMessage('');

    const shuffledWords = shuffle([...WORD_LIST]).slice(0, 25);
    const startingTeam = Math.random() < 0.5 ? Team.Red : Team.Blue;
    const redCount = startingTeam === Team.Red ? 9 : 8;
    const blueCount = startingTeam === Team.Blue ? 9 : 8;

    setCurrentTeam(startingTeam);
    setScores({ [Team.Red]: redCount, [Team.Blue]: blueCount });

    const roles: Role[] = [
      ...Array(redCount).fill(Role.Red),
      ...Array(blueCount).fill(Role.Blue),
      ...Array(7).fill(Role.Bystander),
      Role.Assassin
    ];

    const shuffledRoles = shuffle(roles);

    const newBoard: CardData[] = shuffledWords.map((word, index) => ({
      word,
      role: shuffledRoles[index],
      isRevealed: false
    }));

    setBoard(newBoard);
    setGamePhase(GamePhase.Ready);
  }, []);

  const endTurn = useCallback(() => {
    setGuessesLeft(0);
    setClue(null);
    setCurrentTeam(prev => prev === Team.Red ? Team.Blue : Team.Red);
    setGamePhase(GamePhase.Ready);
  }, []);

  const handleCardClick = (index: number) => {
    if (gamePhase !== GamePhase.Guessing || board[index].isRevealed) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = { ...newBoard[index], isRevealed: true };
    setBoard(newBoard);

    const card = newBoard[index];
    const newScores = { ...scores };

    if (card.role === Role.Red) newScores[Team.Red]--;
    if (card.role === Role.Blue) newScores[Team.Blue]--;
    setScores(newScores);

    const otherTeam = currentTeam === Team.Red ? Team.Blue : Team.Red;

    if (card.role === Role.Assassin) {
      setGameOverMessage(`${currentTeam} team hit the assassin! ${otherTeam} wins!`);
      setGamePhase(GamePhase.GameOver);
      return;
    }

    if (newScores[Team.Red] === 0) {
      setGameOverMessage('Red team wins!');
      setGamePhase(GamePhase.GameOver);
      return;
    }
    if (newScores[Team.Blue] === 0) {
      setGameOverMessage('Blue team wins!');
      setGamePhase(GamePhase.GameOver);
      return;
    }

    if (card.role.toLowerCase() !== currentTeam.toLowerCase()) {
      endTurn();
    } else {
      const newGuessesLeft = guessesLeft - 1;
      setGuessesLeft(newGuessesLeft);
      if (newGuessesLeft === 0) {
        endTurn();
      }
    }
  };

  useEffect(() => {
    const getAIClue = async () => {
      if (gamePhase !== GamePhase.Ready) return;

      setGamePhase(GamePhase.GeneratingClue);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const otherTeam = currentTeam === Team.Red ? Team.Blue : Team.Red;
      
      const unrevealedWords = (team: Role) => board.filter(c => c.role === team && !c.isRevealed).map(c => c.word);

      const yourWords = unrevealedWords(currentTeam as unknown as Role);
      const oppWords = unrevealedWords(otherTeam as unknown as Role);
      const bystanderWords = unrevealedWords(Role.Bystander);
      const assassinWord = board.find(c => c.role === Role.Assassin && !c.isRevealed)?.word;

      const prompt = `You are the Spymaster in a game of Codenames for the ${currentTeam} team. Your goal is to give a one-word clue and a number to help your team guess your words.

**Game Rules:**
- Your clue must be a single word.
- The number indicates how many words on the board relate to your clue.
- You are giving a clue for the ${currentTeam} team.
- Do not give clues that could lead the team to guess the other team's words, a neutral word, or especially the ASSASSIN word.

**Board State:**
- Your words (to give clues for): [${yourWords.join(', ')}]
- Opponent's (${otherTeam}) words (to avoid): [${oppWords.join(', ')}]
- Neutral words (to avoid): [${bystanderWords.join(', ')}]
- Assassin word (to avoid): ${assassinWord}

**Your Personality:** ${personality}
- If SAFE: Prioritize clues that are strongly related to 1 or 2 of your words and have a very low risk of being misinterpreted.
- If AGGRESSIVE: Try to give clues for 3 or more words if possible, even if the connection is more abstract or carries some risk.

**Task:**
Based on the current board and your personality, provide the best clue.
Respond ONLY with a JSON object with "clue" (string) and "count" (number) keys.`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                clue: { type: Type.STRING },
                count: { type: Type.INTEGER }
              },
              required: ["clue", "count"]
            }
          }
        });
        const parsed = JSON.parse(response.text);
        setClue({ word: parsed.clue, count: parsed.count });
        setGuessesLeft(parsed.count);
        setGamePhase(GamePhase.Guessing);
      } catch (error) {
        console.error("Error fetching AI clue:", error);
        setClue({ word: 'AI Error', count: 0 });
        setTimeout(endTurn, 2000);
      }
    };
    
    getAIClue();

  }, [gamePhase, currentTeam, board, personality, endTurn]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">AI Codenames</h1>
        
        {gamePhase === GamePhase.Setup && <Controls onNewGame={handleNewGame} disabled={false} />}
        
        {gamePhase !== GamePhase.Setup && (
          <>
            <Scoreboard scores={scores} currentTeam={currentTeam} />
            <ClueDisplay clue={clue} isAIsTurn={gamePhase === GamePhase.GeneratingClue} />
            
            {gamePhase === GamePhase.GameOver ? (
              <div className="text-center bg-gray-800 p-8 rounded-lg">
                <h2 className="text-3xl font-bold mb-4">{gameOverMessage}</h2>
                <button 
                  onClick={() => setGamePhase(GamePhase.Setup)} 
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg text-lg transition-colors"
                >
                  Play Again
                </button>
              </div>
            ) : (
              <Board board={board} onCardClick={handleCardClick} />
            )}
             {gamePhase === GamePhase.Guessing && (
                <div className="text-center mt-4">
                  <button
                    onClick={endTurn}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    End Turn ({guessesLeft} guesses left)
                  </button>
                </div>
              )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;