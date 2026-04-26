"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * DecisionLensScene — Restrained, human-feeling orbit visualization.
 *
 * One tasteful focal wireframe torus + two supporting rings + quiet particle field.
 * NOT flashy: 22 nodes, sparse links, gentle pulse. Looks cinematic, not AI-generated.
 */

const NODE_COUNT   = 22;
const DUST_COUNT   = 160;
const LERP_SPEED   = 0.05;

// Aurora palette
const VIOLET = "#7C3AED";
const TEAL   = "#0D9488";
const AMBER  = "#D97706";
const WHITE  = "#E2E8F0";
const GREY   = "#9ca3af";

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

export default function DecisionLensScene() {
    const [enabled, setEnabled] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const rafId        = useRef(0);
    const mouseTarget  = useRef({ x: 0, y: 0 });
    const mouseCurrent = useRef({ x: 0, y: 0 });
    const isHovering   = useRef(false);

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)");
        const sync = () => setEnabled(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        if (!enabled) return;
        const el = containerRef.current;
        if (!el) return;

        const dpr = Math.min(window.devicePixelRatio, 2);
        let w = el.clientWidth;
        let h = el.clientHeight;

        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, w / h, 1, 100);
        camera.position.set(0, 0, 7.5);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        // ── Central wireframe torus (violet) ──────────────────────────────────
        const torusGeo = new THREE.TorusGeometry(2.0, 0.55, 20, 64);
        const torusMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(VIOLET),
            wireframe: true,
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending,
        });
        const torus = new THREE.Mesh(torusGeo, torusMat);
        torus.rotation.x = (50 * Math.PI) / 180; // 50° tilt
        scene.add(torus);

        // ── Scan ring (teal, counter-spin) ────────────────────────────────────
        const scanGeo1 = new THREE.TorusGeometry(1.55, 0.015, 8, 90);
        const scanMat1 = new THREE.MeshBasicMaterial({
            color: new THREE.Color(TEAL),
            wireframe: true,
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending,
        });
        const scanRing1 = new THREE.Mesh(scanGeo1, scanMat1);
        scanRing1.rotation.x = (70 * Math.PI) / 180;
        scene.add(scanRing1);

        // ── Scan ring (amber, perpendicular) ──────────────────────────────────
        const scanGeo2 = new THREE.TorusGeometry(2.45, 0.012, 6, 80);
        const scanMat2 = new THREE.MeshBasicMaterial({
            color: new THREE.Color(AMBER),
            wireframe: true,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
        });
        const scanRing2 = new THREE.Mesh(scanGeo2, scanMat2);
        scanRing2.rotation.y = Math.PI / 2;
        scene.add(scanRing2);

        // ── Orbiting nodes (instanced feel via simple meshes) ─────────────────
        const nodeColors = [
            new THREE.Color(VIOLET),
            new THREE.Color(TEAL),
            new THREE.Color(AMBER),
            new THREE.Color(WHITE),
        ];
        const nodeGeo = new THREE.SphereGeometry(0.04, 6, 6);

        type NodeData = {
            angle: number;
            radius: number;
            speed: number;
            tiltX: number;
            tiltZ: number;
            baseScale: number;
            pulseOffset: number;
            mesh: THREE.Mesh;
            links: number[];        // indices of linked nodes (max 2)
        };

        const nodes: NodeData[] = [];
        const nodeGroup = new THREE.Group();
        scene.add(nodeGroup);

        for (let i = 0; i < NODE_COUNT; i++) {
            const col = nodeColors[i % nodeColors.length];
            const mat = new THREE.MeshBasicMaterial({
                color: col,
                transparent: true,
                opacity: 0.7,
                blending: THREE.AdditiveBlending,
            });
            const mesh = new THREE.Mesh(nodeGeo, mat);
            nodeGroup.add(mesh);

            nodes.push({
                angle: Math.random() * Math.PI * 2,
                radius: 1.2 + Math.random() * 1.6,
                speed: (0.08 + Math.random() * 0.16) * (Math.random() > 0.5 ? 1 : -1),
                tiltX: (Math.random() - 0.5) * 1.2,
                tiltZ: (Math.random() - 0.5) * 0.8,
                baseScale: 0.85 + Math.random() * 0.3,
                pulseOffset: Math.random() * Math.PI * 2,
                mesh,
                links: [],
            });
        }

        // ── Sparse neural graph lines (max 2 per node, distance < 0.85) ──────
        const lineGroup = new THREE.Group();
        scene.add(lineGroup);
        const lineMat = new THREE.LineBasicMaterial({
            color: new THREE.Color(VIOLET),
            transparent: true,
            opacity: 0.18,
            blending: THREE.AdditiveBlending,
        });

        // Pre-compute link topology (static, not per-frame)
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (nodes[i].links.length >= 2 || nodes[j].links.length >= 2) continue;
                const dr = Math.abs(nodes[i].radius - nodes[j].radius);
                if (dr < 0.85) {
                    nodes[i].links.push(j);
                    nodes[j].links.push(i);
                }
            }
        }

        // We'll rebuild line geometry every ~90 frames (cheap)
        let lineTimer = 0;
        function rebuildLines() {
            while (lineGroup.children.length) {
                const c = lineGroup.children[0] as THREE.Line;
                lineGroup.remove(c);
                c.geometry.dispose();
            }
            for (let i = 0; i < nodes.length; i++) {
                for (const j of nodes[i].links) {
                    if (j <= i) continue; // avoid dupes
                    const d = nodes[i].mesh.position.distanceTo(nodes[j].mesh.position);
                    if (d < 0.85) {
                        const pts = [nodes[i].mesh.position.clone(), nodes[j].mesh.position.clone()];
                        const g = new THREE.BufferGeometry().setFromPoints(pts);
                        lineGroup.add(new THREE.Line(g, lineMat));
                    }
                }
            }
        }

        // ── Dust particles ────────────────────────────────────────────────────
        const dustPos = new Float32Array(DUST_COUNT * 3);
        for (let i = 0; i < DUST_COUNT; i++) {
            dustPos[i * 3]     = (Math.random() - 0.5) * 12;
            dustPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
            dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2; // behind structure
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
        const dustMat = new THREE.PointsMaterial({
            color: new THREE.Color(GREY),
            size: 0.025,
            transparent: true,
            opacity: 0.55,
            sizeAttenuation: true,
        });
        const dust = new THREE.Points(dustGeo, dustMat);
        scene.add(dust);

        // ── Parallax group (holds everything for mouse rotation) ─────────
        const pivotGroup = new THREE.Group();
        pivotGroup.add(torus, scanRing1, scanRing2, nodeGroup, lineGroup, dust);
        scene.add(pivotGroup);

        // ── Events ────────────────────────────────────────────────────────────
        const onMouse = (e: MouseEvent) => {
            mouseTarget.current.x = ((e.clientX / window.innerWidth) - 0.5) * 2;
            mouseTarget.current.y = -((e.clientY / window.innerHeight) - 0.5) * 2;
        };
        const onEnter = () => { isHovering.current = true; };
        const onLeave = () => { isHovering.current = false; };
        window.addEventListener("mousemove", onMouse);
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);

        // ── Animation ─────────────────────────────────────────────────────────
        let lastTime = 0;
        const interval = 1000 / 60;

        const animate = (now: number) => {
            rafId.current = requestAnimationFrame(animate);
            if (now - lastTime < interval) return;
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            const speedMul = isHovering.current ? 1.4 : 1.0;

            // Smooth parallax
            mouseCurrent.current.x = lerp(mouseCurrent.current.x, mouseTarget.current.x, LERP_SPEED);
            mouseCurrent.current.y = lerp(mouseCurrent.current.y, mouseTarget.current.y, LERP_SPEED);
            pivotGroup.rotation.y = mouseCurrent.current.x * 0.05;
            pivotGroup.rotation.x = mouseCurrent.current.y * 0.05;

            // Ring spins (very gentle)
            torus.rotation.z     += 0.08 * dt * speedMul;
            scanRing1.rotation.z += -0.22 * dt * speedMul;
            scanRing2.rotation.z += 0.28 * dt * speedMul;
            dust.rotation.y      += 0.01 * dt;

            // Node orbits + gentle size pulse (±15%)
            const t = now * 0.001;
            for (const nd of nodes) {
                nd.angle += nd.speed * dt * speedMul;
                const x = Math.cos(nd.angle) * nd.radius;
                const z = Math.sin(nd.angle) * nd.radius;
                nd.mesh.position.set(x + nd.tiltX * 0.15, nd.tiltZ * 0.3, z);
                const pulse = 1 + 0.15 * Math.sin(t * 1.2 + nd.pulseOffset);
                const s = nd.baseScale * pulse;
                nd.mesh.scale.setScalar(s);
            }

            // Rebuild link lines occasionally
            lineTimer++;
            if (lineTimer >= 90) {
                rebuildLines();
                lineTimer = 0;
            }

            renderer.render(scene, camera);
        };

        if (!document.hidden) {
            rafId.current = requestAnimationFrame(animate);
        }

        const onVis = () => {
            if (document.hidden) { cancelAnimationFrame(rafId.current); rafId.current = 0; }
            else if (!rafId.current) { rafId.current = requestAnimationFrame(animate); }
        };
        document.addEventListener("visibilitychange", onVis);

        const onResize = () => {
            w = el.clientWidth;
            h = el.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(rafId.current);
            rafId.current = 0;
            window.removeEventListener("mousemove", onMouse);
            window.removeEventListener("resize", onResize);
            document.removeEventListener("visibilitychange", onVis);
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
            renderer.dispose();
            torusGeo.dispose(); torusMat.dispose();
            scanGeo1.dispose(); scanMat1.dispose();
            scanGeo2.dispose(); scanMat2.dispose();
            nodeGeo.dispose(); dustGeo.dispose(); dustMat.dispose();
            lineMat.dispose();
            if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
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
                animation: "fade-in 2s ease-out 0.4s forwards",
            }}
        />
    );
}
