import fs from "fs";
import path from "path";
// import { writeFile, mkdir } from "fs/promises";

export async function GET(req: Request, { params }) {
  console.log("get req");
  const { layerId, fileName } = params;
  const content = await fs.promises.readFile(
    `prototypes/${layerId}/${fileName}`,
    { encoding: "utf8" }
  );
  return new Response(content, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
