import path from "path";
import fs from "fs";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  uploadString,
} from "firebase/storage";
import { storage } from "@/lib/firebase/firebase";
import { transformSync } from "@swc/core";
import { transform } from "@babel/core";

export async function GET(request: Request) {
  // const imageFile = fs.readFileSync(
  //   path.join(process.cwd(), "public/placeholder.png")
  // );

  // const filePath = `images/test/placeholderTest.png`;

  // const newImageRef = ref(storage, filePath);
  // await uploadBytesResumable(newImageRef, imageFile);
  // const url = await getDownloadURL(newImageRef);

  // return new Response(url, {
  //   status: 200,
  //   headers: {
  //     "Access-Control-Allow-Origin": "*",
  //     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  //     "Access-Control-Allow-Headers": "Content-Type, Authorization",
  //   },
  // });

  // const inputString = `import * as React from 'react';\nimport { Canvas } from 'react-three-fiber';\nimport Box from './Box';\n\nfunction App() {\n  return (\n    <Canvas>\n      <ambientLight intensity={0.5} />\n      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />\n      <Box position={[-1.2, 0, 0]} />\n      <Box position={[1.2, 0, 0]} />\n    </Canvas>\n  );\n}\n\nexport default App;`;
  // const transpiled = transformSync(inputString, {
  //   jsc: {
  //     parser: {
  //       syntax: "typescript",
  //       tsx: true,
  //       decorators: false,
  //       dynamicImport: true,
  //     },
  //     target: "es2017",
  //   },
  //   module: {
  //     type: "commonjs",
  //   },
  // });

  // return new Response(transpiled.code, {
  //   status: 200,
  //   headers: {
  //     "Access-Control-Allow-Origin": "*",
  //     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  //     "Access-Control-Allow-Headers": "Content-Type, Authorization",
  //   },
  // });

  // const filePath = path.join(process.cwd(), "public/uploads/tstest.tsx");
  // const fileContents = fs.readFileSync(filePath, "utf8");
  // // res.setHeader('Content-Type', 'application/javascript');
  // // const result = transform(fileContents, {
  // //   presets: ["react"],
  // // });

  // return new Response(fileContents, {
  //   status: 200,
  //   headers: {
  //     "Content-Type": "application/javascript",
  //     "Access-Control-Allow-Origin": "*",
  //     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  //     "Access-Control-Allow-Headers": "Content-Type, Authorization",
  //   },
  // });
  let prodDirPath = `layouts/tstest.tsx`;
  console.log("is production, write", prodDirPath);
  const newFileRef = ref(storage, prodDirPath);
  const codeString = `import React, { useState, useRef, useEffect } from "react";
  import * as THREE from "three";
  import PKCanvas, { PKRootLayer, PKLayer, PKLink } from "@/components/PKCanvas";
  
  function Scene({ ...props }) {
    return (
      <mesh position={[0, 1.5, -1]}>
        <WhatsAppExample />
      </mesh>
    );
  }
  
  export default function Prototype() {
    return (
      <PKCanvas>
        <Scene />
      </PKCanvas>
    );
  }
  
  function WhatsAppExample({ ...props }) {
    const variants = {
      "310:239489": {
        variantIndex: 0,
        imageUrl:
          "/uploads/layouts/fa1e29a064914eac8b858600e656f703/WhatsAppExample_WhatsAppExample_0.png",
        id: "310:239489",
        x: 0,
        y: 0,
        width: 1016,
        height: 728,
      },
      "310:237884": {
        variantIndex: 1,
        imageUrl:
          "/uploads/layouts/fa1e29a064914eac8b858600e656f703/WhatsAppExample_WhatsAppExample_1.png",
        id: "310:237884",
        x: 0,
        y: 0,
        width: 1016,
        height: 728,
      },
    };
    const [variant, setVariant] = useState("310:239489");
    return (
      <>
        <PKLayer
          name={"WhatsAppExample"}
          width={1016}
          height={728}
          rootWidth={1016}
          rootHeight={728}
          {...variants[variant]}
          {...props}
        />
        {variant == "310:239489" && (
          <PKLink
            onClick={() => {
              if (Object.keys(variants).indexOf("310:237884") > -1) {
                setVariant("310:237884");
              } else {
                console.log("variant doesn't exist");
              }
            }}
            name={"Conversation Row"}
            width={336}
            height={100}
            x={104}
            y={83}
            linkTo={"310:237884"}
            rootWidth={1016}
            rootHeight={728}
          />
        )}
  
        {variant == "310:237884" && (
          <PKLink
            onClick={() => {
              if (Object.keys(variants).indexOf("310:239489") > -1) {
                setVariant("310:239489");
              } else {
                console.log("variant doesn't exist");
              }
            }}
            name={"Conversation Row"}
            width={336}
            height={100}
            x={104}
            y={303}
            linkTo={"310:239489"}
            rootWidth={1016}
            rootHeight={728}
          />
        )}
      </>
    );
  }
  `;
  await uploadString(newFileRef, codeString, "raw");
  const url = await getDownloadURL(newFileRef);
  console.log("wrote file:", url);
  return new Response(`Image file written successfully: ${url}`, {
    status: 201,
  });
}
