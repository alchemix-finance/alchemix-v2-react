import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";

export const Particles = ({
  height,
  count = 200,
}: {
  height: number;
  count?: number;
}) => {
  const points = useRef<React.ElementRef<typeof Points>>(null);
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] =
        2 * (Math.random() - 0.5) * (height / window.innerHeight);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, [count, height]);

  useFrame((_state, delta) => {
    if (points.current) {
      points.current.rotation.x += delta * 0.01;
      points.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <Points ref={points} positions={particlePositions} stride={3}>
      <PointMaterial
        transparent
        color="#F5C59F"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};
