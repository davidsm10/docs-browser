import "./main.css";
import { SearchSection } from "../searchSection/searchSection";
import { DocumentSection } from "../documentView/documentView";
import { useEffect, useState } from "preact/hooks";
import localforage from "localforage";
import { saveContent } from "../../content";
import type { List, Tree, ListEntry } from "../../types";
import debounce from "debounce";
import Fuse, { type FuseResult } from "fuse.js";
import type { Dispatch, StateUpdater } from "preact/hooks";
import { ArrowLeftIcon, ArrowRightIcon, MenuIcon } from "lucide-preact";

export function Header(props: {
  list: List;
  setSearchResult: Dispatch<StateUpdater<FuseResult<ListEntry>[]>>;
  openedSection: "document" | "search";
  setOpenedSection: Dispatch<StateUpdater<"document" | "search">>;
}) {
  const fuse = new Fuse(props.list, {
    keys: ["title"],
  });
  const debouncedSearch = debounce(search, 500);
  function search(query: string) {
    if (query.trim()) {
      props.setSearchResult(fuse.search(query, { limit: 50 }));
    } else {
      props.setSearchResult([]);
    }
  }

  function toggleOpenedSection() {
    if (props.openedSection === "document") {
      props.setOpenedSection("search");
    } else {
      props.setOpenedSection("document");
    }
  }

  return (
    <div className="header">
      <button onClick={toggleOpenedSection}>
        <MenuIcon />
      </button>
      <input
        type="search"
        onClick={() => props.setOpenedSection("search")}
        onInput={(e) => debouncedSearch(e.currentTarget.value)}
        placeholder="Search..."
      />
      <button onClick={() => window.history.back()}>
        <ArrowLeftIcon />
      </button>
      <button onClick={() => window.history.forward()}>
        <ArrowRightIcon />
      </button>
    </div>
  );
}

export function Main() {
  const [setupDone, setSetupDone] = useState(
    Boolean(localStorage.getItem("setup-done")),
  );
  const [list, setList] = useState<null | List>(null);
  const [tree, setTree] = useState<null | Tree>(null);
  const [openedSection, setOpenedSection] = useState<"search" | "document">(
    "search",
  );
  const [openedDoc, setOpenedDoc] = useState<null | string>(null);
  const [searchResult, setSearchResult] = useState<FuseResult<ListEntry>[]>([]);

  function openDoc(path: string) {
    location.hash = "#" + path;
  }

  window.addEventListener("hashchange", () => {
    setOpenedDoc(window.location.hash.replace("#", ""));
    setOpenedSection("document");
  })

  useEffect(() => {
    if (!setupDone) {
      saveContent().then(() => {
        localStorage.setItem("setup-done", "true");
        setSetupDone(true);
      });
    }

    if (!list) {
      localforage.getItem<List>("list").then((value) => setList(value));
    }

    if (!tree) {
      localforage.getItem<Tree>("tree").then((value) => setTree(value));
    }
  });

  if (!setupDone) {
    return <div>Decompressing, converting and saving docs</div>;
  }

  return (
    <div className="container">
      {list && (
        <Header
          list={list}
          setSearchResult={setSearchResult}
          openedSection={openedSection}
          setOpenedSection={setOpenedSection}
        />
      )}

      {tree && (
        <SearchSection
          searchResult={searchResult}
          tree={tree}
          openDoc={openDoc}
          openedSection={openedSection}
        />
      )}
      {openedDoc && (
        <DocumentSection
          openedDoc={openedDoc}
          openDoc={openDoc}
          openedSection={openedSection}
        />
      )}
    </div>
  );
}
