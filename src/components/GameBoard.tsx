import { useRef, useEffect, useState } from 'react';
import { Ball } from './Ball';
import { Obstacle } from './Obstacle';

interface GameBoardProps {
  level: number;
  onBallPosition: (x: number, y: number) => void;
  onHoleReached: () => void;
  ballVelocity: { x: number; y: number };
  resetTrigger: number;
}

export const GameBoard = ({ level, onBallPosition, onHoleReached, ballVelocity, resetTrigger }: GameBoardProps) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        setBoardSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const getLevelConfig = (levelId: number) => {
    const configs = {
      1: {
        startX: 50,
        startY: 500,
        holeX: 750,
        holeY: 100,
        obstacles: [],
        bgPattern: 'linear-gradient(45deg, #22c55e 25%, #16a34a 25%, #16a34a 50%, #22c55e 50%, #22c55e 75%, #16a34a 75%)',
      },
      2: {
        startX: 50,
        startY: 500,
        holeX: 750,
        holeY: 100,
        obstacles: [
          { type: 'curve', x: 300, y: 250, width: 200, height: 100 },
        ],
        bgPattern: 'linear-gradient(45deg, #22c55e 25%, #16a34a 25%, #16a34a 50%, #22c55e 50%, #22c55e 75%, #16a34a 75%)',
      },
      3: {
        startX: 50,
        startY: 500,
        holeX: 750,
        holeY: 100,
        obstacles: [
          { type: 'sand', x: 300, y: 300, width: 150, height: 150 },
          { type: 'wall', x: 200, y: 200, width: 20, height: 100 },
        ],
        bgPattern: 'linear-gradient(45deg, #22c55e 25%, #16a34a 25%, #16a34a 50%, #22c55e 50%, #22c55e 75%, #16a34a 75%)',
      },
      4: {
        startX: 50,
        startY: 500,
        holeX: 750,
        holeY: 100,
        obstacles: [
          { type: 'water', x: 350, y: 250, width: 200, height: 100 },
          { type: 'bridge', x: 400, y: 280, width: 100, height: 40 },
        ],
        bgPattern: 'linear-gradient(45deg, #22c55e 25%, #16a34a 25%, #16a34a 50%, #22c55e 50%, #22c55e 75%, #16a34a 75%)',
      },
      5: {
        startX: 50,
        startY: 500,
        holeX: 750,
        holeY: 100,
        obstacles: [
          { type: 'movingPlatform', x: 300, y: 300, width: 100, height: 20 },
          { type: 'wall', x: 500, y: 150, width: 20, height: 200 },
        ],
        bgPattern: 'linear-gradient(45deg, #22c55e 25%, #16a34a 25%, #16a34a 50%, #22c55e 50%, #22c55e 75%, #16a34a 75%)',
      },
      6: {
        startX: 50,
        startY: 500,
        holeX: 750,
        holeY: 100,
        obstacles: [
          { type: 'wall', x: 200, y: 300, width: 150, height: 20 },
          { type: 'wall', x: 450, y: 200, width: 150, height: 20 },
          { type: 'sand', x: 300, y: 350, width: 100, height: 100 },
        ],
        bgPattern: 'linear-gradient(45deg, #22c55e 25%, #16a34a 25%, #16a34a 50%, #22c55e 50%, #22c55e 75%, #16a34a 75%)',
      },
      7: {
        startX: 50,
        startY: 500,
        holeX: 750,
        holeY: 100,
        obstacles: [
          { type: 'windmill', x: 400, y: 300, width: 100, height: 100 },
        ],
        bgPattern: 'linear-gradient(45deg, #22c55e 25%, #16a34a 25%, #16a34a 50%, #22c55e 50%, #22c55e 75%, #16a34a 75%)',
      },
      8: {
        startX: 50,
        startY: 500,
        holeX: 750,
        holeY: 100,
        obstacles: [
          { type: 'loop', x: 300, y: 200, width: 200, height: 200 },
        ],
        bgPattern: 'linear-gradient(45deg, #22c55e 25%, #16a34a 25%, #16a34a 50%, #22c55e 50%, #22c55e 75%, #16a34a 75%)',
      },
      9: {
        startX: 50,
        startY: 500,
        holeX: 750,
        holeY: 100,
        obstacles: [
          { type: 'bumper', x: 200, y: 200, width: 30, height: 30 },
          { type: 'bumper', x: 300, y: 300, width: 30, height: 30 },
          { type: 'bumper', x: 500, y: 250, width: 30, height: 30 },
          { type: 'bumper', x: 400, y: 400, width: 30, height: 30 },
        ],
        bgPattern: 'linear-gradient(45deg, #22c55e 25%, #16a34a 25%, #16a34a 50%, #22c55e 50%, #22c55e 75%, #16a34a 75%)',
      },
      10: {
        startX: 50,
        startY: 500,
        holeX: 750,
        holeY: 100,
        obstacles: [
          { type: 'wall', x: 150, y: 200, width: 20, height: 200 },
          { type: 'movingPlatform', x: 250, y: 300, width: 80, height: 20 },
          { type: 'water', x: 400, y: 350, width: 150, height: 100 },
          { type: 'windmill', x: 550, y: 200, width: 80, height: 80 },
          { type: 'sand', x: 300, y: 150, width: 100, height: 100 },
        ],
        bgPattern: 'linear-gradient(45deg, #22c55e 25%, #16a34a 25%, #16a34a 50%, #22c55e 50%, #22c55e 75%, #16a34a 75%)',
      },
    };

    return configs[levelId as keyof typeof configs] || configs[1];
  };

  const config = getLevelConfig(level);

  return (
    <div 
      ref={boardRef}
      className="relative w-full h-full overflow-hidden rounded-lg border-4 border-golf-green shadow-2xl"
      style={{ 
        background: config.bgPattern,
        backgroundSize: '40px 40px'
      }}
    >
      {/* Course boundaries */}
      <div className="absolute inset-0 border-8 border-amber-900 rounded-lg pointer-events-none" />
      
      {/* Starting tee */}
      <div 
        className="absolute w-12 h-12 bg-amber-600 rounded-full border-4 border-amber-800 flex items-center justify-center"
        style={{ left: config.startX - 24, top: config.startY - 24 }}
      >
        <div className="w-4 h-4 bg-amber-800 rounded-full" />
      </div>
      
      {/* Hole */}
      <div 
        className="absolute w-8 h-8 bg-black rounded-full border-2 border-gray-800 shadow-inner"
        style={{ left: config.holeX - 16, top: config.holeY - 16 }}
      >
        <div className="absolute inset-1 bg-gray-900 rounded-full" />
      </div>
      
      {/* Flag */}
      <div 
        className="absolute flex flex-col items-center"
        style={{ left: config.holeX + 20, top: config.holeY - 40 }}
      >
        <div className="w-1 h-10 bg-amber-800" />
        <div className="w-6 h-4 bg-red-500 -mt-8 ml-1 clip-path-triangle" />
      </div>
      
      {/* Obstacles */}
      {config.obstacles.map((obstacle, index) => (
        <Obstacle key={index} {...obstacle} />
      ))}
      
      {/* Ball */}
      <Ball
        startX={config.startX}
        startY={config.startY}
        holeX={config.holeX}
        holeY={config.holeY}
        boardWidth={boardSize.width}
        boardHeight={boardSize.height}
        obstacles={config.obstacles}
        onPositionChange={onBallPosition}
        onHoleReached={onHoleReached}
        velocity={ballVelocity}
        resetTrigger={resetTrigger}
      />
    </div>
  );
};