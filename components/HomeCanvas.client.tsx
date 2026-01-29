"use client";
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ROWS = 50;
const COLS = 200;
const SEPARATION = 1.2;
const PARTICLE_COUNT = ROWS * COLS;

export default function HomeCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cleanup: (() => void) | null = null;

    function init() {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w < 1 || h < 1) return;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050505, 0.002);

      const aspect = w / h;
      const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
      camera.position.set(0, 10, 30);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setClearColor(0x050505, 1);
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      const canvas = renderer.domElement;
      canvas.style.display = 'block';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.position = 'absolute';
      canvas.style.left = '0';
      canvas.style.top = '0';
      container.appendChild(canvas);

      const geometry = new THREE.BufferGeometry();
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

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
          attribute float scale;
          attribute vec3 color;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_PointSize = scale * ( 300.0 / - mvPosition.z );
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
        transparent: true
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      const mouse = new THREE.Vector2();
      const targetMouse = new THREE.Vector2();
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;

      function onMove(e: MouseEvent) {
        targetMouse.x = (e.clientX - windowHalfX) * 0.1;
        targetMouse.y = (e.clientY - windowHalfY) * 0.1;
      }
      function onResize() {
        const rw = container.clientWidth || window.innerWidth;
        const rh = container.clientHeight || window.innerHeight;
        if (rw < 1 || rh < 1) return;
        camera.aspect = rw / rh;
        camera.updateProjectionMatrix();
        renderer.setSize(rw, rh);
      }

      window.addEventListener('mousemove', onMove);
      window.addEventListener('resize', onResize);

      let frameId = 0;
      let time = 0;

      function animate() {
        time += 0.05;

        mouse.x += (targetMouse.x - mouse.x) * 0.05;
        mouse.y += (targetMouse.y - mouse.y) * 0.05;

        const posArr = particles.geometry.attributes.position.array as Float32Array;
        const scaleArr = particles.geometry.attributes.scale.array as Float32Array;

        let idx = 0;
        for (let x = 0; x < COLS; x++) {
          for (let z = 0; z < ROWS; z++) {
            const worldX = (x - COLS / 2) * SEPARATION;
            const worldZ = (z - ROWS / 2) * SEPARATION;

            const dist = Math.sqrt(Math.pow(worldX - mouse.x, 2) + Math.pow(worldZ - mouse.y * 2, 2));
            const mouseInfluence = Math.max(0, (20 - dist) / 5);

            let y = Math.sin((x + time) * 0.3) * 2 + Math.sin((z + time) * 0.5) * 2;
            y += mouseInfluence * Math.sin((x * 2 + time * 5)) * 5;

            posArr[idx * 3 + 1] = y;

            let s = (y + 5) / 5;
            scaleArr[idx] = s < 0.5 ? 0.5 : s;

            idx++;
          }
        }

        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.scale.needsUpdate = true;

        particles.rotation.y = Math.sin(time * 0.1) * 0.1;

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      }

      animate();

      cleanup = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('resize', onResize);
        if (renderer.domElement.parentNode) {
          renderer.domElement.remove();
        }
        renderer.dispose();
      };
    }

    // Defer init until after layout so container has dimensions
    const rafId = requestAnimationFrame(() => {
      init();
    });

    return () => {
      cancelAnimationFrame(rafId);
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{
        width: '100%',
        height: '100%',
        minWidth: '100vw',
        minHeight: '100vh',
      }}
    />
  );
}
