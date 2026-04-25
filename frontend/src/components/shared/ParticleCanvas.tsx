"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * DecisioLens Living Ambient Dust Field
 * 
 * 800 static dust particles rendered via Three.js WebGL.
 * Parallax shift on mouse-move using lerp interpolation at 0.04 speed.
 * requestAnimationFrame-driven at 60fps with devicePixelRatio awareness.
 * Auto-pauses when document.hidden is true.
 * Hidden below 768px viewport width (handled via CSS).
 */

const PARTICLE_COUNT = 800;
const PARALLAX_RANGE = 18; // ±18px max shift
const LERP_SPEED = 0.04;

// Color distribution: 60% white-gray, 25% aurora-violet, 15% aurora-teal
const COLOR_WHITE_GRAY = new THREE.Color("#C8D0E0");
const COLOR_AURORA_VIOLET = new THREE.Color().setHSL(265 / 360, 0.65, 0.70);
const COLOR_AURORA_TEAL = new THREE.Color().setHSL(172 / 360, 0.60, 0.55);

function lerp(current: number, target: number, factor: number): number {
    return current + (target - current) * factor;
}

export default function ParticleCanvas() {
    const [enabled, setEnabled] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const particleGroupRef = useRef<THREE.Group | null>(null);
    const mouseTarget = useRef({ x: 0, y: 0 });
    const mouseCurrent = useRef({ x: 0, y: 0 });
    const rafId = useRef<number>(0);

    useEffect(() => {
        const media = window.matchMedia("(min-width: 768px)");
        const sync = () => setEnabled(media.matches);
        sync();

        const listener = () => sync();
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, []);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const container = containerRef.current;
        if (!container) return;

        const dpr = Math.min(window.devicePixelRatio, 2);
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Orthographic camera (pixel-perfect)
        const camera = new THREE.OrthographicCamera(
            -width / 2, width / 2,
            height / 2, -height / 2,
            0.1, 1000
        );
        camera.position.z = 100;
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
        });
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Create particles
        const group = new THREE.Group();
        particleGroupRef.current = group;
        scene.add(group);

        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const sizes = new Float32Array(PARTICLE_COUNT);
        const opacities = new Float32Array(PARTICLE_COUNT);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Random position across entire viewport
            positions[i * 3] = (Math.random() - 0.5) * width * 1.2;
            positions[i * 3 + 1] = (Math.random() - 0.5) * height * 1.2;
            positions[i * 3 + 2] = 0;

            // Size: 0.3–1.5px
            sizes[i] = 0.3 + Math.random() * 1.2;

            // Opacity: 0.06–0.3
            opacities[i] = 0.06 + Math.random() * 0.24;

            // Color distribution
            const colorRoll = Math.random();
            let color: THREE.Color;
            if (colorRoll < 0.60) {
                color = COLOR_WHITE_GRAY;
            } else if (colorRoll < 0.85) {
                color = COLOR_AURORA_VIOLET;
            } else {
                color = COLOR_AURORA_TEAL;
            }

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        // Custom shader material for per-particle opacity and size
        const material = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: `
                attribute float aSize;
                attribute float aOpacity;
                varying float vOpacity;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    vOpacity = aOpacity;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = aSize * ${dpr.toFixed(1)};
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vOpacity;
                varying vec3 vColor;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    float alpha = vOpacity * smoothstep(0.5, 0.3, dist);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            depthWrite: false,
        });

        geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1));

        const points = new THREE.Points(geometry, material);
        group.add(points);

        // Mouse tracking
        const handleMouseMove = (e: MouseEvent) => {
            // Normalize mouse to -1..1
            const nx = (e.clientX / width - 0.5) * 2;
            const ny = (e.clientY / height - 0.5) * 2;
            mouseTarget.current.x = nx * PARALLAX_RANGE;
            mouseTarget.current.y = -ny * PARALLAX_RANGE;
        };
        window.addEventListener("mousemove", handleMouseMove);

        const startAnimation = () => {
            if (rafId.current !== 0) return;

            const animate = () => {
                // Lerp interpolation gravitational, slow
                mouseCurrent.current.x = lerp(mouseCurrent.current.x, mouseTarget.current.x, LERP_SPEED);
                mouseCurrent.current.y = lerp(mouseCurrent.current.y, mouseTarget.current.y, LERP_SPEED);

                group.position.x = mouseCurrent.current.x;
                group.position.y = mouseCurrent.current.y;

                renderer.render(scene, camera);
                rafId.current = requestAnimationFrame(animate);
            };

            rafId.current = requestAnimationFrame(animate);
        };

        const stopAnimation = () => {
            if (rafId.current !== 0) {
                cancelAnimationFrame(rafId.current);
                rafId.current = 0;
            }
        };

        // Animation loop
        if (!document.hidden) {
            startAnimation();
        }

        // Resize handler
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.left = -w / 2;
            camera.right = w / 2;
            camera.top = h / 2;
            camera.bottom = -h / 2;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

        // Visibility change
        const handleVisibility = () => {
            if (document.hidden) {
                stopAnimation();
                return;
            }

            startAnimation();
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            stopAnimation();
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("visibilitychange", handleVisibility);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [enabled]);

    if (!enabled) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            id="particle-canvas"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 0,
                pointerEvents: "none",
                overflow: "hidden",
            }}
            aria-hidden="true"
        />
    );
}
