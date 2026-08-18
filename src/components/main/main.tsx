import "./main.css";
import { SearchSection } from "../searchSection/searchSection";
import { DocumentSection } from "../documentView/documentView";
import { useEffect, useRef, useState } from "preact/hooks";
import localforage from "localforage";
import type { List, Tree, ListEntry } from "../../types";
import Fuse, { type FuseResult } from "fuse.js";
import type { Dispatch, StateUpdater } from "preact/hooks";
import { ArrowLeftIcon, ArrowRightIcon, MenuIcon } from "lucide-preact";
import { useDebouncedCallback } from "use-debounce";
import SetupView from "../setupView/setupView";

export function Header(props: {
  list: List;
  setSearchResult: Dispatch<StateUpdater<FuseResult<ListEntry>[]>>;
  openedSection: "document" | "search";
  setOpenedSection: Dispatch<StateUpdater<"document" | "search">>;
}) {
  const fuse = useRef<Fuse<ListEntry>>(null);
  const debouncedSearch = useDebouncedCallback(search, 500);
  function search(query: string) {
    if (query.trim()) {
      props.setSearchResult(fuse.current!.search(query, { limit: 50 }));
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

  useEffect(() => {
    fuse.current = new Fuse(props.list, {
      keys: ["title"],
    });
  }, []);

  return (
    <div className="header">
      <button onClick={toggleOpenedSection}>
        <MenuIcon />
      </button>
      <input
        type="search"
        onFocus={() => props.setOpenedSection("search")}
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
  const [setupDone, setSetupDone] = useState(() =>
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

  function onSetupDone() {
    localStorage.setItem("setup-done", "true");
    setSetupDone(true);
  }

  useEffect(() => {
    const loadInitialData = async () => {
      if (!list) {
        setList(await localforage.getItem<List>("list"));
      }

      if (!tree) {
        setTree(await localforage.getItem<Tree>("tree"));
      }
    };

    loadInitialData();
  }, [setupDone]);

  useEffect(() => {
    window.addEventListener("hashchange", () => {
      setOpenedDoc(window.location.hash.replace("#", ""));
      setOpenedSection("document");
    });
  }, []);

  if (!setupDone) {
    return <SetupView onSetupDone={onSetupDone} />;
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
          hidden={openedSection !== "search"}
        />
      )}
      <DocumentSection
        openedDoc={openedDoc}
        openDoc={openDoc}
        hidden={openedSection !== "document"}
      />
    </div>
  );
}
