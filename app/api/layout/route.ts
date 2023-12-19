import { promises as fs } from "fs";
import path from "path";
import { figmaLayoutString } from "../../../components/figma-utils-string";
import {
  FigmaLayout,
  figmaToComponents,
} from "../../../components/figma-utils";
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
  let json = JSON.stringify(data, null, 2);
  try {
    await figmaToComponents(data);

    await fs.writeFile(
      path.resolve(
        process.cwd(),
        "public",
        "uploads",
        "layouts",
        `layout.json`
      ),
      json
    );

    await fs.writeFile(
      path.resolve(process.cwd(), "prototypes", `figma.tsx`),
      figmaLayoutString(data)
    );

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
