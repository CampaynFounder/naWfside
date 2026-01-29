"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const ROWS = 8;
const COLS = 50;
const SEPARATION = 1.2;
const PARTICLE_COUNT = ROWS * COLS;

export default function CardHeaderWave() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scene: THREE.Scene | undefined;
    let camera: THREE.PerspectiveCamera | undefined;
    let renderer: THREE.WebGLRenderer | undefined;
    let particles: THREE.Points | undefined;
    let geometry: THREE.BufferGeometry | undefined;
    let frameId = 0;
    const mouse = new THREE.Vector2();
    const targetMouse = new THREE.Vector2();

    function setTargetFromClient(clientX: number, clientY: number) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const halfX = rect.left + rect.width / 2;
      const halfY = rect.top + rect.height / 2;
      targetMouse.x = (clientX - halfX) * 0.1;
      targetMouse.y = (clientY - halfY) * 0.1;
    }
    function onMove(e: MouseEvent) {
      setTargetFromClient(e.clientX, e.clientY);
    }
    function onTouch(e: TouchEvent) {
      if (e.touches.length > 0) setTargetFromClient(e.touches[0].clientX, e.touches[0].clientY);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });

    function start() {
      const rect = container.getBoundingClientRect();
      const w = Math.round(rect.width) || container.clientWidth || 300;
      const h = Math.round(rect.height) || container.clientHeight || 96;
      if (w < 10 || h < 10) return;

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050505, 0.002);

      const aspect = w / h;
      camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
      camera.position.set(0, 10, 30);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setClearColor(0x050505, 1);
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      const canvas = renderer.domElement;
      canvas.style.display = "block";
      canvas.style.position = "absolute";
      canvas.style.left = "0";
      canvas.style.top = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none";
      container.appendChild(canvas);

      geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const scales = new Float32Array(PARTICLE_COUNT);
      const colors = new Float32Array(PARTICLE_COUNT * 3);
      const color1 = new THREE.Color(0x00ffff);
      const color2 = new THREE.Color(0xff00ff);

      let i = 0;
      for (let x = 0; x < COLS; x++) {
        for (let z = 0; z < ROWS; z++) {
          positions[i * 3] = (x - COLS / 2) * SEPARATION;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = (z - ROWS / 2) * SEPARATION;
          scales[i] = 1;
          const mixRatio = Math.abs((x - COLS / 2) / (COLS / 2));
          const finalColor = color1.clone().lerp(color2, mixRatio);
          colors[i * 3] = finalColor.r;
          colors[i * 3 + 1] = finalColor.g;
          colors[i * 3 + 2] = finalColor.b;
          i++;
        }
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color(0xffffff) } },
        vertexShader: `
          attribute float scale;
          attribute vec3 color;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_PointSize = scale * ( 80.0 / - mvPosition.z );
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
            gl_FragColor = vec4( vColor, 1.0 );
          }
        `,
        transparent: true,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      let time = 0;
      function animate() {
        time += 0.05;
        mouse.x += (targetMouse.x - mouse.x) * 0.05;
        mouse.y += (targetMouse.y - mouse.y) * 0.05;

        const posArr = geometry.attributes.position.array as Float32Array;
        const scaleArr = geometry.attributes.scale.array as Float32Array;
        let idx = 0;
        for (let x = 0; x < COLS; x++) {
          for (let z = 0; z < ROWS; z++) {
            const worldX = (x - COLS / 2) * SEPARATION;
            const worldZ = (z - ROWS / 2) * SEPARATION;
            const dist = Math.sqrt(Math.pow(worldX - mouse.x, 2) + Math.pow(worldZ - mouse.y * 2, 2));
            const mouseInfluence = Math.max(0, (20 - dist) / 5);
            let y = Math.sin((x + time) * 0.3) * 2 + Math.sin((z + time) * 0.5) * 2;
            y += mouseInfluence * Math.sin(x * 2 + time * 5) * 5;
            posArr[idx * 3 + 1] = y;
            let s = (y + 5) / 5;
            scaleArr[idx] = s < 0.5 ? 0.5 : s;
            idx++;
          }
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.scale.needsUpdate = true;
        particles.rotation.y = Math.sin(time * 0.1) * 0.1;
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      }
      animate();
    }

    let resizeObserver: ResizeObserver | null = null;

    function tryStart() {
      if (!containerRef.current) return false;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width >= 10 && rect.height >= 10) {
        start();
        return true;
      }
      return false;
    }

    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (tryStart()) return;
        resizeObserver = new ResizeObserver(() => {
          if (tryStart()) {
            resizeObserver?.disconnect();
            resizeObserver = null;
          }
        });
        resizeObserver.observe(container);
      });
    });

    function onResize() {
      const el = containerRef.current;
      if (!el || !renderer || !camera) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 1 || h < 1) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", onResize);
      if (renderer && containerRef.current) {
        try {
          renderer.domElement.remove();
          renderer.dispose();
          geometry?.dispose();
          (particles?.material as THREE.Material)?.dispose();
        } catch (_) {}
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 block h-full w-full"
      style={{ minHeight: 0 }}
    />
  );
}
