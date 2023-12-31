import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { figmaLayoutString } from "../../../components/figma-utils-string";
import {
  FigmaLayout,
  figmaToComponents,
} from "../../../components/utils/figma-utils";
export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request: Request) {
  return new Response("Layout route!", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  const data = await req.json();
  const pageId = data.pageId;
  const documentId = data.documentId;
  const rootLayerId = data.id;
  const rootLayerName = data.name;
  let json = JSON.stringify(data, null, 2);

  try {
    await figmaToComponents(data);

    let dirPath = `public/uploads/layouts/${toSafeString(rootLayerId)}`;
    await mkdir(dirPath, { recursive: true });

    await writeFile(path.resolve(process.cwd(), dirPath, `layout.json`), json);

    // await writeFile(
    //   path.resolve(process.cwd(), "prototypes", `figma.tsx`),
    //   figmaLayoutString(data)
    // );

    console.error("wrote JSON");
    return new Response("JSON file written successfully", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("An error occurred", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
}
const toSafeString = (str) => str.replace(/[^\w\s]/gi, "");
