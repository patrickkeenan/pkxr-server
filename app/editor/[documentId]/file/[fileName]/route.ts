import fs from "fs";
import path from "path";

import {
  collection,
  doc,
  Timestamp,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export async function GET(req: Request, { params }) {
  const { documentId, fileName } = params;
  console.log("get req");

  const isDevelopment = false;
  if (isDevelopment) {
    // This is a dev server: Write the files directly to the server
    const content = await fs.promises.readFile(
      `prototypes/${documentId}/${fileName}`,
      { encoding: "utf8" }
    );
    return new Response(content, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } else {
    // This is production: Write the files to firebase storage
    const unsub = onSnapshot(
      doc(db, `prototypes/${documentId}/${fileName}`),
      (doc) => {
        console.log("Current data: ", doc.data());
      }
    );
    const docRef = doc(collection(db, `prototypes`), fileName);
    return new Response("content", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
