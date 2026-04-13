export interface ListEntry {
  path: string;
  title: string;
}
export type List = ListEntry[];

export interface TreeEntry {
  type: "file" | "dir";
  title: string;
  path: string;
  children: Tree;
}
export type Tree = TreeEntry[];
