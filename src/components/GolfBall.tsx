import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface GolfBallProps {
  position: number[];
  velocity: number[];
  onPositionChange: (position: number[]) => void;
  onVelocityChange: (velocity: number[]) => void;
  onStopMoving: () => void;
  onCheckHole: (position: number[]) => void;
  isAiming: boolean;
  aimDirection: number;
  power: number;
}

export const GolfBall = forwardRef<any, GolfBallProps>(({
  position,
  velocity,
  onPositionChange,
  onVelocityChange,
  onStopMoving,
  onCheckHole,
  isAiming,
  aimDirection,
  power
}, ref) => {
  const ballRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Group>(null);
  const currentPosition = useRef(position);
  const currentVelocity = useRef(velocity);

  useImperativeHandle(ref, () => ballRef.current);

  useEffect(() => {
    currentPosition.current = position;
    if (ballRef.current) {
      ballRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [position]);

  useEffect(() => {
    currentVelocity.current = velocity;
  }, [velocity]);

  useFrame((state, delta) => {
    if (!ballRef.current) return;

    // Apply velocity
    const vel = currentVelocity.current;
    if (vel[0] !== 0 || vel[2] !== 0) {
      const newX = currentPosition.current[0] + vel[0] * delta;
      const newZ = currentPosition.current[2] + vel[2] * delta;
      
      // Boundary checks
      const boundedX = Math.max(-5.5, Math.min(5.5, newX));
      const boundedZ = Math.max(-9.5, Math.min(9.5, newZ));
      
      currentPosition.current = [boundedX, currentPosition.current[1], boundedZ];
      ballRef.current.position.set(boundedX, currentPosition.current[1], boundedZ);
      
      // Apply friction
      const friction = 0.98;
      const newVelX = vel[0] * friction;
      const newVelZ = vel[2] * friction;
      
      // Stop if velocity is very low
      if (Math.abs(newVelX) < 0.01 && Math.abs(newVelZ) < 0.01) {
        currentVelocity.current = [0, 0, 0];
        onVelocityChange([0, 0, 0]);
        onStopMoving();
      } else {
        currentVelocity.current = [newVelX, 0, newVelZ];
        onVelocityChange([newVelX, 0, newVelZ]);
      }
      
      // Rotation based on movement
      ballRef.current.rotation.x += Math.abs(newVelZ) * delta * 2;
      ballRef.current.rotation.z -= Math.abs(newVelX) * delta * 2;
      
      onPositionChange(currentPosition.current);
      onCheckHole(currentPosition.current);
    }
  });

  // Aiming line points
  const aimingLinePoints = isAiming ? [
    new THREE.Vector3(position[0], position[1], position[2]),
    new THREE.Vector3(
      position[0] + Math.sin(aimDirection) * (power / 100) * 5,
      position[1],
      position[2] + Math.cos(aimDirection) * (power / 100) * 5
    )
  ] : [new THREE.Vector3(), new THREE.Vector3()];

  return (
    <group>
      <Sphere
        ref={ballRef}
        args={[0.1, 16, 16]}
        position={[position[0], position[1], position[2]]}
        castShadow
      >
        <meshPhongMaterial 
          color="#ffffff" 
          shininess={100}
          transparent={isAiming}
          opacity={isAiming ? 0.8 : 1.0}
        />
      </Sphere>
      
      {/* Aiming line */}
      {isAiming && power > 0 && (
        <Line
          points={aimingLinePoints}
          color="#ff6b35"
          lineWidth={3}
          dashed={true}
          dashSize={0.1}
          gapSize={0.05}
        />
      )}
      
      {/* Power indicator circle */}
      {isAiming && power > 0 && (
        <mesh position={[position[0], position[1] + 0.01, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.15, 0.15 + (power / 100) * 0.5, 32]} />
          <meshBasicMaterial 
            color="#ff6b35" 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Ball trail effect when moving */}
      {(currentVelocity.current[0] !== 0 || currentVelocity.current[2] !== 0) && (
        <group ref={trailRef}>
          {[...Array(5)].map((_, i) => (
            <Sphere
              key={i}
              args={[0.05 - i * 0.008, 8, 8]}
              position={[
                position[0] - Math.sin(aimDirection) * i * 0.2,
                position[1],
                position[2] - Math.cos(aimDirection) * i * 0.2
              ]}
            >
              <meshBasicMaterial 
                color="#ffffff" 
                transparent 
                opacity={0.3 - i * 0.05}
              />
            </Sphere>
          ))}
        </group>
      )}
    </group>
  );
});