import { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GolfCourse } from './GolfCourse';
import { GolfBall } from './GolfBall';
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
  { par: 3, name: "Easy Green", difficulty: 1 },
  { par: 4, name: "Sand Trap", difficulty: 2 },
  { par: 5, name: "Mountain Course", difficulty: 3 }
];

export const MiniGolfGame = () => {
  const { toast } = useToast();
  const ballRef = useRef<any>();
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    strokes: 0,
    totalStrokes: 0,
    par: LEVELS[0].par,
    isAiming: false,
    power: 0,
    aimDirection: 0,
    levelComplete: false,
    gameComplete: false
  });

  const [ballPosition, setBallPosition] = useState([0, 0.1, 4]);
  const [ballVelocity, setBallVelocity] = useState([0, 0, 0]);
  const [isMoving, setIsMoving] = useState(false);

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
    const velocityX = Math.sin(angle) * power * 8;
    const velocityZ = Math.cos(angle) * power * 8;

    setBallVelocity([velocityX, 0, velocityZ]);
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

  const checkHole = useCallback((position: number[]) => {
    const holePosition = [0, 0, -4]; // Hole is at the end of the course
    const distance = Math.sqrt(
      Math.pow(position[0] - holePosition[0], 2) + 
      Math.pow(position[2] - holePosition[2], 2)
    );
    
    if (distance < 0.3 && !gameState.levelComplete) {
      setGameState(prev => ({ ...prev, levelComplete: true }));
      setIsMoving(false);
      setBallVelocity([0, 0, 0]);
      
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
    }
  }, [gameState, toast]);

  const nextLevel = useCallback(() => {
    if (gameState.currentLevel < LEVELS.length) {
      const nextLevelIndex = gameState.currentLevel;
      setGameState(prev => ({
        ...prev,
        currentLevel: prev.currentLevel + 1,
        strokes: 0,
        par: LEVELS[nextLevelIndex].par,
        levelComplete: false
      }));
      setBallPosition([0, 0.1, 4]);
      setBallVelocity([0, 0, 0]);
      setIsMoving(false);
    } else {
      setGameState(prev => ({ ...prev, gameComplete: true }));
      toast({
        title: "Game Complete!",
        description: `Total strokes: ${gameState.totalStrokes}`,
      });
    }
  }, [gameState, toast]);

  const resetLevel = useCallback(() => {
    setBallPosition([0, 0.1, 4]);
    setBallVelocity([0, 0, 0]);
    setIsMoving(false);
    setGameState(prev => ({
      ...prev,
      strokes: 0,
      isAiming: false,
      power: 0,
      levelComplete: false
    }));
  }, []);

  return (
    <div className="game-scene">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 8, 8]} />
        <OrbitControls 
          enablePan={false}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={3}
          maxDistance={15}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <GolfCourse level={gameState.currentLevel} />
        <GolfBall
          ref={ballRef}
          position={ballPosition}
          velocity={ballVelocity}
          onPositionChange={setBallPosition}
          onVelocityChange={setBallVelocity}
          onStopMoving={() => setIsMoving(false)}
          onCheckHole={checkHole}
          isAiming={gameState.isAiming}
          aimDirection={gameState.aimDirection}
          power={gameState.power}
        />
      </Canvas>
      
      {/* Game UI Overlay */}
      <div className="absolute top-4 left-4 right-4 pointer-events-none">
        <div className="flex justify-between items-start">
          <GameUI gameState={gameState} levelInfo={LEVELS[gameState.currentLevel - 1]} />
          
          <div className="flex gap-2 pointer-events-auto">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={resetLevel}
              disabled={isMoving}
            >
              Reset
            </Button>
            {gameState.levelComplete && gameState.currentLevel < LEVELS.length && (
              <Button 
                onClick={nextLevel}
                className="animate-power-pulse"
              >
                Next Level
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Aiming Controls */}
      {!isMoving && !gameState.levelComplete && (
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
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
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Card className="p-8 text-center animate-level-transition">
            <h2 className="text-3xl font-bold mb-4 text-golf-green">
              🏆 Game Complete!
            </h2>
            <p className="text-lg mb-4">
              Total Score: {gameState.totalStrokes} strokes
            </p>
            <p className="text-muted-foreground mb-6">
              Thanks for playing Mini Golf 3D!
            </p>
            <Button onClick={() => window.location.reload()}>
              Play Again
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};