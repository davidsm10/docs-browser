import "./documentView.css";
import "./document.css";
import "./highlight.css";
import { createRef } from "preact";
import { useEffect } from "preact/hooks";
import localforage from "localforage";
import hljs from "highlight.js/lib/core";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import javascript from "highlight.js/lib/languages/javascript";

hljs.registerLanguage("html", html);
hljs.registerLanguage("css", css);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);

export function DocumentSection(props: {
  openedDoc: string;
  openedSection: "document" | "search";
  openDoc: (path: string) => void;
}) {
  const documentContainer = createRef<HTMLDivElement>();

  function onClick(e: MouseEvent) {
    const link = (e.target as HTMLElement).closest("a");
    if (link && link.href) {
      let url = new URL(link.href);
      if (url.origin === location.origin) {
        e.preventDefault();
        const archiveName = props.openedDoc.replace("/", "").split("/")[0];
        if (url.pathname === "/" || url.pathname === "/index.html") {
          const hash = url.hash;
          url = new URL(
            props.openedDoc.replace("/" + archiveName, ""),
            location.origin,
          );
          url.hash = hash;
        }

        props.openDoc("/" + archiveName + url.pathname + url.hash);
      } else {
        link.target = "_blank";
      }
    }
  }

  async function renderDocument() {
    const url = new URL(props.openedDoc, location.origin);
    const path = url.pathname;
    const savedDocument = await localforage.getItem<string>(path);
    if (!savedDocument) {
      documentContainer.current!.innerHTML =
        "<h1>Page not found</h1>" +
        `<p>Page <code>${url.pathname}</code> could not be found locally.</p>`;
      return;
    }

    documentContainer.current!.innerHTML = savedDocument;

    const section = url.hash.replace("#", "");
    if (section) {
      const elem = document.getElementById(
        section.toLowerCase().replaceAll(" ", "_"),
      );
      if (elem) {
        elem.scrollIntoView();
      } else {
        documentContainer.current!.scrollTop = 0;
      }
    } else {
      documentContainer.current!.scrollTop = 0;
    }

    documentContainer
      .current!.querySelectorAll("pre code")
      .forEach((el: Element) => {
        hljs.highlightElement(el as HTMLElement);
      });
  }

  useEffect(() => {
    renderDocument();
  });
  return (
    <section
      style={{ display: props.openedSection !== "document" ? "none" : "block" }}
      className="document-view"
      ref={documentContainer}
      onClick={onClick}
    ></section>
  );
}
