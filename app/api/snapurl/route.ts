import type { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getWebsiteInfo } from "@/components/utils/screenshots.ts";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  console.log(searchParams, url);

  if (!url) {
    return new Response("Missing URL parameter", {
      status: 400,
    });
  }
  const websiteInfo = await getWebsiteInfo(url);
  console.log(websiteInfo);
  const screenshot = fs.readFileSync(
    `./public${websiteInfo.screenshot}/screenshot.png`
  );
  // console.log(screenshot);
  return new Response(screenshot, {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
}
