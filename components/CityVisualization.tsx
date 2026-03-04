"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { trpc } from "@/lib/trpc/client";

interface CityVisualizationProps { projectId?: number; }

export default function CityVisualization({ projectId }: CityVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const buildingsRef = useRef<Map<number, THREE.Mesh>>(new Map());

  const { data: buildings, refetch } = trpc.city.getBuildings.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId, refetchInterval: 5000 }
  );

  useEffect(() => { if (projectId) refetch(); }, [projectId, refetch]);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(50, 40, 50);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 10;
    controls.maxDistance = 150;

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(150, 75, 0x10b981, 0x10b981);
    (grid.material as THREE.Material).opacity = 0.2;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    const animate = () => { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !buildings) return;
    const scene = sceneRef.current;
    const existing = buildingsRef.current;

    buildings.forEach((b) => {
      if (!existing.has(b.id)) {
        const geometry = new THREE.BoxGeometry(b.width || 3, b.height || 10, b.depth || 3);
        const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(b.color || "#10b981"), roughness: 0.7, metalness: 0.3 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(b.positionX || 0, (b.height || 10) / 2, b.positionZ || 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        existing.set(b.id, mesh);
        mesh.scale.set(0.1, 0.1, 0.1);
        const target = new THREE.Vector3(1, 1, 1);
        const animateScale = () => { mesh.scale.lerp(target, 0.1); if (mesh.scale.distanceTo(target) > 0.01) requestAnimationFrame(animateScale); };
        animateScale();
      }
    });

    existing.forEach((mesh, id) => {
      if (!buildings.find(b => b.id === id)) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        existing.delete(id);
      }
    });
  }, [buildings]);

  return <div ref={containerRef} className="w-full h-full" />;
}
