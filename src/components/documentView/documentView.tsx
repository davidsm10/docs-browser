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
      const url = new URL(link.href);
      if (url.origin === location.origin) {
        e.preventDefault();
        props.openDoc(url.pathname);
        if (url.hash) {
          location.hash = url.hash;
        }
      }
    }
  }

  async function renderDocument() {
    const savedDocument = await localforage.getItem<string>(props.openedDoc);
    documentContainer.current!.innerHTML = savedDocument!;
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
      style={{ display: props.openedSection !== "document" ? "none" : "flex" }}
      className="document-view"
      ref={documentContainer}
      onClick={onClick}
    ></section>
  );
}
