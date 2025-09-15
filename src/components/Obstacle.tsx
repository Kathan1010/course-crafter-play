import { useState, useEffect } from 'react';

interface ObstacleProps {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Obstacle = ({ type, x, y, width, height }: ObstacleProps) => {
  const [animationOffset, setAnimationOffset] = useState(0);

  useEffect(() => {
    if (type === 'movingPlatform' || type === 'windmill') {
      const interval = setInterval(() => {
        setAnimationOffset(prev => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [type]);

  const renderObstacle = () => {
    switch (type) {
      case 'wall':
        return (
          <div
            className="absolute bg-amber-800 border-2 border-amber-900 shadow-lg"
            style={{ left: x, top: y, width, height }}
          >
            <div className="absolute inset-1 bg-gradient-to-br from-amber-700 to-amber-900" />
          </div>
        );

      case 'sand':
        return (
          <div
            className="absolute bg-yellow-300 border-2 border-yellow-400 rounded-lg shadow-inner"
            style={{ left: x, top: y, width, height }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded opacity-70" />
            <div className="absolute inset-2 bg-yellow-300 rounded opacity-50" />
            <div className="absolute top-2 left-2 text-xs text-yellow-700 font-bold">SAND</div>
          </div>
        );

      case 'water':
        return (
          <div
            className="absolute bg-blue-400 border-2 border-blue-500 rounded-lg shadow-inner overflow-hidden"
            style={{ left: x, top: y, width, height }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-500 opacity-80"
              style={{
                background: `linear-gradient(${animationOffset}deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)`
              }}
            />
            <div className="absolute top-2 left-2 text-xs text-blue-800 font-bold">WATER</div>
          </div>
        );

      case 'movingPlatform':
        return (
          <div
            className="absolute bg-gray-600 border-2 border-gray-700 rounded shadow-lg transition-transform duration-100"
            style={{ 
              left: x + Math.sin(animationOffset * 0.1) * 30, 
              top: y, 
              width, 
              height,
              transform: `translateX(${Math.sin(animationOffset * 0.05) * 20}px)`
            }}
          >
            <div className="absolute inset-1 bg-gradient-to-br from-gray-500 to-gray-700 rounded" />
            <div className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
        );

      case 'windmill':
        return (
          <div
            className="absolute flex items-center justify-center"
            style={{ left: x, top: y, width, height }}
          >
            {/* Windmill base */}
            <div className="absolute w-8 h-12 bg-red-600 bottom-0 left-1/2 transform -translate-x-1/2" />
            
            {/* Windmill blades */}
            <div
              className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-1"
              style={{ 
                transform: `translate(-50%, 0) rotate(${animationOffset * 4}deg)`,
                transformOrigin: 'center'
              }}
            >
              <div className="absolute w-8 h-1 bg-amber-800 -translate-x-4" />
              <div className="absolute w-1 h-8 bg-amber-800 -translate-y-4" />
              <div className="absolute w-8 h-1 bg-amber-800 translate-x-0 rotate-45" />
              <div className="absolute w-8 h-1 bg-amber-800 translate-x-0 -rotate-45" />
            </div>
          </div>
        );

      case 'bumper':
        return (
          <div
            className="absolute bg-red-500 border-4 border-red-600 rounded-full shadow-lg animate-pulse"
            style={{ left: x, top: y, width, height }}
          >
            <div className="absolute inset-2 bg-gradient-to-br from-red-400 to-red-600 rounded-full" />
            <div className="absolute top-1 left-1 w-2 h-2 bg-red-300 rounded-full" />
          </div>
        );

      case 'bridge':
        return (
          <div
            className="absolute bg-amber-600 border-2 border-amber-700 shadow-lg"
            style={{ left: x, top: y, width, height }}
          >
            <div className="absolute inset-1 bg-gradient-to-br from-amber-500 to-amber-700" />
            <div className="absolute top-0 left-2 right-2 h-1 bg-amber-800" />
          </div>
        );

      case 'loop':
        return (
          <div
            className="absolute border-4 border-gray-600 rounded-full"
            style={{ left: x, top: y, width, height }}
          >
            <div className="absolute inset-4 border-4 border-gray-400 rounded-full" />
            <div className="absolute top-1/2 left-0 w-8 h-1 bg-gray-600 transform -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-8 h-1 bg-gray-600 transform -translate-y-1/2" />
          </div>
        );

      default:
        return (
          <div
            className="absolute bg-gray-500 border-2 border-gray-600"
            style={{ left: x, top: y, width, height }}
          />
        );
    }
  };

  return renderObstacle();
};