import fs from "fs";
import path from "path";
// import { writeFile, mkdir } from "fs/promises";

export async function POST(req: Request, { params }) {
  console.log("Post req");
  const fileName = params.fileName;
  const formData = await req.formData();
  const layerId = formData.get("layerId");
  const fileValue = formData.get("fileValue") as string;
  console.log("Post req", formData);
  try {
    let dirPath = `prototypes/${layerId}`;
    // await fs.promises.mkdir(dirPath, { recursive: true });
    await fs.promises.writeFile(
      path.resolve(process.cwd(), dirPath, fileName),
      fileValue
    );
    return Response.json({
      message: "Code file written successfully",
      status: 201,
    });
  } catch (error) {
    console.log("Error occured ", error);
    return Response.json({ message: "File write Failed", status: 200 });
  }
  return Response.json({ status: 200, fileValue, layerId, ...params });
  // const rootLayerId = formData.get("rootLayerId");
  // const documentId = formData.get("documentId");
  // const file = formData.get("image");
  // if (!file) {
  //   return new Response("No files received", { status: 400 });
  // }

  // const buffer = Buffer.from(await file.arrayBuffer());

  // const filename = file.name;
}

export async function OPTIONS(request: Request) {
  const allowedOrigin = request.headers.get("origin");
  const response = new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin || "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
      "Access-Control-Max-Age": "86400",
    },
  });

  return response;
}
