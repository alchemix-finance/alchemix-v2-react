/* eslint-disable react/no-unknown-property */

import { useRef, useState } from "react";
import {
  Circle,
  OrthographicCamera,
  Plane,
  useTexture,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const assets = [
  {
    name: "ETH",
  },
  {
    name: "WSTETH",
  },
  {
    name: "RETH",
  },
  {
    name: "DAI",
  },
  {
    name: "USDC",
  },
  {
    name: "USDT",
  },
];

const circleRadius = 1;
const circleDiameter = circleRadius * 2;
const spaceBetweenCircles = circleDiameter + 1;

const getXPosition = (index: number) => {
  const assetsLength = assets.length;

  const totalWidth =
    assetsLength * circleDiameter + (assetsLength - 1) * spaceBetweenCircles;
  const initialXPosition = -totalWidth / 2 + circleRadius;

  return initialXPosition + index * (circleDiameter + spaceBetweenCircles);
};

export const Tokens = () => {
  const spotLightRef = useRef(null);
  const [activeToken, setActiveToken] =
    useState<React.ElementRef<typeof Circle>>();
  useFrame(() => {
    if (spotLightRef.current === null) return;
    if (activeToken) {
      spotLightRef.current.target.position.lerp(activeToken.position, 0.1);
      spotLightRef.current.target.updateMatrixWorld();
    }
  });
  return (
    <>
      {assets.map((asset, i) => (
        <Token
          key={asset.name}
          name={asset.name}
          position={[getXPosition(i), 0, 0]}
          setActiveToken={setActiveToken}
        />
      ))}
      <Plane args={[10, 10]} rotation-z={-Math.PI / 2} position={[0, 0, -5]}>
        <meshStandardMaterial opacity={0.1} transparent />
      </Plane>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={30} />
      <spotLight
        ref={spotLightRef}
        position={[0, 0, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <ambientLight intensity={0.1} />
    </>
  );
};

const Token = ({
  name,
  position,
  setActiveToken,
}: {
  name: string;
  position: readonly [number, number, number];
  setActiveToken: (token: React.ElementRef<typeof Circle> | undefined) => void;
}) => {
  const texture = useTexture(`/images/icons/${name.toLowerCase()}.svg`);

  const [active, setActive] = useState(false);

  const ref = useRef<React.ElementRef<typeof Circle>>(null);

  useFrame(() => {
    if (ref.current === null) return;
    if (active) {
      ref.current.scale.lerp({ x: 1.2, y: 1.2, z: 1.2 }, 0.1);
      ref.current.rotation.y += 0.01;
    } else {
      ref.current.scale.lerp({ x: 1, y: 1, z: 1 }, 0.1);
      ref.current.rotation.y = 0;
    }
  });

  const onPointerEnter = () => {
    setActive(true);
    if (ref.current === null) return;
    setActiveToken(ref.current);
  };
  const onPointerOut = () => {
    setActive(false);
  };

  return (
    <>
      <Circle
        ref={ref}
        position={position}
        args={[1, 48]}
        onPointerEnter={onPointerEnter}
        onPointerOut={onPointerOut}
      >
        <meshStandardMaterial map={texture} side={2} />
      </Circle>
    </>
  );
};
