"use client";
// import { transform } from "@babel/core";
import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { transformSync } from "@swc/core";
import { transform } from "@babel/standalone";
import { Environment, OrbitControls, Sphere } from "@react-three/drei";
import dynamic from "next/dynamic";
//@ts-ignore
// import App from "https://firebasestorage.googleapis.com/v0/b/pkxr-413012.appspot.com/o/layouts%2Ftstest.tsx?alt=media&token=50f13637-00de-4d7b-9cfe-2870a3e73023";

export default function EditorPage() {
  const inputString = `import {OrbitControls} from "https://esm.sh/@react-three/drei";
  function Test (){ return <Canvas>\n      <ambientLight intensity={0.5} />\n      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />\n     <mesh>
  //         <boxGeometry />
  //         <meshBasicMaterial color="#f09" />
  //       </mesh>\n   </Canvas>}`;
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
  //   <OrbitControls
  //   position={[0, 1.5, -3]}
  //   target={[0, 1.5, -1]}
  //   makeDefault
  // />

  //   const transpiledCode = transform(inputString, {
  //     presets: [
  //       "react",
  //       {
  //         comments: false,
  //       },
  //     ],
  //   }).code;
  //   const Component = new Function("React", "return " + transpiledCode)(React);

  //   useEffect(() => {
  //     eval(`console.log('text')`);
  //   }, []);

  //   //@js-ignore
  //   globalThis["React"] = React;
  //   globalThis["Canvas"] = Canvas;
  //   globalThis["OrbitControls"] = OrbitControls;

  //   const fileName = "tstest";
  //   const url = `https://firebasestorage.googleapis.com/v0/b/pkxr-413012.appspot.com/o/layouts%2Ftstest.tsx?alt=media&token=72471a3f-954e-410f-afe1-64e62bbb6dc5`;
  //   const App = dynamic(
  //     () =>
  //       //@ts-ignore
  //       import(
  //         "https://firebasestorage.googleapis.com/v0/b/pkxr-413012.appspot.com/o/layouts%2Ftstest.tsx?alt=media&token=72471a3f-954e-410f-afe1-64e62bbb6dc5"
  //       ),
  //     {
  //       loading: () => <p>Loading...</p>,
  //     }
  //   );

  return <div>test</div>;
  //   <div>{eval(transpiledCode)}</div>;
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
