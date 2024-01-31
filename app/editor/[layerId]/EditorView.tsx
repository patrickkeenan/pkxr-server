"use client";
import { useState, useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import useSWR from "swr";

export default function EditorView({ layerId, fileNames, ...props }) {
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
            src={"/prototypes/" + layerId}
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
              {layerId && fileName && (
                <EditorCodeFileView layerId={layerId} fileName={fileName} />
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

function EditorCodeFileView({ layerId, fileName, ...props }) {
  const fetcher = (url) => fetch(url).then((res) => res.text());
  const { data, error } = useSWR(
    `/editor/${layerId}/file/${fileName}`,
    fetcher
  );
  const [fileValue, setFileValue] = useState("");
  useEffect(() => {
    console.log("data change", data);
    if (data) setFileValue(data);
  }, [data]);

  const monaco = useMonaco();

  useEffect(() => {
    // do conditional chaining
    monaco?.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    // or make sure that it exists by other ways
    monaco?.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco?.languages.typescript.JsxEmit.ReactJSX,
      target: monaco.languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ["node_modules/@types"],
      noUnusedLocals: false,
      noUnusedParameters: false,
    });
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

  function handleEditorChange(value) {
    // file.value = value;
    setFileValue(value);
  }

  const handleFileUpdate = () => {
    let formData = new FormData();
    formData.append("fileValue", fileValue);
    formData.append("layerId", layerId);

    fetch(`update/${fileName}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((response) => {
        console.log("Data uploaded successfully, open viewer", response);
      })
      .catch((e) => {
        console.log("Data upload failed", e);
      });
  };

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
          // onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          value={data}
        />
      </div>
    </div>
  );
}
