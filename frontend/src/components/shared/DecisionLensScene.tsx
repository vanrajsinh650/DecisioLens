"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

const BOUND = { x: 2.4, y: 2.4, z: 1.6 };

function FloatingBalls({ count, speedMul }: { count: number; speedMul: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const lineRef = useRef<THREE.LineSegments>(null);

    // Amber #D97706, Violet #7C3AED, Teal #0D9488, White #ffffff
    const palette = useMemo(() => [
        new THREE.Color("#D97706"),
        new THREE.Color("#D97706"),
        new THREE.Color("#D97706"),
        new THREE.Color("#7C3AED"),
        new THREE.Color("#0D9488"),
        new THREE.Color("#ffffff"),
    ], []);

    const balls = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            pos: new THREE.Vector3(
                (Math.random() - 0.5) * 2 * BOUND.x,
                (Math.random() - 0.5) * 2 * BOUND.y,
                (Math.random() - 0.5) * 2 * BOUND.z
            ),
            vel: new THREE.Vector3(
                (Math.random() - 0.5) * 0.25,
                (Math.random() - 0.5) * 0.25,
                (Math.random() - 0.5) * 0.25
            ),
            color: palette[i % palette.length],
            size: 0.05 + Math.random() * 0.06,
            pulse: 0.5 + Math.random() * 1.2,
            phase: Math.random() * Math.PI * 2
        }));
    }, [count, palette]);

    const colorArray = useMemo(() => {
        const arr = new Float32Array(count * 3);
        balls.forEach((b, i) => {
            b.color.toArray(arr, i * 3);
        });
        return arr;
    }, [balls, count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const linePositions = useMemo(() => new Float32Array(count * count * 2 * 3), [count]);

    useFrame((state, delta) => {
        const dt = Math.min(delta, 0.05) * speedMul;
        const t = state.clock.getElapsedTime();

        let lineIdx = 0;

        for (let i = 0; i < count; i++) {
            const b = balls[i];
            
            b.pos.addScaledVector(b.vel, dt);

            if (Math.abs(b.pos.x) > BOUND.x) { b.vel.x *= -1; b.pos.x = Math.sign(b.pos.x) * BOUND.x; }
            if (Math.abs(b.pos.y) > BOUND.y) { b.vel.y *= -1; b.pos.y = Math.sign(b.pos.y) * BOUND.y; }
            if (Math.abs(b.pos.z) > BOUND.z) { b.vel.z *= -1; b.pos.z = Math.sign(b.pos.z) * BOUND.z; }

            const pulse = 0.85 + Math.sin(t * b.pulse + b.phase) * 0.15;
            
            dummy.position.copy(b.pos);
            dummy.scale.setScalar(b.size * (0.85 + pulse * 0.4));
            dummy.updateMatrix();

            if (meshRef.current) {
                meshRef.current.setMatrixAt(i, dummy.matrix);
            }

            for (let j = i + 1; j < count; j++) {
                const b2 = balls[j];
                const distSq = b.pos.distanceToSquared(b2.pos);
                if (distSq < 4.0) { // dist < 2.0 -> distSq < 4.0
                    linePositions[lineIdx++] = b.pos.x;
                    linePositions[lineIdx++] = b.pos.y;
                    linePositions[lineIdx++] = b.pos.z;

                    linePositions[lineIdx++] = b2.pos.x;
                    linePositions[lineIdx++] = b2.pos.y;
                    linePositions[lineIdx++] = b2.pos.z;
                }
            }
        }

        if (meshRef.current) {
            meshRef.current.instanceMatrix.needsUpdate = true;
        }

        if (lineRef.current) {
            lineRef.current.geometry.setDrawRange(0, lineIdx / 3);
            lineRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <group>
            <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]}>
                <sphereGeometry args={[1, 14, 14]} />
                <meshBasicMaterial transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
                <instancedBufferAttribute attach="instanceColor" args={[colorArray, 3]} />
            </instancedMesh>
            <lineSegments ref={lineRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} />
                </bufferGeometry>
                <lineBasicMaterial color="#D97706" transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
            </lineSegments>
        </group>
    );
}

function ParallaxRig({ children }: { children: React.ReactNode }) {
    const group = useRef<THREE.Group>(null);
    const { pointer } = useThree();

    useFrame(() => {
        if (!group.current) return;
        const targetX = pointer.y * 0.18;
        const targetY = pointer.x * 0.25;
        group.current.rotation.x += (targetX - group.current.rotation.x) * 0.04;
        group.current.rotation.y += (targetY - group.current.rotation.y) * 0.04;
    });

    return <group ref={group}>{children}</group>;
}

export default function DecisionLensScene() {
    const [hovered, setHovered] = useState(false);

    return (
        <div 
            className="relative z-20 mx-auto aspect-square w-full max-w-xl animate-fade-in"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div 
                className="pointer-events-none absolute inset-0 rounded-full opacity-40 blur-3xl"
                style={{
                    background: "radial-gradient(ellipse at 50% 50%, hsl(28 95% 50% / 0.18), transparent 70%)"
                }}
            />
            <Canvas 
                camera={{ position: [0, 0, 7], fov: 50 }}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                dpr={[1, 2]} 
                style={{ background: "transparent" }}
            >
                <ParallaxRig>
                    <FloatingBalls count={45} speedMul={hovered ? 1.6 : 1} />
                </ParallaxRig>
            </Canvas>
        </div>
    );
}
