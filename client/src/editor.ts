import katex from "katex";

type StaticArray<T, L extends number> = [T, ...T[]] & {length: L};
type SymbolEntry = StaticArray<string, 2>;
type SymbolTable = SymbolEntry[] | null;

interface Session {
  symbolTable: SymbolTable;
};

const listenModalClose: (element: Element | null) => void
  = (el) => {
    if (!el) throw new Error("Overlay node is NULL");
    el.addEventListener("click", () => {
      el.classList.toggle("hidden");
    });
  };

const listenSearchClick: (element: Element | null) => void
  = (el) => {
    if (!el) throw new Error("Search area node is NULL");
    el.addEventListener("click", (e) => e.stopPropagation());
  };

// TODO: Should push this to JSON file eventually.
const verbotenSymbol: (cmt: string, ex: string) => boolean = (cmt, ex) =>
     cmt === "Not supported"
  || ex  === "Deprecated"
  || ex.startsWith("Issue");

const cleanSymbols: (d: StaticArray<string, 3>) => SymbolTable
  = (d) => d.filter(([sym, cmt, ex]) => !verbotenSymbol(cmt, ex))
            .map(([sym, cmt, ex]) => [sym,ex]);
// END TODO
const collectSymbols: (t: SymbolTable, start: number, n: number) => SymbolTable
  = (t, start, n) => t ? t.slice(start, start + n) : null;

function listenSymbolModalOpen(btn:    HTMLElement | null,
                               modal:  Element     | null,
                               s:      Session): void
{
    if (!btn || !modal) throw new Error("NULL\: check symbol search");
    btn.addEventListener("click", async () => {
      modal.classList.toggle("hidden");
      if (!s.symbolTable) {
        console.log("Fetching symbol table...");
        // TODO: HARDCODED BACKEND URI, PLEASE FIX ASAP
        const res = await fetch("http://localhost:9001/api/symbols-table");
        const data: StaticArray<string, 3> = await res.json();
        s.symbolTable = cleanSymbols(data);
        console.assert(s.symbolTable !== null, "Failed to update session.");
      }
      s.symbolTable = collectSymbols(s.symbolTable, 374, 11);
      console.log(s);
    });
}

function handleEditorInput(editor: HTMLElement | null,
                           output: HTMLElement | null): void
{
  if (!editor || !output) throw new Error("NULL DOM input.")
  editor.addEventListener("input", (e) => {
    const input: string = (e.target as HTMLInputElement).value;
    katex.render(input, output, {
      displayMode: true,
      throwOnError: false,
      output: "html",
    });
  });
}

function setExampleText(
  edId:   HTMLElement | null,
  outId:  HTMLElement | null,
  ipt:    string      | null = null
) : void {
  if (!outId || !edId) throw new Error("NULL DOM input.");
  // stoke's theorem as a default
  const txt = ipt ||
    "\\oint_{\\partial\\Sigma}\\omega\\,=\\,\\int_{\\Sigma}\\,\\,d\\omega";
  // render out
  katex.render(txt, outId, {
    displayMode: true,
    throwOnError: false,
    output: "html",
  });
  // render in
  edId.innerText = txt;
}

function setSearchPreviewText(winId: HTMLElement | null): void {
  if (!winId) throw new Error("winId reading null!");
  katex.render(
    "\\oint_{\\partial \\Sigma}",
    winId, {
    displayMode: true,
    throwOnError: false,
    output: "html",
  });
}

function main(): void {
  const session: Session = {symbolTable: null,};
  const editor    = document.getElementById("text-editor");
  const output    = document.getElementById("text-output");
  const modal     = document.querySelector(".modal-overlay");
  const symBtn    = document.getElementById("modal-symbol-btn");
  const searchSym = document.querySelector(".modal-symbol-ctr");
  const searchPrv = document.getElementById("tex-preview");
  handleEditorInput(editor, output);
  setExampleText(editor, output);
  setSearchPreviewText(searchPrv);
  listenModalClose(modal);
  listenSearchClick(searchSym);
  listenSymbolModalOpen(symBtn, modal, session);
}

document.addEventListener("DOMContentLoaded", main);
