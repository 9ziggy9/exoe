import katex from "katex";

type StaticArray<T, L extends number> = [T, ...T[]] & {length: L};
type SymbolEntry = StaticArray<string, 2>;
type SymbolTable = SymbolEntry[] | null;

interface Session {
  symbolTable: SymbolTable;        // Total list of symbols
  symbolTableIdx: number;          // Current location in list
  symbolTableChunkSize: number;    // Size to read in
  previewTableBuffer: SymbolTable; // Current view
};

// TODO: Should push this to JSON file eventually.
// Also probably a good idea into looking to the following error:

    /* LaTeX-incompatible input and strict mode is set to 'warn':
        HTML extension is disabled on strict mode [htmlExtension] */

// I am adding tests for "Must" and "Requires" in the comment string
// until further notice. Still best that I simply output this to
// a json file and go from there.

const verbotenSymbol: (cmt: string, ex: string) => boolean = (cmt, ex) =>
     cmt === "Not supported"
  || ex.includes("Must")
  || ex.includes("Requires")
  || ex.includes("Deprecated")
  || ex.startsWith("Issue");

// includes methods above are making filter step O(n^2)
const cleanSymbols: (d: StaticArray<string, 3>) => SymbolTable
  = (d) => d.filter(([sym, cmt, ex]) => !verbotenSymbol(cmt, ex))
            .map(([sym, cmt, ex]) => [sym,ex]);
// END TODO

const collectSymbols: (t: SymbolTable, start: number, n: number) => SymbolTable
  = (t, start, n) => t ? t.slice(start, start + n) : null;

// TODO: Need some type of CSS ID flag on hover to initiate preview.
function renderTeXPreview(p: HTMLElement | null, tex: string | null): void {
  if (!p || !tex) throw new Error("NULL\: failure in renderTeXPreview");
  katex.render(tex, p, {
    displayMode: true,
    throwOnError: false,
    output: "html",
  });
}

function nextPreviewTableChunk(s: Session): void {
  // Adding a slight padding of 10
  s.symbolTableIdx += s.symbolTableChunkSize - 10;
  s.previewTableBuffer = collectSymbols(s.symbolTable,
                                        s.symbolTableIdx,
                                        s.symbolTableChunkSize);
}

function renderEntries(t: SymbolTable): void {
  console.assert(t !== null, "Why is session symbolTable empty?");

  /* I don't like that we now have DOM queries outside of main.
     I think that perhaps the set of element IDs that we need should be
     obtained in main() entry point, and then held in session interface. */
  const tBody   = document.getElementById("sym-table-entry");
  const preview = document.getElementById("tex-preview");

  if (!preview || !tBody) throw new Error("NULL\: check renderSymbols()");
  if (!t) throw new Error("NULL\: session SymbolTable has not been read.");

  tBody.innerHTML = ""; // clear previous buffer

  for (let [sym, ex] of t) {
    const newRow  = document.createElement("tr");
    const symData = document.createElement("td");
    const exData  = document.createElement("td");
    symData.textContent = sym;
    exData.textContent  = ex.length ? ex : sym;
    newRow.appendChild(symData);
    newRow.appendChild(exData);
    newRow.addEventListener("mouseover", () => renderTeXPreview(
      preview,
      exData.textContent
    ));

    tBody.appendChild(newRow);
  }
}

/* BEGIN LISTENERS */
function listenSymbolModalOpen(btn:    HTMLElement | null,
                               modal:  Element     | null,
                               s:      Session): void
{
    if (!btn || !modal) throw new Error("NULL\: check symbol search");
    btn.addEventListener("click", async () => {
      modal.classList.toggle("hidden");
      if (!s.symbolTable) {
        // TODO: HARDCODED BACKEND URI, PLEASE FIX ASAP
        const res = await fetch("http://localhost:9001/api/symbols-table");
        const data: StaticArray<string, 3> = await res.json();
        s.symbolTable = cleanSymbols(data);
        s.previewTableBuffer = collectSymbols(s.symbolTable,
                                              s.symbolTableIdx,
                                              s.symbolTableChunkSize);
        renderEntries(s.previewTableBuffer);
        console.assert(s.symbolTable !== null, "Failed to update session.");
      }
    });
}

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

function listenSearchTableScroll(table: HTMLElement | null, s: Session): void
{
  if (!table || !s) throw new Error("NULL\: null args in scroll listener.");
  table.addEventListener("scroll", () => {
    // DOWN CASE
    if (table.scrollTop + table.clientHeight >= table.scrollHeight) {
      // TODO: resolve over the list bug
      nextPreviewTableChunk(s);
      renderEntries(s.previewTableBuffer);
      table.scrollTop = 0; // force to top
    }
  });
}
/* END LISTENERS */


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
  const session: Session = {
    symbolTable: null,
    symbolTableIdx: 0,
    symbolTableChunkSize: 100,
    previewTableBuffer: null,
  };
  const editor    = document.getElementById("text-editor");
  const output    = document.getElementById("text-output");
  const modal     = document.querySelector(".modal-overlay");
  const symBtn    = document.getElementById("modal-symbol-btn");
  const searchSym = document.querySelector(".modal-symbol-ctr");
  const searchPrv = document.getElementById("tex-preview");
  const searchTbl = document.getElementById("table-container");
  handleEditorInput(editor, output);
  setExampleText(editor, output);
  setSearchPreviewText(searchPrv);
  listenModalClose(modal);
  listenSearchClick(searchSym);
  listenSymbolModalOpen(symBtn, modal, session);
  listenSearchTableScroll(searchTbl, session);
}


document.addEventListener("DOMContentLoaded", main);
