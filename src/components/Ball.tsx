import { useState, useEffect, useRef } from 'react';

interface BallProps {
  startX: number;
  startY: number;
  holeX: number;
  holeY: number;
  boardWidth: number;
  boardHeight: number;
  obstacles: any[];
  onPositionChange: (x: number, y: number) => void;
  onHoleReached: () => void;
  velocity: { x: number; y: number };
  resetTrigger: number;
}

export const Ball = ({ 
  startX, 
  startY, 
  holeX, 
  holeY, 
  boardWidth, 
  boardHeight, 
  obstacles, 
  onPositionChange, 
  onHoleReached, 
  velocity,
  resetTrigger 
}: BallProps) => {
  const [position, setPosition] = useState({ x: startX, y: startY });
  const [currentVelocity, setCurrentVelocity] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const animationRef = useRef<number>();
  const trailRef = useRef<{ x: number; y: number; opacity: number }[]>([]);

  // Reset ball position when resetTrigger changes
  useEffect(() => {
    setPosition({ x: startX, y: startY });
    setCurrentVelocity({ x: 0, y: 0 });
    setIsMoving(false);
    trailRef.current = [];
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [resetTrigger, startX, startY]);

  // Apply new velocity when it changes
  useEffect(() => {
    if (velocity.x !== 0 || velocity.y !== 0) {
      setCurrentVelocity({ ...velocity });
      setIsMoving(true);
    }
  }, [velocity]);

  // Animation loop
  useEffect(() => {
    if (!isMoving) return;

    const animate = () => {
      setPosition(prevPos => {
        let newX = prevPos.x;
        let newY = prevPos.y;
        
        setCurrentVelocity(prevVel => {
          newX = prevPos.x + prevVel.x;
          newY = prevPos.y + prevVel.y;
          let newVelX = prevVel.x;
          let newVelY = prevVel.y;

          // Boundary collisions
          if (newX <= 20 || newX >= boardWidth - 20) {
            newVelX = -newVelX * 0.8;
            newX = Math.max(20, Math.min(boardWidth - 20, newX));
          }
          if (newY <= 20 || newY >= boardHeight - 20) {
            newVelY = -newVelY * 0.8;
            newY = Math.max(20, Math.min(boardHeight - 20, newY));
          }

          // Obstacle collisions
          obstacles.forEach(obstacle => {
            if (
              newX >= obstacle.x && 
              newX <= obstacle.x + obstacle.width &&
              newY >= obstacle.y && 
              newY <= obstacle.y + obstacle.height
            ) {
              switch (obstacle.type) {
                case 'wall':
                  // Bounce off walls
                  if (Math.abs(newX - obstacle.x) < Math.abs(newX - (obstacle.x + obstacle.width))) {
                    newVelX = -Math.abs(newVelX);
                  } else {
                    newVelX = Math.abs(newVelX);
                  }
                  if (Math.abs(newY - obstacle.y) < Math.abs(newY - (obstacle.y + obstacle.height))) {
                    newVelY = -Math.abs(newVelY);
                  } else {
                    newVelY = Math.abs(newVelY);
                  }
                  break;
                case 'sand':
                  // Slow down in sand
                  newVelX *= 0.7;
                  newVelY *= 0.7;
                  break;
                case 'water':
                  // Reset if ball goes in water
                  newX = startX;
                  newY = startY;
                  newVelX = 0;
                  newVelY = 0;
                  break;
                case 'bumper':
                  // Bouncy bumpers
                  const centerX = obstacle.x + obstacle.width / 2;
                  const centerY = obstacle.y + obstacle.height / 2;
                  const angle = Math.atan2(newY - centerY, newX - centerX);
                  const speed = Math.sqrt(newVelX * newVelX + newVelY * newVelY) * 1.5;
                  newVelX = Math.cos(angle) * speed;
                  newVelY = Math.sin(angle) * speed;
                  break;
              }
            }
          });

          // Apply friction
          newVelX *= 0.98;
          newVelY *= 0.98;

          // Stop if velocity is very low
          if (Math.abs(newVelX) < 0.1 && Math.abs(newVelY) < 0.1) {
            newVelX = 0;
            newVelY = 0;
            setIsMoving(false);
          }

          return { x: newVelX, y: newVelY };
        });

        const newPos = { x: newX, y: newY };
        
        // Update trail
        trailRef.current.unshift({ x: newX, y: newY, opacity: 1 });
        trailRef.current = trailRef.current.slice(0, 8).map((point, index) => ({
          ...point,
          opacity: 1 - (index / 8)
        }));

        onPositionChange(newX, newY);

        // Check if ball reached hole
        const distanceToHole = Math.sqrt(
          Math.pow(newX - holeX, 2) + Math.pow(newY - holeY, 2)
        );
        
        if (distanceToHole < 20) {
          setIsMoving(false);
          setCurrentVelocity({ x: 0, y: 0 });
          onHoleReached();
        }

        return newPos;
      });

      if (isMoving) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMoving, boardWidth, boardHeight, obstacles, startX, startY, holeX, holeY, onPositionChange, onHoleReached]);

  return (
    <>
      {/* Ball trail */}
      {trailRef.current.map((point, index) => (
        <div
          key={index}
          className="absolute w-3 h-3 bg-white rounded-full pointer-events-none"
          style={{
            left: point.x - 6,
            top: point.y - 6,
            opacity: point.opacity * 0.6,
            transform: `scale(${1 - index * 0.1})`,
          }}
        />
      ))}
      
      {/* Main ball */}
      <div
        className="absolute w-4 h-4 bg-white rounded-full border-2 border-gray-300 shadow-lg transition-all duration-75 z-10"
        style={{
          left: position.x - 8,
          top: position.y - 8,
          transform: isMoving ? 'scale(1.1)' : 'scale(1)',
          boxShadow: isMoving 
            ? '0 4px 20px rgba(0,0,0,0.3), 0 0 0 3px rgba(255,255,255,0.3)' 
            : '0 2px 10px rgba(0,0,0,0.2)',
        }}
      >
        {/* Ball texture */}
        <div className="absolute inset-0.5 bg-gradient-to-br from-white to-gray-200 rounded-full" />
        <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-80" />
      </div>
    </>
  );
};