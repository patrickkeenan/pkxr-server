import puppeteer, { KnownDevices } from "puppeteer";
import fs from "fs";

export const getWebsiteInfo = async (url) => {
  const timeStart = Date.now();
  const websiteId = url
    .replace(/(^\w+:|^)\/\//, "")
    .replace(/[/\\?%*:|"<>]/g, "-"); //Date.now();

  const dirPath = `./public/uploads/websites/${websiteId}`;
  const publicPath = `/uploads/websites/${websiteId}`;
  const filePath = `${dirPath}/screenshot.png`;
  const jsonPath = `${dirPath}/info.json`;
  if (fs.existsSync(filePath) && fs.existsSync(jsonPath)) {
    // If the image exists, read it and return it
    const json = JSON.parse(fs.readFileSync(jsonPath));
    return { icon: json.icon, screenshot: json.screenshot };
  }
  // Create the directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--disable-http2"],
  });
  const page = await browser.newPage();
  // await page.setViewport({ width: 375, height: 800, deviceScaleFactor: 2 });
  try {
    await page.goto(url, {
      // waitUntil: "networkidle2"
      timeout: 2000,
    });
  } catch (error) {
    console.error("Navigation timed out:", error.message);
    return false;
    // Handle the timeout error
  }

  const iPhone = KnownDevices["iPhone 13 Pro Max"];
  await page.emulate(iPhone);

  const iconLink = await getIcon(page);

  console.log(iconLink);

  // await scrollFurtherDown(page);
  // await outlineTapTargets(page);

  // Take a screenshot and save it to the uploads folder
  const screenshot = await page.screenshot({
    // fullPage: true
  });
  const websiteInfo = { icon: iconLink, screenshot: publicPath };
  require("fs").writeFileSync(filePath, screenshot);
  fs.writeFileSync(jsonPath, JSON.stringify(websiteInfo));

  await browser.close();

  // Return the screenshot as a response
  console.log(Date.now() - timeStart);
  return websiteInfo;
};

const outlineTapTargets = async (page) => {
  await page.evaluate(() => {
    const navigationElements = document.querySelectorAll(
      'a, button:not([type="submit"]), [role="link"], [role="tab"]'
    );
    const formInputElements = document.querySelectorAll(
      'input, textarea, select, [role="checkbox"], [role="radio"], [role="slider"], [role="spinbutton"], [role="textbox"]'
    );
    const actionElements = document.querySelectorAll(
      'button[type="submit"], [onclick], [onmouseover], [onkeydown]'
    );
    const contentEditingElements = document.querySelectorAll(
      '[contenteditable="true"]'
    );
    const customInteractiveElements = document.querySelectorAll(
      "[tabindex], svg[onclick], svg[onmouseover], svg[onkeydown]"
    );

    const colorize = (elements, color) => {
      elements.forEach((element) => {
        // element.style.border = `3px solid ${color}`;
        const rect = element.getBoundingClientRect();
        const scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const highlight = document.createElement("div");
        highlight.style.position = "absolute";
        highlight.style.left = `${rect.left + scrollLeft}px`;
        highlight.style.top = `${rect.top + scrollTop}px`;
        highlight.style.width = `${rect.width}px`;
        highlight.style.height = `${rect.height}px`;
        highlight.style.border = "3px solid red";
        highlight.style.boxSizing = "border-box";
        highlight.style.pointerEvents = "none";

        document.body.appendChild(highlight);
      });
    };
    colorize(navigationElements, "blue");
    colorize(formInputElements, "green");
    colorize(actionElements, "red");
    colorize(contentEditingElements, "yellow");
    colorize(customInteractiveElements, "purple");
  });
};

const scrollFurtherDown = async (page) => {
  // Scroll the entire page to ensure all images are loaded
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 800;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve(null);
        }
      }, 100);
    });
  });
};

async function getIcon(page) {
  const iconLink = await page.evaluate(() => {
    const baseUrl = window.location.origin;
    const appleIconLink = document.querySelector(
      'link[rel="apple-touch-icon"]'
    );
    const largeIconLink = document.querySelector(
      'link[rel="icon"][sizes="192x192"]'
    );
    const faviconLink = document.querySelector(
      'link[rel="shortcut icon"], link[rel="icon"]'
    );
    return appleIconLink
      ? appleIconLink.href
      : largeIconLink
      ? largeIconLink.href
      : faviconLink
      ? faviconLink.href
      : baseUrl + "/favicon.ico";
  });
  return iconLink;
}
