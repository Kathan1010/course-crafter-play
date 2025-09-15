import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PowerMeterProps {
  isAiming: boolean;
  power: number;
  onStartAiming: () => void;
  onUpdateAim: (direction: number, power: number) => void;
  onShoot: () => void;
}

export const PowerMeter = ({ 
  isAiming, 
  power, 
  onStartAiming, 
  onUpdateAim, 
  onShoot 
}: PowerMeterProps) => {
  const [aimDirection, setAimDirection] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [chargePower, setChargePower] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const chargingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const powerButtonRef = useRef<HTMLButtonElement>(null);

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
    if (!isAiming) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    const angle = Math.atan2(deltaX, deltaY);
    setAimDirection(angle);
    setMousePosition({ x: deltaX, y: deltaY });
    onUpdateAim(angle, chargePower);
  }, [isAiming, chargePower, onUpdateAim]);

  const startCharging = useCallback(() => {
    if (isCharging) return;
    
    setIsCharging(true);
    setChargePower(0);
    
    chargingIntervalRef.current = setInterval(() => {
      setChargePower(prev => {
        const newPower = Math.min(prev + 2, 100);
        onUpdateAim(aimDirection, newPower);
        return newPower;
      });
    }, 50);
  }, [aimDirection, onUpdateAim, isCharging]);

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
          {isAiming && !isCharging && "Move mouse to aim, then press and hold 'Power' to charge"}
          {isCharging && "Release to shoot!"}
        </div>
        
        {/* Aiming Area */}
        {isAiming && (
          <div 
            className="relative h-32 bg-muted/20 rounded-lg border-2 border-dashed border-primary cursor-crosshair overflow-hidden"
            onMouseMove={handleMouseMove}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-primary rounded-full z-10" />
              
              {/* Direction indicator */}
              <div 
                className="absolute w-1 h-16 bg-primary origin-bottom transform-gpu transition-transform duration-75"
                style={{ 
                  transform: `translate(-50%, -100%) rotate(${aimDirection}rad)`,
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
              
              {/* Mouse position indicator */}
              <div 
                className="absolute w-2 h-2 bg-accent rounded-full opacity-50 transition-all duration-75"
                style={{ 
                  left: `calc(50% + ${Math.min(Math.max(mousePosition.x / 4, -50), 50)}px)`,
                  top: `calc(50% + ${Math.min(Math.max(mousePosition.y / 4, -50), 50)}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
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
            : 'Higher power = longer shot. Watch out for obstacles!'
          }
        </div>
      </div>
    </Card>
  );
};