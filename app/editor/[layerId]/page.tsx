import EditorView from "./EditorView";
import fs from "fs";
import path from "path";

export default function EditorPage({
  params,
}: {
  params: { layerId: string };
}) {
  const directoryPath = path.join(
    process.cwd(),
    "prototypes/" + params.layerId
  );
  const fileNames = fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith(".tsx"));
  console.log(fileNames);
  return <EditorView layerId={params.layerId} fileNames={fileNames} />;
}
