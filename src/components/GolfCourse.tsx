import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Plane } from '@react-three/drei';
import * as THREE from 'three';

interface GolfCourseProps {
  level: number;
}

export const GolfCourse = ({ level }: GolfCourseProps) => {

  const renderLevel1 = () => (
    <>
      {/* Simple straight course */}
      <Plane 
        args={[12, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshLambertMaterial color="#2d5016" />
      </Plane>
      
      {/* Tee area */}
      <Cylinder
        args={[1, 1, 0.1]}
        position={[0, 0.05, 4]}
        receiveShadow
      >
        <meshLambertMaterial color="#4a7c20" />
      </Cylinder>
      
      {/* Hole */}
      <Cylinder
        args={[0.15, 0.15, 0.2]}
        position={[0, -0.1, -4]}
      >
        <meshLambertMaterial color="#000000" />
      </Cylinder>
      
      {/* Flag */}
      <Box args={[0.02, 1, 0.02]} position={[0.3, 0.5, -4]}>
        <meshLambertMaterial color="#8B4513" />
      </Box>
      <Plane args={[0.5, 0.3]} position={[0.55, 0.7, -4]}>
        <meshLambertMaterial color="#FF0000" />
      </Plane>
    </>
  );

  const renderLevel2 = () => (
    <>
      {/* Course with sand trap */}
      <Plane 
        args={[12, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshLambertMaterial color="#2d5016" />
      </Plane>
      
      {/* Sand trap */}
      <Cylinder
        args={[2, 2, 0.05]}
        position={[2, 0.025, 0]}
        receiveShadow
      >
        <meshLambertMaterial color="#F4A460" />
      </Cylinder>
      
      {/* Water hazard */}
      <Cylinder
        args={[1.5, 1.5, 0.05]}
        position={[-2, 0.025, -1]}
        receiveShadow
      >
        <meshLambertMaterial color="#4169E1" />
      </Cylinder>
      
      {/* Tee area */}
      <Cylinder
        args={[1, 1, 0.1]}
        position={[0, 0.05, 4]}
        receiveShadow
      >
        <meshLambertMaterial color="#4a7c20" />
      </Cylinder>
      
      {/* Hole */}
      <Cylinder
        args={[0.15, 0.15, 0.2]}
        position={[0, -0.1, -4]}
      >
        <meshLambertMaterial color="#000000" />
      </Cylinder>
      
      {/* Flag */}
      <Box args={[0.02, 1, 0.02]} position={[0.3, 0.5, -4]}>
        <meshLambertMaterial color="#8B4513" />
      </Box>
      <Plane args={[0.5, 0.3]} position={[0.55, 0.7, -4]}>
        <meshLambertMaterial color="#FF0000" />
      </Plane>
    </>
  );

  const renderLevel3 = () => {
    const rampRef = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
      if (rampRef.current) {
        rampRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      }
    });

    return (
      <>
        {/* Mountain course with elevation changes */}
        <Plane 
          args={[12, 20]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]}
          receiveShadow
        >
          <meshLambertMaterial color="#2d5016" />
        </Plane>
        
        {/* Elevated platform */}
        <Box
          args={[3, 0.5, 3]}
          position={[0, 0.25, 1]}
          receiveShadow
          castShadow
        >
          <meshLambertMaterial color="#4a7c20" />
        </Box>
        
        {/* Animated ramp */}
        <Box
          ref={rampRef}
          args={[2, 0.2, 4]}
          position={[3, 0.1, -1]}
          rotation={[0, 0, 0.2]}
          receiveShadow
          castShadow
        >
          <meshLambertMaterial color="#8B4513" />
        </Box>
        
        {/* Moving obstacle */}
        <MovingObstacle />
        
        {/* Tee area */}
        <Cylinder
          args={[1, 1, 0.1]}
          position={[0, 0.05, 4]}
          receiveShadow
        >
          <meshLambertMaterial color="#4a7c20" />
        </Cylinder>
        
        {/* Hole on elevated platform */}
        <Cylinder
          args={[0.15, 0.15, 0.2]}
          position={[0, 0.4, -4]}
        >
          <meshLambertMaterial color="#000000" />
        </Cylinder>
        
        {/* Flag */}
        <Box args={[0.02, 1, 0.02]} position={[0.3, 1, -4]}>
          <meshLambertMaterial color="#8B4513" />
        </Box>
        <Plane args={[0.5, 0.3]} position={[0.55, 1.2, -4]}>
          <meshLambertMaterial color="#FF0000" />
        </Plane>
      </>
    );
  };

  const MovingObstacle = () => {
    const obstacleRef = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
      if (obstacleRef.current) {
        obstacleRef.current.position.x = Math.sin(state.clock.elapsedTime) * 2;
      }
    });

    return (
      <Box
        ref={obstacleRef}
        args={[0.5, 0.5, 0.5]}
        position={[0, 0.25, -2]}
        castShadow
      >
        <meshLambertMaterial color="#FF6347" />
      </Box>
    );
  };

  return (
    <group>
      {level === 1 && renderLevel1()}
      {level === 2 && renderLevel2()}
      {level === 3 && renderLevel3()}
      
      {/* Boundary walls */}
      <Box args={[0.2, 1, 20]} position={[-6, 0.5, 0]} castShadow>
        <meshLambertMaterial color="#8B4513" />
      </Box>
      <Box args={[0.2, 1, 20]} position={[6, 0.5, 0]} castShadow>
        <meshLambertMaterial color="#8B4513" />
      </Box>
      <Box args={[12, 1, 0.2]} position={[0, 0.5, -10]} castShadow>
        <meshLambertMaterial color="#8B4513" />
      </Box>
      <Box args={[12, 1, 0.2]} position={[0, 0.5, 10]} castShadow>
        <meshLambertMaterial color="#8B4513" />
      </Box>
    </group>
  );
};