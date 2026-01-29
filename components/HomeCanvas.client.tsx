\"use client\";
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HomeCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    camera.position.z = 5;

    const particleCount = 6000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      positions[i * 3] = 2 * Math.cos(theta) * Math.sin(phi);
      positions[i * 3 + 1] = 2 * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = 2 * Math.cos(phi);

      // start as white-ish
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 1.0;
      colors[i * 3 + 2] = 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let mouse = new THREE.Vector2(0, 0);
    let target = new THREE.Vector2(0, 0);

    function onMove(e: MouseEvent) {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      target.x = mouse.x;
      target.y = mouse.y;
    }

    window.addEventListener('mousemove', onMove);

    let time = 0;
    function animate() {
      time += 0.01;
      // lerp a camera offset based on target
      camera.position.x += (target.x * 2 - camera.position.x) * 0.03;
      camera.position.y += (target.y * 2 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      const pos = geometry.attributes.position.array as Float32Array;
      const col = geometry.attributes.color.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // gentle breathing
        const idx3 = i * 3;
        const ox = pos[idx3];
        const oy = pos[idx3 + 1];
        pos[idx3] = ox + Math.sin(time + i * 0.001) * 0.0015;
        pos[idx3 + 1] = oy + Math.cos(time + i * 0.001) * 0.0015;

        // color transition influenced by mouse distance
        const dx = ox - target.x * 2;
        const dy = oy - target.y * 2;
        const d = Math.sqrt(dx * dx + dy * dy);
        // map distance to 0..1
        const t = Math.max(0, Math.min(1, 1.0 - d / 3.0));

        // color spectrum between white and neon (cyan-magenta)
        const neon = new THREE.Color().setHSL(0.75 + 0.25 * Math.sin(time * 0.5), 0.9, 0.5);
        const white = new THREE.Color(1, 1, 1);
        const mixed = white.clone().lerp(neon, t);

        col[idx3] = mixed.r;
        col[idx3 + 1] = mixed.g;
        col[idx3 + 2] = mixed.b;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;

      points.rotation.y += 0.0015;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();

    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // cleanup
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      renderer.domElement.remove();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className=\"absolute inset-0 -z-10\" />;
}

