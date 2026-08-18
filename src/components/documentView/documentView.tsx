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
  openedDoc: string | null;
  hidden: boolean;
  openDoc: (path: string) => void;
}) {
  const documentContainer = createRef<HTMLDivElement>();

  function onClick(e: MouseEvent) {
    const link = (e.target as HTMLElement).closest("a");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href) return;
    const currentArchiveName = props.openedDoc!.replace("/", "").split("/")[0];
    const currentFilePath = props.openedDoc!.replace(
      "/" + currentArchiveName,
      "",
    );
    let url = new URL(href, new URL(currentFilePath, location.origin));
    if (url.origin === location.origin) {
      e.preventDefault();
      props.openDoc("/" + currentArchiveName + url.pathname + url.hash);
    } else {
      link.target = "_blank";
    }
  }

  async function renderDocument() {
    if (!props.openedDoc) {
      documentContainer.current!.innerHTML =
        "<h1>No page opened</h1>" +
        "<p>Click on the search input to open a page.</p>";
      return;
    }
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
      const elem = document.getElementById(section);
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

    documentContainer.current!.querySelectorAll("table").forEach((table) => {
      const wrapper = document.createElement("div");
      wrapper.className = "table-wrapper";
      table.parentNode!.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }

  useEffect(() => {
    renderDocument();
  }, [props.openedDoc]);

  return (
    <section
      style={{ display: props.hidden ? "none" : "block" }}
      className="document-view"
      ref={documentContainer}
      onClick={onClick}
    ></section>
  );
}
