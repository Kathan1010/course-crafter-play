import { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    if (!isCharging) return;

    const interval = setInterval(() => {
      setChargePower(prev => {
        const newPower = prev + 2;
        if (newPower >= 100) {
          setIsCharging(false);
          onShoot();
          return 0;
        }
        onUpdateAim(aimDirection, newPower);
        return newPower;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isCharging, aimDirection, onUpdateAim, onShoot]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isAiming) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    const angle = Math.atan2(deltaX, deltaY);
    setAimDirection(angle);
    onUpdateAim(angle, chargePower);
  }, [isAiming, chargePower, onUpdateAim]);

  const handlePowerStart = useCallback(() => {
    if (!isAiming) {
      onStartAiming();
    } else {
      setIsCharging(true);
      setChargePower(0);
    }
  }, [isAiming, onStartAiming]);

  const handlePowerStop = useCallback(() => {
    if (isCharging) {
      setIsCharging(false);
      onShoot();
      setChargePower(0);
    }
  }, [isCharging, onShoot]);

  return (
    <Card className="game-ui-panel pointer-events-auto">
      <div className="space-y-4 w-80">
        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground">
          {!isAiming && "Click 'Aim' to start"}
          {isAiming && !isCharging && "Move mouse to aim, then hold 'Power' to charge"}
          {isCharging && "Release to shoot!"}
        </div>
        
        {/* Aiming Area */}
        {isAiming && (
          <div 
            className="relative h-32 bg-muted/20 rounded-lg border-2 border-dashed border-primary cursor-crosshair"
            onMouseMove={handleMouseMove}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-primary rounded-full" />
              {/* Direction indicator */}
              <div 
                className="absolute w-0.5 h-12 bg-primary origin-bottom"
                style={{ 
                  transform: `translate(-50%, -100%) rotate(${aimDirection}rad)`,
                  transformOrigin: 'bottom center'
                }}
              />
            </div>
          </div>
        )}
        
        {/* Power Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Power</span>
            <span>{Math.round(chargePower)}%</span>
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
              onMouseDown={handlePowerStart}
              onMouseUp={handlePowerStop}
              onMouseLeave={handlePowerStop}
              disabled={isCharging}
              className={`flex-1 ${isCharging ? 'animate-power-pulse' : ''}`}
              variant={isCharging ? "destructive" : "default"}
            >
              {isCharging ? '⚡ Charging...' : '💪 Hold for Power'}
            </Button>
          )}
        </div>
        
        {/* Tips */}
        <div className="text-xs text-muted-foreground text-center">
          💡 Higher power = longer shot. Watch out for obstacles!
        </div>
      </div>
    </Card>
  );
};