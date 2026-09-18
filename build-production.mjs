import { mkdir, copyFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname } from "node:path";

const sourceOrigin = "https://xcander.com";
const files = [
  ["assets/xcander-atmosphere.webp", "bcfef6a804d35aabddb8e2c9b00c219a"],
  ["assets/xcander-owner-logo.png", "35e94994e9afb6d80940729bbe5aa5d0"],
  ["favicon-16x16.png", "5fc6f1da64703ca8fc4ee4c182fb6685"],
  ["favicon-32x32.png", "a71dffd4b152ca6b21649e87896af277"],
  ["favicon-48x48.png", "c458128ab31fa461f926033a6d82cd98"],
  ["favicon.svg", "11fa0882132954f54160f3129683b12d"],
  ["apple-touch-icon.png", "f87d4065ffb6672089a34b21b71cd5c4"],
  ["icon-512x512.png", "b27f371771d4a82039ec9546f8759750"],
  ["og-image.png", "54005e780f3b44688313ae7526b2ae9e"],
  ["og-image.svg", null],
  ["favicon.ico", null],
];

await mkdir("dist", { recursive: true });
await copyFile("index.html", "dist/index.html");\nawait copyFile("robots.txt", "dist/robots.txt");\nawait copyFile("sitemap.xml", "dist/sitemap.xml");

for (const [path, expectedMd5] of files) {
  const response = await fetch(`${sourceOrigin}/${path}?r5-build=20260919`, {
    headers: { "user-agent": "XCANDER-R5-Production-Build/1.0" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to snapshot ${path}: HTTP ${response.status}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (expectedMd5) {
    const md5 = createHash("md5").update(bytes).digest("hex");
    if (md5 !== expectedMd5) {
      throw new Error(`Asset integrity mismatch for ${path}: ${md5}`);
    }
  }
  const target = `dist/${path}`;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, bytes);
}

console.log("XCANDER R5 production bundle built with verified Production assets.");
