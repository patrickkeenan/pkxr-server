import EditorView from "./EditorView";
import fs from "fs";
import path from "path";

export default function EditorPage({
  params,
}: {
  params: { documentId: string };
}) {
  const directoryPath = path.join(
    process.cwd(),
    "prototypes/" + params.documentId
  );
  // const fileNames = fs
  //   .readdirSync(directoryPath)
  //   .filter((file) => file.endsWith(".tsx"));
  const fileNames = ["index.tsx"];
  console.log(fileNames);
  return <EditorView documentId={params.documentId} fileNames={fileNames} />;
}
