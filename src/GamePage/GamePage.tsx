import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";

function SpinningCube() {
    const meshRef = useRef<Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.5;
            meshRef.current.rotation.y += delta * 0.8;
        }
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshStandardMaterial color="#c9a96e" metalness={0.3} roughness={0.4} />
        </mesh>
    );
}

export function GamePage() {
    return (
        <div className="w-full h-screen">
            <Canvas
                camera={{ position: [3, 2, 4], fov: 50 }}
                gl={{ antialias: true }}
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} />
                <directionalLight position={[-3, -1, -2]} intensity={0.4} />
                <SpinningCube />
            </Canvas>
        </div>
    );
}
