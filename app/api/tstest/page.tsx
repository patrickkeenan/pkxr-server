"use client";
// import { transform } from "@babel/core";
import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { transformSync } from "@swc/core";
import { transform } from "@babel/standalone";

export default function EditorPage() {
  const inputString = `<Canvas>\n      <ambientLight intensity={0.5} />\n      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />\n     <mesh>
  //         <boxGeometry />
  //         <meshBasicMaterial color="#f09" />
  //       </mesh>\n    </Canvas>`;
  //   const inputString = `
  //   function Test (){return "Hello, World!"}
  //   <div>
  //    <h1>{Test()}</h1>
  //  </div>
  // `;
  //   const transpiled = transformSync(inputString, {
  //     jsc: {
  //       parser: {
  //         syntax: "typescript",
  //         tsx: true,
  //         decorators: false,
  //         dynamicImport: true,
  //       },
  //       target: "es2017",
  //     },
  //     module: {
  //       type: "commonjs",
  //     },
  //   });

  const transpiledCode = transform(inputString, {
    presets: [
      "react",
      {
        comments: false,
      },
    ],
  }).code;

  useEffect(() => {
    eval(`console.log('text')`);
  }, []);

  //@js-ignore
  globalThis["React"] = React;
  globalThis["Canvas"] = Canvas;

  return <div>{eval(transpiledCode)}</div>;
  //   return new Function(`return ${transpiledCode}`)();

  //   return transpiled;

  //   return (
  //     <Canvas camera={ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }>
  //       <mesh>
  //         <boxGeometry />
  //         <meshBasicMaterial color="#f09" />
  //       </mesh>
  //     </Canvas>
  //   );
}
