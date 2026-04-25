"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * DecisionLensScene A rotating wireframe torus ("the lens") with orbiting 
 * data nodes and ambient particle dust. Inspired by AgentScope's planetary ring
 * but themed for decision auditing a scanning instrument peering into the void.
 * 
 * Renders behind the hero text, responds to mouse parallax, and fades in on load.
 */

const TORUS_RADIUS = 180;
const TORUS_TUBE = 50;
const NODE_COUNT = 40;
const DUST_COUNT = 300;
const LERP_SPEED = 0.03;

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export default function DecisionLensScene() {
    const [enabled, setEnabled] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const rafId = useRef(0);
    const mouseTarget = useRef({ x: 0, y: 0 });
    const mouseCurrent = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const media = window.matchMedia("(min-width: 768px)");
        const sync = () => setEnabled(media.matches);
        sync();
        media.addEventListener("change", sync);
        return () => media.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        if (!enabled) return;
        const container = containerRef.current;
        if (!container) return;

        const dpr = Math.min(window.devicePixelRatio, 2);
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        // Orbit is perfectly centered vertically
        scene.position.y = 0;

        // Camera perspective for depth
        const camera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);
        camera.position.set(0, 100, 480);
        camera.lookAt(0, 0, 0);

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // ─── Main wireframe torus (the "lens") ───
        const torusGeom = new THREE.TorusGeometry(TORUS_RADIUS, TORUS_TUBE, 24, 64);
        const torusMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color("#FF4500"),
            wireframe: true,
            transparent: true,
            opacity: 0.15,
        });
        const torus = new THREE.Mesh(torusGeom, torusMat);
        torus.rotation.x = Math.PI * 0.5;
        scene.add(torus);

        // ─── Inner ring (scanning band) ───
        const innerRingGeom = new THREE.TorusGeometry(TORUS_RADIUS * 0.55, 2, 8, 80);
        const innerRingMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color("#9E9E9E"),
            wireframe: true,
            transparent: true,
            opacity: 0.25,
        });
        const innerRing = new THREE.Mesh(innerRingGeom, innerRingMat);
        innerRing.rotation.x = Math.PI * 0.5;
        scene.add(innerRing);

        // ─── Outer ring (boundary) ───
        const outerRingGeom = new THREE.TorusGeometry(TORUS_RADIUS * 1.4, 1.5, 6, 100);
        const outerRingMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color("#FF4500"),
            wireframe: true,
            transparent: true,
            opacity: 0.08,
        });
        const outerRing = new THREE.Mesh(outerRingGeom, outerRingMat);
        outerRing.rotation.x = Math.PI * 0.55;
        scene.add(outerRing);

        // ─── Orbiting data nodes ───
        const nodeGroup = new THREE.Group();
        scene.add(nodeGroup);

        const nodePositions: { angle: number; radius: number; speed: number; yOffset: number }[] = [];
        const nodeGeom = new THREE.SphereGeometry(2, 6, 6);

        const nodeColors = [
            new THREE.Color("#2E7D32"), // green
            new THREE.Color("#D32F2F"), // crimson
            new THREE.Color("#F57C00"), // amber
            new THREE.Color("#FFFFFF"), // white
        ];

        for (let i = 0; i < NODE_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = TORUS_RADIUS * (0.6 + Math.random() * 0.9);
            const speed = 0.002 + Math.random() * 0.004;
            const yOffset = (Math.random() - 0.5) * TORUS_TUBE * 1.5;
            const color = nodeColors[i % nodeColors.length];

            nodePositions.push({ angle, radius, speed, yOffset });

            const nodeMat = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.4 + Math.random() * 0.4,
            });
            const node = new THREE.Mesh(nodeGeom, nodeMat);
            node.position.set(
                Math.cos(angle) * radius,
                yOffset,
                Math.sin(angle) * radius
            );
            nodeGroup.add(node);
        }

        // ─── Ambient dust points ───
        const dustPositions = new Float32Array(DUST_COUNT * 3);
        const dustOpacities = new Float32Array(DUST_COUNT);
        const dustSizes = new Float32Array(DUST_COUNT);

        for (let i = 0; i < DUST_COUNT; i++) {
            dustPositions[i * 3] = (Math.random() - 0.5) * 800;
            dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 500;
            dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 400;
            dustOpacities[i] = 0.05 + Math.random() * 0.2;
            dustSizes[i] = 1 + Math.random() * 2;
        }

        const dustGeom = new THREE.BufferGeometry();
        dustGeom.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));

        const dustMat = new THREE.PointsMaterial({
            color: new THREE.Color("#9E9E9E"),
            size: 1.5,
            transparent: true,
            opacity: 0.15,
            sizeAttenuation: true,
        });
        const dustPoints = new THREE.Points(dustGeom, dustMat);
        scene.add(dustPoints);

        // ─── Connecting lines between nearby nodes ───
        const lineGroup = new THREE.Group();
        scene.add(lineGroup);

        function updateLines() {
            // Remove old lines
            while (lineGroup.children.length > 0) {
                const child = lineGroup.children[0];
                lineGroup.remove(child);
                if (child instanceof THREE.Line) {
                    child.geometry.dispose();
                    (child.material as THREE.Material).dispose();
                }
            }

            const nodes = nodeGroup.children;
            const maxDist = TORUS_RADIUS * 0.7;
            let lineCount = 0;

            for (let i = 0; i < nodes.length && lineCount < 20; i++) {
                for (let j = i + 1; j < nodes.length && lineCount < 20; j++) {
                    const dist = nodes[i].position.distanceTo(nodes[j].position);
                    if (dist < maxDist) {
                        const points = [nodes[i].position.clone(), nodes[j].position.clone()];
                        const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
                        const lineMat = new THREE.LineBasicMaterial({
                            color: new THREE.Color("#FF4500"),
                            transparent: true,
                            opacity: 0.08,
                        });
                        const line = new THREE.Line(lineGeom, lineMat);
                        lineGroup.add(line);
                        lineCount++;
                    }
                }
            }
        }

        // ─── Mouse tracking ───
        const handleMouseMove = (e: MouseEvent) => {
            const nx = (e.clientX / window.innerWidth - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            mouseTarget.current.x = nx * 15;
            mouseTarget.current.y = -ny * 10;
        };
        window.addEventListener("mousemove", handleMouseMove);

        // ─── Animation loop (throttled to 30fps) ───
        let frameCount = 0;
        let lastFrameTime = 0;
        const FRAME_INTERVAL = 1000 / 30;

        const animate = (now: number) => {
            rafId.current = requestAnimationFrame(animate);

            if (now - lastFrameTime < FRAME_INTERVAL) return;
            lastFrameTime = now;

            frameCount++;

            // Mouse parallax
            mouseCurrent.current.x = lerp(mouseCurrent.current.x, mouseTarget.current.x, LERP_SPEED);
            mouseCurrent.current.y = lerp(mouseCurrent.current.y, mouseTarget.current.y, LERP_SPEED);

            // Rotate torus slowly
            torus.rotation.z += 0.001;
            innerRing.rotation.z -= 0.003;
            outerRing.rotation.z += 0.0005;

            // Orbit nodes
            const nodes = nodeGroup.children;
            for (let i = 0; i < nodes.length; i++) {
                const info = nodePositions[i];
                info.angle += info.speed;
                nodes[i].position.x = Math.cos(info.angle) * info.radius;
                nodes[i].position.z = Math.sin(info.angle) * info.radius;
            }

            // Update connecting lines every 30 frames
            if (frameCount % 30 === 0) {
                updateLines();
            }

            // Apply parallax to entire scene
            scene.rotation.y = mouseCurrent.current.x * 0.003;
            scene.rotation.x = mouseCurrent.current.y * 0.003;

            renderer.render(scene, camera);
        };

        if (!document.hidden) {
            rafId.current = requestAnimationFrame(animate);
        }

        // Visibility
        const handleVisibility = () => {
            if (document.hidden) {
                cancelAnimationFrame(rafId.current);
                rafId.current = 0;
            } else if (rafId.current === 0) {
                rafId.current = requestAnimationFrame(animate);
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);

        // Resize
        const handleResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(rafId.current);
            rafId.current = 0;
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("visibilitychange", handleVisibility);
            renderer.dispose();
            torusGeom.dispose();
            torusMat.dispose();
            innerRingGeom.dispose();
            innerRingMat.dispose();
            outerRingGeom.dispose();
            outerRingMat.dispose();
            nodeGeom.dispose();
            dustGeom.dispose();
            dustMat.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                pointerEvents: "none",
                opacity: 0,
                animation: "fade-in 1.5s ease-out 0.5s forwards",
            }}
        />
    );
}
