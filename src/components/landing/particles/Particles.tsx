import { Canvas } from "@react-three/fiber";

import { Experience } from "./Experience";

export const Particles = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50, far: 100, near: 0.1 }}
      fallback={null}
      gl={{ antialias: false }}
      flat
    >
      <Experience />
    </Canvas>
  );
};
