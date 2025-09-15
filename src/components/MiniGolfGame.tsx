import { useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { GameBoard } from './GameBoard';
import { GameUI } from './GameUI';
import { PowerMeter } from './PowerMeter';
import { useToast } from '@/hooks/use-toast';

export interface GameState {
  currentLevel: number;
  strokes: number;
  totalStrokes: number;
  par: number;
  isAiming: boolean;
  power: number;
  aimDirection: number;
  levelComplete: boolean;
  gameComplete: boolean;
}

const LEVELS = [
  { id: 1, par: 2, name: "First Tee", difficulty: 1 },
  { id: 2, par: 3, name: "Gentle Curve", difficulty: 1 },
  { id: 3, par: 3, name: "Sand Trap", difficulty: 2 },
  { id: 4, par: 4, name: "Water Hazard", difficulty: 2 },
  { id: 5, par: 4, name: "Moving Platform", difficulty: 3 },
  { id: 6, par: 5, name: "Double Dogleg", difficulty: 3 },
  { id: 7, par: 4, name: "Windmill", difficulty: 3 },
  { id: 8, par: 5, name: "Loop-de-Loop", difficulty: 4 },
  { id: 9, par: 6, name: "Pinball Madness", difficulty: 4 },
  { id: 10, par: 7, name: "The Gauntlet", difficulty: 5 }
];

export const MiniGolfGame = () => {
  const { toast } = useToast();
  const { levelId } = useParams();
  const currentLevelId = levelId === 'random' 
    ? Math.floor(Math.random() * LEVELS.length) + 1 
    : parseInt(levelId || '1');
  
  const currentLevel = LEVELS.find(l => l.id === currentLevelId) || LEVELS[0];
  
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: currentLevelId,
    strokes: 0,
    totalStrokes: 0,
    par: currentLevel.par,
    isAiming: false,
    power: 0,
    aimDirection: 0,
    levelComplete: false,
    gameComplete: false
  });

  const [ballVelocity, setBallVelocity] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const startAiming = useCallback(() => {
    if (!isMoving && !gameState.levelComplete) {
      setGameState(prev => ({ ...prev, isAiming: true, power: 0 }));
    }
  }, [isMoving, gameState.levelComplete]);

  const updateAim = useCallback((direction: number, power: number) => {
    setGameState(prev => ({ 
      ...prev, 
      aimDirection: direction, 
      power: Math.min(power, 100) 
    }));
  }, []);

  const shoot = useCallback(() => {
    if (!gameState.isAiming || gameState.power === 0) return;

    const power = gameState.power / 100;
    const angle = gameState.aimDirection;
    const velocityX = Math.sin(angle) * power * 12;
    const velocityY = Math.cos(angle) * power * 12;

    setBallVelocity({ x: velocityX, y: velocityY });
    setIsMoving(true);
    setGameState(prev => ({ 
      ...prev, 
      isAiming: false, 
      power: 0, 
      strokes: prev.strokes + 1,
      totalStrokes: prev.totalStrokes + 1
    }));

    toast({
      title: "Shot!",
      description: `Stroke ${gameState.strokes + 1}`,
    });
  }, [gameState, toast]);

  const handleHoleReached = useCallback(() => {
    if (gameState.levelComplete) return;
    
    setGameState(prev => ({ ...prev, levelComplete: true }));
    setIsMoving(false);
    setBallVelocity({ x: 0, y: 0 });
    
    const strokesUnderPar = gameState.par - gameState.strokes;
    let message = "Level Complete!";
    if (strokesUnderPar > 0) {
      message = `Birdie! ${strokesUnderPar} under par!`;
    } else if (strokesUnderPar === 0) {
      message = "Par! Well played!";
    }
    
    toast({
      title: message,
      description: `Completed in ${gameState.strokes} strokes`,
    });
  }, [gameState, toast]);

  const resetLevel = useCallback(() => {
    setBallVelocity({ x: 0, y: 0 });
    setIsMoving(false);
    setResetTrigger(prev => prev + 1);
    setGameState(prev => ({
      ...prev,
      strokes: 0,
      isAiming: false,
      power: 0,
      levelComplete: false
    }));
  }, []);

  const handleBallPositionChange = useCallback((x: number, y: number) => {
    // Ball position tracking if needed for future features
  }, []);

  const handleBallStop = useCallback(() => {
    setIsMoving(false);
    setBallVelocity({ x: 0, y: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Link to="/levels">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Levels
              </Button>
            </Link>
            <GameUI gameState={gameState} levelInfo={currentLevel} />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetLevel}
              disabled={isMoving}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            {gameState.levelComplete && (
              <Link to="/levels">
                <Button size="sm" className="animate-power-pulse">
                  🏆 Choose Next Level
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Game Board */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-5xl h-[600px] relative">
          <GameBoard
            level={gameState.currentLevel}
            onBallPosition={handleBallPositionChange}
            onHoleReached={handleHoleReached}
            ballVelocity={ballVelocity}
            resetTrigger={resetTrigger}
          />
        </div>
      </div>
      
      {/* Aiming Controls */}
      {!isMoving && !gameState.levelComplete && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="flex justify-center">
            <PowerMeter
              isAiming={gameState.isAiming}
              power={gameState.power}
              onStartAiming={startAiming}
              onUpdateAim={updateAim}
              onShoot={shoot}
            />
          </div>
        </div>
      )}
      
      {/* Game Complete Screen */}
      {gameState.gameComplete && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <Card className="p-8 text-center animate-level-transition">
            <h2 className="text-3xl font-bold mb-4 text-golf-green">
              🏆 Game Complete!
            </h2>
            <p className="text-lg mb-4">
              Total Score: {gameState.totalStrokes} strokes
            </p>
            <p className="text-muted-foreground mb-6">
              Thanks for playing Mini Golf 2D!
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/levels">
                <Button>
                  Choose Another Level
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Play Again
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};