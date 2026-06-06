import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import emotionMap from "../emotion_map.json";

export default function VRMAvatar({ emotion = { label: "neutral", intensity: 0.3 }, modelUrl = "" }) {
  const mountRef = useRef(null);
  const vrmRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(0, 1.35, 3);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(380, 420);
    mountRef.current.appendChild(renderer.domElement);
    scene.add(new THREE.DirectionalLight(0xffffff, 2));

    if (modelUrl) {
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));
      loader.load(modelUrl, (gltf) => {
        const vrm = gltf.userData.vrm;
        VRMUtils.rotateVRM0(vrm);
        scene.add(vrm.scene);
        vrmRef.current = vrm;
      });
    } else {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.75), new THREE.MeshStandardMaterial({ color: "#8aa2ff" }));
      mesh.position.y = 1.15;
      scene.add(mesh);
    }

    let frame;
    function animate() {
      frame = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
    return () => {
      cancelAnimationFrame(frame);
      renderer.dispose();
      mountRef.current?.replaceChildren();
    };
  }, [modelUrl]);

  useEffect(() => {
    const vrm = vrmRef.current;
    const mapping = emotionMap[emotion.label] || emotionMap.neutral;
    const intensity = Math.max(0, Math.min(1, emotion.intensity ?? mapping.defaultIntensity));
    vrm?.expressionManager?.setValue(mapping.blendShape, intensity);
  }, [emotion]);

  return (
    <section className="panel">
      <h2>Avatar</h2>
      <div ref={mountRef} aria-label="VRM avatar viewport" />
      <p>
        Emotion: {emotion.label} ({Number(emotion.intensity || 0).toFixed(2)})
      </p>
    </section>
  );
}
