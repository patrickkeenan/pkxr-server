"use client";
import { useState, useEffect, useRef } from "react";
import Editor, {
  Monaco,
  MonacoDiffEditor,
  useMonaco,
} from "@monaco-editor/react";
import {
  MonacoJsxSyntaxHighlight,
  getWorker,
} from "monaco-jsx-syntax-highlight";

// import parserTypeScript from "prettier/parser-typescript";
import * as babel from "prettier/plugins/babel";
import * as estree from "prettier/plugins/estree";
import * as typescript from "prettier/plugins/typescript";
import prettier from "prettier/standalone";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase-client";

import useSWR from "swr";

const testFileString = `import React, { Suspense, useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useXR } from "@coconut-xr/natuerlich/react";
import { PositionalAudio } from "@react-three/drei";
import PKCanvas from "@/components/PKCanvas";

function Scene({ ...props }) {
  return (
    <SoundOrb
      sound={"https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav"}
    />
  );
}

function SoundOrb({ sound, ...props }) {
  const [clicked, setClicked] = useState(false);
  useEffect(() => {
    console.log(clicked, sound);
  }, [clicked]);
  const meshRef = useRef<THREE.Mesh>(null);
  const distance = 1;
  const isPresenting = useXR.getState().mode === "immersive-ar";
  useFrame(({ clock, camera }) => {
    if (!clicked || !sound || !meshRef.current || !isPresenting) return;
    // Calculate the rotation angle
    const angle = clock.getElapsedTime();

    // Position the mesh at a fixed distance from the camera
    const x = camera.position.x + distance * Math.sin(angle);
    const z = camera.position.z + distance * Math.cos(angle);
    // meshRef.current.position.set(x, camera.position.y, z)
    if (meshRef.current.position) {
      meshRef.current.position.lerp(
        new THREE.Vector3(x, camera.position.y, z),
        0.01
      );
    }

    // Always face the camera
    meshRef.current.lookAt(camera.position);
  });
  return (
    <>
      {!clicked && (
        <mesh
          scale={0.1}
          position={[0, 1.5, -1]}
          onClick={() => setClicked(true)}
        >
          <sphereGeometry />
          <meshStandardMaterial color={"#333"} />
        </mesh>
      )}
      {sound && clicked && (
        <Suspense fallback={null}>
          <mesh
            scale={0.1}
            position={[0, 1.5, -1]}
            ref={meshRef}
            onClick={() => setClicked(false)}
          >
            <sphereGeometry />
            <meshStandardMaterial color="#f09" />
            <PositionalAudio autoplay distance={1} url={sound} loop={true} />
          </mesh>
        </Suspense>
      )}
    </>
  );
}

export default function Prototype() {
  return (
    <PKCanvas>
      <Scene />
    </PKCanvas>
  );
}
`;

