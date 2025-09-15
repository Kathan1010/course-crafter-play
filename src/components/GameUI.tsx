import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameState } from './MiniGolfGame';

interface GameUIProps {
  gameState: GameState;
  levelInfo: { par: number; name: string; difficulty: number };
}

export const GameUI = ({ gameState, levelInfo }: GameUIProps) => {
  const getScoreText = () => {
    const diff = gameState.strokes - levelInfo.par;
    if (gameState.strokes === 0) return "Ready to play!";
    if (diff < 0) return `${Math.abs(diff)} under par!`;
    if (diff === 0) return "Right on par!";
    return `${diff} over par`;
  };

  const getScoreColor = () => {
    const diff = gameState.strokes - levelInfo.par;
    if (gameState.strokes === 0) return "default";
    if (diff < 0) return "default"; // Excellent
    if (diff === 0) return "secondary"; // Good
    return "destructive"; // Over par
  };

  return (
    <div className="space-y-3">
      <Card className="game-ui-panel">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-golf-green">
            Level {gameState.currentLevel}: {levelInfo.name}
          </h2>
          <div className="flex gap-2">
            {[...Array(levelInfo.difficulty)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-accent rounded-full" />
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Par</div>
            <div className="text-xl font-bold text-golf-green">{levelInfo.par}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Strokes</div>
            <div className="text-xl font-bold">{gameState.strokes}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-xl font-bold text-golf-accent">{gameState.totalStrokes}</div>
          </div>
        </div>
        
        <div className="mt-2 text-center">
          <Badge variant={getScoreColor()}>
            {getScoreText()}
          </Badge>
        </div>
      </Card>
      
      {gameState.levelComplete && (
        <Card className="game-ui-panel animate-level-transition">
          <div className="text-center py-2">
            <div className="text-2xl mb-1">🏌️</div>
            <div className="font-bold text-golf-green">Level Complete!</div>
            <div className="text-sm text-muted-foreground">
              {gameState.strokes} strokes
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};