import fs from "fs";
import path from "path";

import { getDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export async function GET(req: Request, { params }) {
  const { documentId } = params;
  console.log("get req");

  const docRef = doc(db, "prototypes", documentId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    const doc = docSnap.data();
    let string = "No code found";
    if (doc.typescript) {
      string = doc.typescript;
    }
    return new Response(string, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
    return new Response("No such document!", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // This is production: Write the files to firebase storage
  // const unsub = onSnapshot(
  //   doc(db, `prototypes/${documentId}/${fileName}`),
  //   (doc) => {
  //     console.log("Current data: ", doc.data());
  //   }
  // );
  // const docRef = doc(collection(db, `prototypes`), fileName);
  //   }
}
