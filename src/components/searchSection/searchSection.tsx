import "./searchSection.css";
import { useState } from "preact/hooks";
import { type FuseResult } from "fuse.js";
import type { ListEntry, Tree, TreeEntry } from "../../types";
import { ChevronDownIcon, ChevronRightIcon, FileIcon } from "lucide-preact";

function TreeEntryElement(props: {
  tree: TreeEntry;
  openDoc: (path: string) => void;
}) {
  const [opened, setOpened] = useState(false);
  const depth = props.tree.path.replace("/", "").split("/").length - 1;

  function open() {
    if (props.tree.type === "dir") {
      if (opened) setOpened(false);
      else setOpened(true);
    } else {
      props.openDoc(props.tree.path);
    }
  }

  let children;
  if (opened) {
    children = (
      <div>
        {props.tree.children.map((entry) => (
          <TreeEntryElement
            key={entry.path}
            tree={entry}
            openDoc={props.openDoc}
          />
        ))}
      </div>
    );
  }
  return (
    <div>
      <button
        style={{ paddingLeft: depth && depth * 10 }}
        className="entry"
        onClick={open}
      >
        {props.tree.type === "dir" ? (
          opened ? (
            <ChevronDownIcon />
          ) : (
            <ChevronRightIcon />
          )
        ) : (
          <FileIcon size={20}/>
        )}
        {props.tree.title}
      </button>
      {children}
    </div>
  );
}

function SearchEntry(props: {
  entry: ListEntry;
  openDoc: (path: string) => void;
}) {
  return (
    <div>
      <button className="entry" onClick={() => props.openDoc(props.entry.path)}>
        {props.entry.title}
      </button>
    </div>
  );
}

export function SearchSection(props: {
  openedSection: "document" | "search";
  searchResult: FuseResult<ListEntry>[];
  tree: Tree;
  openDoc: (path: string) => void;
}) {
  return (
    <section
      class="search-section"
      style={{ display: props.openedSection !== "search" ? "none" : "flex" }}
    >
      <div hidden={props.searchResult.length !== 0}>
        {props.tree.map((entry) => (
          <TreeEntryElement
            key={entry.path}
            tree={entry}
            openDoc={props.openDoc}
          />
        ))}
      </div>
      <div hidden={props.searchResult.length === 0}>
        {props.searchResult.map((entry) => (
          <SearchEntry
            key={entry.item.path}
            entry={entry.item}
            openDoc={props.openDoc}
          />
        ))}
      </div>
    </section>
  );
}
