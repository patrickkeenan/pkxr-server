import type { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";

export async function GET(request: NextRequest) {
  //   const searchParams = request.nextUrl.searchParams;
  //   const url = searchParams.get("url");
  const pusher = new Pusher({
    appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID as string,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
    secret: process.env.PUSHER_APP_SECRET as string,
    cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER as string,
    useTLS: true,
  });
  pusher.trigger("figma-123", "layout", {
    message: "hello world",
  });

  // console.log(screenshot);
  return Response.json({ success: true });
}
