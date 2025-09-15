import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-golf-green mb-4">
            🏌️ Mini Golf 2D
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Challenge yourself with 10 unique courses, from beginner-friendly greens to expert-level obstacles!
          </p>
        </div>
        
        <Card className="p-8 bg-white/80 backdrop-blur-sm">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold mb-1">Perfect Your Aim</h3>
                <p className="text-sm text-muted-foreground">Intuitive mouse controls for precise shots</p>
              </div>
              <div className="p-4">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold mb-1">Power Control</h3>
                <p className="text-sm text-muted-foreground">Hold and release for the perfect power</p>
              </div>
              <div className="p-4">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-semibold mb-1">10 Unique Levels</h3>
                <p className="text-sm text-muted-foreground">From simple courses to challenging obstacles</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/levels">
                <Button size="lg" className="text-lg px-8">
                  🎮 Choose Level
                </Button>
              </Link>
              <Link to="/game/1">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  🚀 Quick Start
                </Button>
              </Link>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>✨ Features: Realistic physics • Beautiful animations • Progressive difficulty</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
