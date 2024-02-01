import path from "path";
import fs from "fs";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/firebase";

export async function GET(request: Request) {
  const imageFile = fs.readFileSync(
    path.join(process.cwd(), "public/placeholder.png")
  );

  const filePath = `images/test/placeholderTest.png`;

  const newImageRef = ref(storage, filePath);
  await uploadBytesResumable(newImageRef, imageFile);

  const url = await getDownloadURL(newImageRef);

  return new Response(url, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