export default function EditorView({ documentId, fileNames, ...props }) {
  const [fileName, setFileName] = useState(
    fileNames.indexOf("index.tsx") > -1 ? "index.tsx" : fileNames[0]
  );
  return (
    <>
      <PanelGroup direction="vertical">
        <Panel
          defaultSize={50}
          minSize={20}
          style={{
            borderRadius: 12,
            background: "#111116",
            marginTop: 16,
            marginLeft: 16,
            marginRight: 16,
          }}
        >
          <iframe
            src={"/prototypes/" + documentId}
            style={{ border: "0 none", width: "100%", height: "100%" }}
          />
        </Panel>
        <PanelResizeHandle style={{ height: 16 }} />
        <Panel defaultSize={50}>
          <PanelGroup direction="horizontal" style={{}}>
            <Panel
              style={{
                borderRadius: 12,
                marginLeft: 16,
                marginBottom: 16,
                flexDirection: "column",
                backgroundColor: "#1e1e1e",
              }}
              defaultSize={8}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: 8,
                }}
              >
                {fileNames.map((fname, i) => {
                  return (
                    <div
                      key={i}
                      style={{
                        borderRadius: 8,
                        padding: 8,
                        display: "flex",
                        backgroundColor:
                          fname == fileName
                            ? "rgba(255,255,255,.1)"
                            : "transparent",
                        cursor: "pointer",
                      }}
                      // disabled={fileName === "index.html"}
                      onClick={() => setFileName(fname)}
                    >
                      <div
                        style={{
                          fontSize: 8,
                          textAlign: "center",
                          lineHeight: "24px",
                          fontWeight: "bold",
                          // paddingRight: 8,
                          width: 24,
                          height: 24,
                          color: "#1e1e1e",
                          background: "rgba(255,255,255,.2)",
                          borderRadius: 4,
                        }}
                      >
                        TSX
                      </div>
                      <div
                        style={{
                          flexGrow: 1,
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          fontSize: 14,
                          lineHeight: "24px",
                          marginLeft: 12,
                        }}
                      >
                        {fname}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
            <PanelResizeHandle style={{ width: 16 }} />
            <Panel
              defaultSize={30}
              minSize={20}
              style={{
                borderRadius: 12,
                marginBottom: 16,
                marginRight: 16,
                background: "#1e1e1e",
              }}
            >
              {documentId && fileName && (
                <EditorCodeFileView
                  documentId={documentId}
                  fileName={fileName}
                />
              )}
              {/* <Editor
                height="100%"
                width="100%"
                theme="vs-dark"
                saveViewState={true}
                path={fileName}
                defaultLanguage={"typescript"}
                defaultValue={"data"}
                // onMount={handleEditorDidMount}
                // onChange={handleEditorChange}
                value={"data"}
              /> */}
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </>
  );
}

function EditorCodeFileView({ documentId, fileName, ...props }) {
  // const fetcher = (url) => fetch(url).then((res) => res.text());
  // const { data, error } = useSWR(
  //   `/editor/${documentId}/file/${fileName}`,
  //   fetcher
  // );

  const [fileValue, setFileValue] = useState("");
  const [data, setData] = useState("");
  const error = false;

  const monaco = useMonaco();

  const editorRef = useRef<any | null>(null);
  const prototypeRef = doc(db, `prototypes/${documentId}`);

  console.log("doc", `prototypes/${documentId}`);
  const unsub = onSnapshot(prototypeRef, async (doc) => {
    const data = doc.data();
    console.log("Current data: ", data);
    let string = testFileString;
    if (data?.typescript) {
      string = data?.typescript;
    }
    // setData(JSON.stringify(data, null, "\t"));
    const formattedString = await prettier.format(string, {
      parser: "typescript",
      plugins: [babel, typescript, estree],
    });
    setData(formattedString);
    // setData("function thing(test){return true}");
    console.log(editorRef);

    if (editorRef.current) {
      const editor = editorRef.current;
      // let actions = editor.getSupportedActions().map((a) => a.id);
      // console.log(actions);
      // editor.current.trigger("editor", "editor.action.formatDocument");
      // setTimeout(function () {
      // console.log(
      //   "try format",
      //   editorRef.current.getAction("editor.action.formatDocument")
      // );
      // editorRef.current.getAction("editor.action.formatDocument").run();
      // }, 500);
    }
    // monaco?.editor.getAction("editor.action.formatDocument").run();
  });

  // useEffect(() => {
  //   console.log("data change", data);
  //   if (data) setFileValue(data);
  // }, [data]);

  function handleEditorDidMount(editor, monaco) {
    // here is the editor instance
    // you can store it in `useRef` for further usage
    console.log("mount", editor, monaco);
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      console.log("save key");
      // editorRef.current.getAction("editor.action.formatDocument").run();

      const formattedString = await prettier.format(editor.getValue(), {
        parser: "typescript",
        plugins: [babel, typescript, estree],
      });

      editor.getModel().setValue(formattedString);
      updateDoc(prototypeRef, {
        typescript: formattedString,
      });
      // setData(formattedString);
    });
  }

  function handleEditorChange(value) {
    // file.value = value;
    // setFileValue(value);
  }

  const handleFileUpdate = () => {
    // const editor = editorRef.current;
    // if (editor) {
    //   setTimeout(function () {
    //     console.log("try format", editor);
    //     editor.getAction("editor.action.formatDocument").run();
    //   }, 500);
    // }
    // let formData = new FormData();
    // formData.append("fileValue", fileValue);
    // formData.append("documentId", documentId);
    // fetch(`update/${fileName}`, {
    //   method: "POST",
    //   body: formData,
    // })
    //   .then((response) => {
    //     if (!response.ok) {
    //       throw new Error("Network response was not ok");
    //     }
    //     return response.json();
    //   })
    //   .then((response) => {
    //     console.log("Data uploaded successfully, open viewer", response);
    //   })
    //   .catch((e) => {
    //     console.log("Data upload failed", e);
    //   });
  };

  useEffect(() => {
    // do conditional chaining
    monaco?.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    // or make sure that it exists by other ways
    monaco?.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.Preserve,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      esModuleInterop: true,
      // allowNonTsExtensions: true,
      // moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      // module: monaco.languages.typescript.ModuleKind.CommonJS,
      // noEmit: true,
      // typeRoots: ["node_modules/@types"],
      noUnusedLocals: false,
      // noUnusedParameters: false,
      automaticLayout: true,
      formatOnPaste: true,
      formatOnType: true,
    });
    // Remove complaints about libraries
    monaco?.languages.typescript.typescriptDefaults.addExtraLib(
      `declare module '*';`,
      "filename.ts"
    );
    if (monaco) {
      console.log("here is the monaco instance:", monaco);
    }
  }, [monaco]);

  if (error) return <div>Error occurred!</div>;
  if (!data) return <div>Loading editor...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", flexShrink: 1 }}>
        <button
          onClick={() => {
            console.log("save");
            handleFileUpdate();
          }}
        >
          Save
        </button>
        <button
          onClick={() => {
            console.log("open");
            let sendToQuestUrl = new URL("https://oculus.com/open_url/");
            sendToQuestUrl.searchParams.set("url", window.location.href);
            window.open(sendToQuestUrl.toString(), "headset");
          }}
        >
          Open in Headset
        </button>
      </div>
      <div style={{ display: "flex", flexGrow: 1 }}>
        <Editor
          height="100%"
          width="100%"
          theme="vs-dark"
          saveViewState={true}
          path={fileName}
          defaultLanguage={"typescript"}
          defaultValue={data}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          value={data}
          options={{
            tabSize: 2,
            insertSpaces: true,
            autoIndent: "advanced",
          }}
        />
      </div>
    </div>
  );
}
