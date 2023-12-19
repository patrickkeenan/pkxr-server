import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";

export const POST = async (req: { formData: () => any }, res: any) => {
  const formData = await req.formData();
  const file = formData.get("image");
  if (!file) {
    return new Response("No files received", { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const filename = file.name;

  try {
    await writeFile(
      path.join(process.cwd(), "public/uploads/images/" + filename),
      buffer
    );
    return new Response("Image file written successfully", {
      status: 201,
    });
  } catch (error) {
    console.log("Error occured ", error);
    return new Response("Image Failed", {
      status: 200,
    });
  }
};

// const form = new formidable.IncomingForm();
//     form.parse(req, (err, fields, files) => {
//       if (err) {
//         return res.status(500).json({ error: err });
//       }
//       const file = files.file ? files.file[0] : null;
//       if (!file) {
//         return res.status(400).json({ error: "No file was uploaded." });
//       }
//       const buffer = fs.readFileSync(file.filepath);
//       const filename =
//         Date.now() + path.basename(file.filepath).replaceAll(" ", "_");
//       fs.promises
//         .writeFile(
//           path.join(process.cwd(), "public/uploads/" + filename),
//           buffer
//         )
//         .then(() => {
//           return res.status(201).json({ Message: "Success" });
//         })
//         .catch((error) => {
//           console.log("Error occured ", error);
//           return res.status(500).json({ Message: "Failed" });
//         });
//     });
