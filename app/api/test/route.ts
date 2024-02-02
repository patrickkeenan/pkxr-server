import path from "path";
import fs from "fs";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/firebase";
import { transformSync } from "@swc/core";

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

  const inputString = `import * as React from 'react';\nimport { Canvas } from 'react-three-fiber';\nimport Box from './Box';\n\nfunction App() {\n  return (\n    <Canvas>\n      <ambientLight intensity={0.5} />\n      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />\n      <Box position={[-1.2, 0, 0]} />\n      <Box position={[1.2, 0, 0]} />\n    </Canvas>\n  );\n}\n\nexport default App;`;
  const transpiled = transformSync(inputString, {
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: true,
        decorators: false,
        dynamicImport: true,
      },
      target: "es2017",
    },
    module: {
      type: "commonjs",
    },
  });

  return new Response(transpiled.code, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
