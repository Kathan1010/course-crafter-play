import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Trophy } from 'lucide-react';

const LEVELS = [
  { id: 1, name: "First Tee", par: 2, difficulty: 1, description: "Learn the basics on this simple straight hole", unlocked: true },
  { id: 2, name: "Gentle Curve", par: 3, difficulty: 1, description: "Navigate a simple curved path", unlocked: true },
  { id: 3, name: "Sand Trap", par: 3, difficulty: 2, description: "Avoid the sand bunker on this tricky hole", unlocked: true },
  { id: 4, name: "Water Hazard", par: 4, difficulty: 2, description: "Don't let your ball splash into the water!", unlocked: true },
  { id: 5, name: "Moving Platform", par: 4, difficulty: 3, description: "Time your shot with the moving platform", unlocked: true },
  { id: 6, name: "Double Dogleg", par: 5, difficulty: 3, description: "Master two turns in this challenging course", unlocked: true },
  { id: 7, name: "Windmill", par: 4, difficulty: 3, description: "Traditional mini golf windmill obstacle", unlocked: true },
  { id: 8, name: "Loop-de-Loop", par: 5, difficulty: 4, description: "Navigate the impossible loop", unlocked: true },
  { id: 9, name: "Pinball Madness", par: 6, difficulty: 4, description: "Bouncing obstacles everywhere!", unlocked: true },
  { id: 10, name: "The Gauntlet", par: 7, difficulty: 5, description: "The ultimate mini golf challenge", unlocked: true },
];

const getDifficultyColor = (difficulty: number) => {
  switch (difficulty) {
    case 1: return "bg-green-500";
    case 2: return "bg-yellow-500";
    case 3: return "bg-orange-500";
    case 4: return "bg-red-500";
    case 5: return "bg-purple-500";
    default: return "bg-gray-500";
  }
};

const getDifficultyText = (difficulty: number) => {
  switch (difficulty) {
    case 1: return "Beginner";
    case 2: return "Easy";
    case 3: return "Medium";
    case 4: return "Hard";
    case 5: return "Expert";
    default: return "Unknown";
  }
};

const Levels = () => {
  const totalLevels = LEVELS.length;
  const completedLevels = 3; // This would come from game state/localStorage

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-golf-green">Course Selection</h1>
              <p className="text-muted-foreground">Choose your challenge</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-golf-accent" />
              <span className="font-semibold">{completedLevels}/{totalLevels} Completed</span>
            </div>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-golf-accent transition-all duration-500"
                style={{ width: `${(completedLevels / totalLevels) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {LEVELS.map((level) => (
            <Card key={level.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="relative">
                {/* Level Preview */}
                <div className="h-32 bg-gradient-to-br from-green-400 to-green-600 p-4 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-300 to-transparent"></div>
                  </div>
                  
                  {/* Mini course preview */}
                  <div className="relative z-10 h-full flex items-center justify-center">
                    <div className="text-6xl opacity-50">🏌️</div>
                  </div>
                  
                  {/* Difficulty indicator */}
                  <div className="absolute top-2 right-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < level.difficulty 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Level Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-golf-green">{level.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{level.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Par {level.par}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getDifficultyColor(level.difficulty)}`} />
                      <span className="text-sm font-medium">{getDifficultyText(level.difficulty)}</span>
                    </div>
                    
                    <Link to={`/game/${level.id}`}>
                      <Button 
                        size="sm"
                        disabled={!level.unlocked}
                        className="group-hover:scale-105 transition-transform"
                      >
                        {level.unlocked ? 'Play' : 'Locked'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Start */}
        <div className="mt-12 text-center">
          <Card className="inline-block p-6">
            <h3 className="text-xl font-bold mb-4">Ready to Play?</h3>
            <div className="flex gap-4">
              <Link to="/game/1">
                <Button size="lg">
                  🏌️ Start from Level 1
                </Button>
              </Link>
              <Link to="/game/random">
                <Button variant="outline" size="lg">
                  🎲 Random Level
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Levels;