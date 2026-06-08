import { XzReadableStream } from "xz-decompress";
import { unpackTar } from "modern-tar";
import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import { markdownItTable } from "markdown-it-table";
import type { List, Tree } from "./types";
import localforage from "localforage";

export async function saveContent() {
  const compressedResponse = await fetch("/docs.tar.xz");
  const decompressedResponse = new Response(
    new XzReadableStream(compressedResponse.body!),
  );

  const entries = await unpackTar(await decompressedResponse.arrayBuffer());
  const headingToId = (heading: string) =>
    heading.toLowerCase().replaceAll(" ", "_");
  const md = MarkdownIt({ html: true })
    .use(markdownItAnchor, { slugify: headingToId })
    .use(markdownItTable);
  const textDecoder = new TextDecoder();
  const entriesList: List = [];
  for (const entry of entries) {
    if (entry.header.type === "file" && entry.data) {
      const markdown = textDecoder.decode(entry.data);
      const titleStart = markdown.indexOf("# ");
      const titleEnd = markdown.indexOf("\n", titleStart);
      const title = markdown.substring(titleStart + 2, titleEnd);
      let html = md.render(markdown);
      const dom = new DOMParser().parseFromString(html, "text/html");
      const tables = dom.querySelectorAll("table");
      for (const table of tables) {
        const clone = table.cloneNode(true);
        const wrapper = dom.createElement("div");
        wrapper.className = "table-wrapper";
        wrapper.appendChild(clone);
        table.replaceWith(wrapper);
      }
      html = dom.body.innerHTML;
      const path = "/" + entry.header.name;
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
