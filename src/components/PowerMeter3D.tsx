import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PowerMeter3DProps {
  isAiming: boolean;
  power: number;
  aimDirection: { x: number, z: number };
  onStartAiming: () => void;
  onUpdateAim: (direction: { x: number, z: number }, power: number) => void;
  onShoot: () => void;
}

export const PowerMeter3D = ({ 
  isAiming, 
  power, 
  aimDirection,
  onStartAiming, 
  onUpdateAim, 
  onShoot 
}: PowerMeter3DProps) => {
  const [currentDirection, setCurrentDirection] = useState({ x: 0, z: 1 });
  const [isCharging, setIsCharging] = useState(false);
  const [chargePower, setChargePower] = useState(0);
  const chargingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const powerButtonRef = useRef<HTMLButtonElement>(null);
  const isDraggingRef = useRef(false);

  // Clear charging interval when component unmounts
  useEffect(() => {
    return () => {
      if (chargingIntervalRef.current) {
        clearInterval(chargingIntervalRef.current);
      }
    };
  }, []);

  // Stop charging when power reaches 100%
  useEffect(() => {
    if (chargePower >= 100 && isCharging) {
      handlePowerStop();
    }
  }, [chargePower, isCharging]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isAiming || !isDraggingRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    // Normalize the direction vector
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (length > 0) {
      const normalizedX = deltaX / length;
      const normalizedZ = deltaY / length;
      
      setCurrentDirection({ x: normalizedX, z: normalizedZ });
      onUpdateAim({ x: normalizedX, z: normalizedZ }, chargePower);
    }
  }, [isAiming, chargePower, onUpdateAim]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = false;
  }, []);

  const startCharging = useCallback(() => {
    if (isCharging) return;
    
    setIsCharging(true);
    setChargePower(0);
    
    chargingIntervalRef.current = setInterval(() => {
      setChargePower(prev => {
        const newPower = Math.min(prev + 3, 100);
        onUpdateAim(currentDirection, newPower);
        return newPower;
      });
    }, 50);
  }, [currentDirection, onUpdateAim, isCharging]);

  const handlePowerStop = useCallback(() => {
    if (!isCharging) return;
    
    setIsCharging(false);
    if (chargingIntervalRef.current) {
      clearInterval(chargingIntervalRef.current);
      chargingIntervalRef.current = null;
    }
    
    if (chargePower > 0) {
      onShoot();
    }
    setChargePower(0);
  }, [isCharging, chargePower, onShoot]);

  const handlePowerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAiming) {
      onStartAiming();
    } else {
      startCharging();
    }
  }, [isAiming, onStartAiming, startCharging]);

  const handlePowerMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handlePowerStop();
  }, [handlePowerStop]);

  // Handle mouse leave to stop charging
  const handleMouseLeave = useCallback(() => {
    if (isCharging) {
      handlePowerStop();
    }
  }, [isCharging, handlePowerStop]);

  // Add global mouse up listener when charging
  useEffect(() => {
    if (!isCharging) return;

    const handleGlobalMouseUp = () => {
      handlePowerStop();
    };

    const handleGlobalMouseLeave = () => {
      handlePowerStop();
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mouseleave', handleGlobalMouseLeave);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseLeave);
    };
  }, [isCharging, handlePowerStop]);

  return (
    <Card className="game-ui-panel pointer-events-auto">
      <div className="space-y-4 w-80">
        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground">
          {!isAiming && "Click 'Aim' to start"}
          {isAiming && !isCharging && "Drag in the aiming area to set direction, then hold 'Power' to charge"}
          {isCharging && "Release to shoot!"}
        </div>
        
        {/* Aiming Area */}
        {isAiming && (
          <div 
            className="relative h-32 bg-muted/20 rounded-lg border-2 border-dashed border-primary cursor-crosshair overflow-hidden select-none"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            style={{ userSelect: 'none' }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-primary rounded-full z-10" />
              
              {/* Direction indicator */}
              <div 
                className="absolute w-1 h-16 bg-primary origin-bottom transform-gpu transition-transform duration-100"
                style={{ 
                  transform: `translate(-50%, -100%) rotate(${Math.atan2(currentDirection.x, currentDirection.z)}rad)`,
                  transformOrigin: 'bottom center'
                }}
              />
              
              {/* Power indicator circle */}
              {chargePower > 0 && (
                <div 
                  className="absolute border-2 border-accent rounded-full opacity-60"
                  style={{ 
                    width: `${20 + (chargePower / 100) * 60}px`,
                    height: `${20 + (chargePower / 100) * 60}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              )}
            </div>
            
            {/* Grid background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/2 left-0 w-full h-px bg-primary" />
              <div className="absolute left-1/2 top-0 w-px h-full bg-primary" />
            </div>
          </div>
        )}
        
        {/* Power Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Power</span>
            <span className={chargePower > 80 ? 'text-destructive font-bold' : ''}>{Math.round(chargePower)}%</span>
          </div>
          <div className="power-meter">
            <div 
              className="power-fill h-full transition-all duration-100"
              style={{ width: `${chargePower}%` }}
            />
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2">
          {!isAiming ? (
            <Button 
              onClick={onStartAiming}
              className="flex-1"
              variant="default"
            >
              🎯 Aim
            </Button>
          ) : (
            <Button
              ref={powerButtonRef}
              onMouseDown={handlePowerMouseDown}
              onMouseUp={handlePowerMouseUp}
              onMouseLeave={handleMouseLeave}
              className={`flex-1 select-none ${isCharging ? 'animate-power-pulse' : ''}`}
              variant={isCharging ? "destructive" : "default"}
              style={{ userSelect: 'none' }}
            >
              {isCharging ? `⚡ ${Math.round(chargePower)}%` : '💪 Hold for Power'}
            </Button>
          )}
        </div>
        
        {/* Tips */}
        <div className="text-xs text-muted-foreground text-center">
          💡 {isCharging 
            ? 'Release mouse to shoot!' 
            : isAiming 
            ? 'Drag to aim, then hold power button'
            : 'Start by clicking Aim to set your shot direction'
          }
        </div>
      </div>
    </Card>
  );
};