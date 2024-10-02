import { Canvas } from "@react-three/fiber";

import { Particles } from "./Particles";

export const Scene = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50, far: 100, near: 0.1 }}
      fallback={null}
      gl={{ antialias: false }}
      flat
    >
      <Particles />
    </Canvas>
  );
};
