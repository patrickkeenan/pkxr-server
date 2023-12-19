import type { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { pipeline } from "stream";
import { promisify } from "util";
import OpenAI from "openai";
import { getWebsiteInfo } from "@/components/utils/screenshots.ts";

const openai = new OpenAI();

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

export async function POST(req: Request, { params }) {
  const { api_type } = params;
  try {
    if (api_type == "transcribe") {
      const response = await transcribeAudio(req);
      return Response.json(response);
    } else if (api_type == "chat") {
      const response = await getChatResponse(req);
      return Response.json(response);
    } else if (api_type == "voiceQuery") {
      const transcription = await transcribeAudio(req);
      console.log(transcription.data.text);
      const query = await transcription.data.text;
      const response = await getBrowseQueryAndImage(query);
      return Response.json({ query: query, results: response });
    } else {
      return Response.json(
        { success: false, error: "didn't understand api type" },
        { status: 401 }
      );
    }
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}
export async function GET(req: Request, { params }) {
  const { api_type } = params;
  try {
    if (api_type == "browse") {
      const searchParams = req.nextUrl.searchParams;
      const query = searchParams.get("query");
      const response = await getBrowseQueryAndImage(query);
      if (response) {
        console.log("get", response);
        return Response.json({ query, results: response });
      } else {
        return Response.json(
          { success: false, error: "didn't get well formed JSON" },
          { status: 401 }
        );
      }
    } else {
      return Response.json(
        { success: false, error: "didn't understand api type" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

const getBrowseQueryAndImage = async (query) => {
  const response = await getBrowseQuery(query);
  console.log("query is", response);
  if (response.websites) {
    const results = await Promise.all(
      response.websites.map(async (site) => {
        const info = await getWebsiteInfo(site.url);
        return info ? { ...site, ...info } : null;
      })
    );
    const filteredWebsites = results.filter((result) => result !== null);
    return filteredWebsites;
  } else {
    return false;
  }
};

const getBrowseQuery = async (query) => {
  console.log(query);
  const queryId = query.replace(/[/\\?%*:|"<>]/g, "-"); //Date.now();
  const jsonPath = `./public/uploads/queries/${queryId}.json`;
  if (fs.existsSync(jsonPath)) {
    // If the image exists, read it and return it
    const json = JSON.parse(fs.readFileSync(jsonPath));
    console.log(jsonPath, json);
    return json;
  }

  if (!query) {
    return {
      error: "No query found",
    };
  }
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant designed to output JSON. You are primarily a web browser. When a user asks you something, you offer a set of 5 websites each with a real url, a summary of why this is a good site to start looking, and some key actions that most people would want to take on that site.  Each of the key actions should include a link to perform that action. Rather than offering categorical websites, you should opt for a specific as possible.",
      },
      { role: "user", content: query },
    ],
    model: "gpt-3.5-turbo-1106",
    response_format: { type: "json_object" },
  });
  console.log(completion);

  fs.writeFileSync(jsonPath, completion.choices[0].message.content);
  const jsonResponse = JSON.parse(completion.choices[0].message.content);
  console.log(jsonResponse);
  return jsonResponse;
};

const transcribeAudio = async (req: Request) => {
  const formData = await req.formData();
  const file = formData.get("file");
  const response = await openai.audio.transcriptions.create({
    file: file,
    model: "whisper-1",
  });
  return { success: true, data: response };
};
const getChatResponse = async (req: Request) => {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant designed to output JSON.",
      },
      { role: "user", content: "Who won the world series in 2020?" },
    ],
    model: "gpt-3.5-turbo-1106",
    response_format: { type: "json_object" },
  });
  const jsonResponse = JSON.parse(completion.choices[0].message.content);
  console.log(jsonResponse);
  return jsonResponse;
};
