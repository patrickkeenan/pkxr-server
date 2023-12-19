import { JSDOM } from "jsdom";
import type { NextRequest, NextResponse } from "next";
import { URL } from "url";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return new Response("Missing URL parameter", {
      status: 400,
    });
  }

  const proxyRes = await fetch(url, {
    headers: req.headers,
    method: req.method,
    body: req.method === "POST" ? await req.text() : undefined,
  });

  const headers = Object.fromEntries(proxyRes.headers.entries());
  delete headers["x-frame-options"];
  delete headers["content-encoding"];

  let responseText = await proxyRes.text();

  // Parse the HTML with jsdom, disabling JavaScript
  const dom = new JSDOM(responseText, {
    url: url, // Set the base URL for resolving relative URLs
    resources: "usable", // Load subresources such as scripts and stylesheets
    runScripts: "outside-only", // Disable JavaScript execution
  });

  // Modify all relative URLs to be absolute
  const base = dom.window.document.querySelector("base");
  if (!base) {
    const base = dom.window.document.createElement("base");
    base.href = url;
    dom.window.document.head.append(base);
  } else {
    base.href = url;
  }

  // Rewrite all relative links
  const elements = dom.window.document.querySelectorAll("[src], [href]");
  elements.forEach((element) => {
    ["src", "href"].forEach((attr) => {
      const value = element.getAttribute(attr);
      if (value && value.startsWith("/")) {
        element.setAttribute(attr, new URL(value, url).href);
      }
    });
  });

  // Serialize the modified HTML
  responseText = dom.serialize();

  const responseHeaders = Object.entries(headers).reduce(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {}
  );

  responseHeaders["Access-Control-Allow-Origin"] = "*";
  responseHeaders["Content-Security-Policy"] =
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: *; frame-ancestors *;";
  responseHeaders["X-Frame-Options"] = "SAMEORIGIN";

  return new Response(responseText, {
    status: 200,
    headers: responseHeaders,
  });
}
