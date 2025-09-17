import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Plane, Sphere, Box, Line } from '@react-three/drei';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { GameUI3D, GameState3D } from './GameUI3D';
import { PowerMeter3D } from './PowerMeter3D';
import { useToast } from '@/hooks/use-toast';
import * as THREE from 'three';

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

export const Game3D = () => {
  const { toast } = useToast();
  const { levelId } = useParams();
  const currentLevelId = levelId === 'random' 
    ? Math.floor(Math.random() * LEVELS.length) + 1 
    : parseInt(levelId || '1');
  
  const currentLevel = LEVELS.find(l => l.id === currentLevelId) || LEVELS[0];
  
  const [gameState, setGameState] = useState<GameState3D>({
    currentLevel: currentLevelId,
    strokes: 0,
    totalStrokes: 0,
    par: currentLevel.par,
    isAiming: false,
    power: 0,
    aimDirection: { x: 0, z: 1 },
    levelComplete: false,
    gameComplete: false
  });

  const [ballPosition, setBallPosition] = useState(new THREE.Vector3(0, 0.1, 8));
  const [ballVelocity, setBallVelocity] = useState(new THREE.Vector3(0, 0, 0));
  const [isMoving, setIsMoving] = useState(false);

  const startAiming = useCallback(() => {
    if (!isMoving && !gameState.levelComplete) {
      setGameState(prev => ({ ...prev, isAiming: true, power: 0 }));
    }
  }, [isMoving, gameState.levelComplete]);

  const updateAim = useCallback((direction: { x: number; z: number }, power: number) => {
    setGameState(prev => ({ 
      ...prev, 
      aimDirection: direction, 
      power: Math.min(power, 100) 
    }));
  }, []);

  const shoot = useCallback(() => {
    if (isMoving || gameState.power === 0 || gameState.levelComplete) return;

    const power = gameState.power / 100;
    const rawDir = new THREE.Vector3(gameState.aimDirection.x, 0, gameState.aimDirection.z);
    if (rawDir.lengthSq() === 0) rawDir.set(0, 0, -1); // default toward hole if no aim
    const direction = rawDir.normalize();
    const velocity = direction.multiplyScalar(power * 15);

    setBallVelocity(new THREE.Vector3(velocity.x, 0, velocity.z));
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
  }, [gameState.power, gameState.aimDirection, gameState.levelComplete, toast, isMoving]);

  const handleHoleReached = useCallback(() => {
    if (gameState.levelComplete) return;
    
    setGameState(prev => ({ ...prev, levelComplete: true }));
    setIsMoving(false);
    setBallVelocity(new THREE.Vector3(0, 0, 0));
    
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
    setBallPosition(new THREE.Vector3(0, 0.1, 8));
    setBallVelocity(new THREE.Vector3(0, 0, 0));
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
            <GameUI3D gameState={gameState} levelInfo={currentLevel} />
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
      
      {/* 3D Game Scene */}
      <div className="h-screen">
        <Canvas camera={{ position: [0, 8, 12], fov: 75 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <pointLight position={[0, 10, 0]} intensity={0.5} />
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={5}
            maxDistance={20}
          />
          
          {/* Ground */}
          <Plane 
            args={[20, 20]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, 0, 0]}
          >
            <meshLambertMaterial color="#4ade80" />
          </Plane>
          
          {/* Course Elements */}
          <GolfCourse3D level={currentLevelId} />
          
          {/* Golf Ball */}
          <GolfBall3D 
            position={ballPosition}
            velocity={ballVelocity}
            isMoving={isMoving}
            gameState={gameState}
            onPositionChange={setBallPosition}
            onVelocityChange={setBallVelocity}
            onMovingChange={setIsMoving}
            onHoleReached={handleHoleReached}
          />
          
          {/* Hole */}
          <mesh position={[0, 0.01, -8]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshLambertMaterial color="#000000" />
          </mesh>
          
          {/* Aiming Direction Line */}
          {gameState.isAiming && gameState.power > 0 && (
            <AimingLine 
              start={ballPosition}
              direction={gameState.aimDirection}
              power={gameState.power}
            />
          )}
        </Canvas>
      </div>
      
      {/* Aiming Controls */}
      {!isMoving && !gameState.levelComplete && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="flex justify-center">
            <PowerMeter3D
              isAiming={gameState.isAiming}
              power={gameState.power}
              aimDirection={gameState.aimDirection}
              onStartAiming={startAiming}
              onUpdateAim={updateAim}
              onShoot={shoot}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Golf Ball Component
const GolfBall3D = ({ 
  position, 
  velocity, 
  isMoving, 
  gameState,
  onPositionChange, 
  onVelocityChange, 
  onMovingChange,
  onHoleReached 
}: any) => {
  const ballRef = useRef<any>();

  // Physics update
  const updatePhysics = useCallback(() => {
    if (!isMoving) return;

    const newPos = position.clone();
    const newVel = velocity.clone();

    // Apply velocity
    newPos.add(newVel.clone().multiplyScalar(0.016)); // 60fps

    // Apply friction
    newVel.multiplyScalar(0.98);

    // Boundary checks
    if (newPos.x > 9 || newPos.x < -9) {
      newVel.x *= -0.8;
      newPos.x = Math.max(-9, Math.min(9, newPos.x));
    }
    if (newPos.z > 9 || newPos.z < -9) {
      newVel.z *= -0.8;
      newPos.z = Math.max(-9, Math.min(9, newPos.z));
    }

    // Check if ball reached hole
    const holeDistance = Math.sqrt(newPos.x * newPos.x + (newPos.z + 8) * (newPos.z + 8));
    if (holeDistance < 0.5) {
      onHoleReached();
      return;
    }

    // Stop if velocity is very low
    if (newVel.length() < 0.1) {
      newVel.set(0, 0, 0);
      onMovingChange(false);
    }

    onPositionChange(newPos);
    onVelocityChange(newVel);
  }, [isMoving, position, velocity, onPositionChange, onVelocityChange, onMovingChange, onHoleReached]);

  // Animation loop
  React.useEffect(() => {
    if (!isMoving) return;

    const animate = () => {
      updatePhysics();
      if (isMoving) {
        requestAnimationFrame(animate);
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isMoving, updatePhysics]);

  return (
    <Sphere 
      ref={ballRef}
      args={[0.1, 16, 16]} 
      position={[position.x, position.y, position.z]}
    >
      <meshPhongMaterial color="#ffffff" />
    </Sphere>
  );
};

// Golf Course Component
const GolfCourse3D = ({ level }: { level: number }) => {
  const obstacles: JSX.Element[] = [];

  // Add obstacles based on level
  switch (level) {
    case 1:
      // Simple straight course
      break;
    case 2:
      // Gentle curve with walls
      obstacles.push(
        <Box key="wall1" args={[0.2, 0.5, 4]} position={[3, 0.25, 2]}>
          <meshLambertMaterial color="#8b4513" />
        </Box>
      );
      break;
    case 3:
      // Sand trap
      obstacles.push(
        <Box key="sand" args={[3, 0.1, 3]} position={[0, 0.05, 2]}>
          <meshLambertMaterial color="#f4a460" />
        </Box>
      );
      break;
    case 4:
      // Water hazard
      obstacles.push(
        <Box key="water" args={[4, 0.1, 2]} position={[-2, 0.05, 0]}>
          <meshLambertMaterial color="#4682b4" />
        </Box>
      );
      break;
    default:
      // More complex layouts for higher levels
      obstacles.push(
        <Box key="wall1" args={[0.2, 0.5, 2]} position={[2, 0.25, 4]}>
          <meshLambertMaterial color="#8b4513" />
        </Box>,
        <Box key="wall2" args={[0.2, 0.5, 2]} position={[-2, 0.25, -2]}>
          <meshLambertMaterial color="#8b4513" />
        </Box>
      );
  }

  return <>{obstacles}</>;
};

// Aiming Line Component
const AimingLine = ({ start, direction, power }: any) => {
  const lineLength = (power / 100) * 5;
  const points = Array.from({ length: 21 }, (_, i) => {
    const t = i / 20;
    return [
      start.x + direction.x * lineLength * t,
      start.y + 0.1,
      start.z + direction.z * lineLength * t,
    ] as [number, number, number];
  });

  return (
    <Line points={points} color="#ff0000" opacity={0.7} transparent lineWidth={2} />
  );
};