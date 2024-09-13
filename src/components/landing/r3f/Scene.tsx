import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";

export const Scene = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50, far: 100, near: 0.1 }}
      fallback={null}
      gl={{ antialias: false }}
      flat
      eventSource={document.body}
    >
      <View.Port />
    </Canvas>
  );
};
