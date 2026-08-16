import { XzReadableStream } from "xz-decompress";
import { unpackTar } from "modern-tar";
import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import { markdownItTable } from "markdown-it-table";
import type { List, Tree } from "./types";
import localforage from "localforage";

type DocsIndex = string[];

export async function saveContent() {
  const docsIndex: DocsIndex = await (await fetch("/docs.json")).json();
  const entriesList: List = [];
  const headingToId = (heading: string) =>
    heading.toLowerCase().replaceAll(" ", "_");
  const md = MarkdownIt({ html: true })
    .use(markdownItAnchor, { slugify: headingToId })
    .use(markdownItTable);
  const textDecoder = new TextDecoder();
  for (const file of docsIndex) {
    const archiveName = file.split(".")[0];
    const compressedResponse = await fetch(file);
    const decompressedResponse = new Response(
      new XzReadableStream(compressedResponse.body!),
    );

    const entries = await unpackTar(await decompressedResponse.arrayBuffer());
    for (const entry of entries) {
      if (entry.header.type !== "file" || !entry.data) {
        continue;
      }

      const text = textDecoder.decode(entry.data);

      let html: string;
      if (entry.header.name.endsWith(".html")) {
        html = text;
      } else if (entry.header.name.endsWith(".md")) {
        html = md.render(text);
      } else {
        html = md.render(text);
      }

      const dom = new DOMParser().parseFromString(html, "text/html");
      let title = getTitleFromDom(dom);
      if (!title) {
        title = getTitleFromPath(entry.header.name);
      }
      const tables = dom.querySelectorAll("table");
      for (const table of tables) {
        const clone = table.cloneNode(true);
        const wrapper = dom.createElement("div");
        wrapper.className = "table-wrapper";
        wrapper.appendChild(clone);
        table.replaceWith(wrapper);
      }
      html = dom.body.innerHTML;
      const path = "/" + archiveName + "/" + entry.header.name;
      entriesList.push({ path, title });
      await localforage.setItem(path, html);
    }
  }

  const tree = listToTree(entriesList);

  await localforage.setItem("list", entriesList);
  await localforage.setItem("tree", tree);
}

function listToTree(arr: List) {
  arr.sort((a, b) => a.path.localeCompare(b.path));

  const tree: Tree = [];

  arr.forEach((item) => {
    const pathSegments = item.path.split("/").filter(Boolean);
    let currentNode = tree;

    pathSegments.forEach((segment, index) => {
      const isLast = index === pathSegments.length - 1;

      let existingNode = currentNode.find((node) => node.title === segment);

      if (!existingNode) {
        existingNode = {
          type: isLast ? "file" : "dir",
          title: segment,
          path: "/" + pathSegments.slice(0, index + 1).join("/"),
          children: [],
        };
        currentNode.push(existingNode);
      }

      currentNode = existingNode.children;

      if (isLast && item.title) {
        existingNode.title = item.title;
      }
    });
  });

  return tree;
}

function getTitleFromDom(dom: Document) {
  const titleElem = dom.getElementsByTagName("title")[0];
  const firstH1Elem = dom.getElementsByTagName("h1")[0];

  return (
    (titleElem && titleElem.textContent) ||
    (firstH1Elem && firstH1Elem.textContent) ||
    null
  );
}

function getTitleFromPath(path: string) {
  const pathParts = path.split("/");
  const lastPart = pathParts[pathParts.length - 1];
  if (lastPart.startsWith("index.")) {
    return pathParts[pathParts.length - 2];
  } else {
    return lastPart;
  }
}
