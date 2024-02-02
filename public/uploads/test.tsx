import ReactDOM from "https://esm.sh/react-dom";
import React, { Suspense, useRef, useState } from "https://esm.sh/react";
import { Canvas, useFrame } from "https://esm.sh/@react-three/fiber";
import { OrbitControls } from "https://esm.sh/@react-three/drei";
import htm from "https://esm.sh/htm";

const html = htm.bind(React.createElement);

function Box(props) {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  useFrame(
    () => (meshRef.current.rotation.x = meshRef.current.rotation.y += 0.01)
  );
  return html` <mesh
    ...${props}
    ref=${meshRef}
    scale=${active ? 1.5 : 1}
    onClick=${() => setActive(!active)}
    onPointerOver=${() => setHover(true)}
    onPointerOut=${() => setHover(false)}
  >
    <boxGeometry args=${[1, 1, 1]} />
    <meshStandardMaterial color=${hovered ? "hotpink" : "orange"} />
  </mesh>`;
}

ReactDOM.render(
  html` <Suspense
    ><${Canvas}>
      <OrbitControls
        position="{[0,"
        1.5,
        -3]}
        target="{[0,"
        1.5,
        -1]}
        makeDefault
      />
      <ambientLight />
      <pointLight position=${[10, 10, 10]} />
      <${Box} position=${[-1.2, 0, 0]} />
      <${Box} position=${[1.2, 0, 0]} /> <//
  ></Suspense>`,
  document.getElementById("root")
);
