import katex from "katex";

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

function listenSymbolModalOpen(btn:    HTMLElement | null,
                               modal:  Element     | null): void
{
    if (!btn || !modal) throw new Error("NULL\: check symbol search");
    btn.addEventListener("click", async () => {
      modal.classList.toggle("hidden");
      // HARDCODED, PLEASE FIX ASAP
      const res = await fetch("http://localhost:9001/api/symbols-table");
      const data = await res.json();
      console.log(data);
    });
}

function handleEditorInput(editor: HTMLElement | null,
                           output: HTMLElement | null): void
{
  if (!editor || !output) throw new Error("Null DOM input.")
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
  if (!outId || !edId) throw new Error("Null DOM input.");
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
  const editor    = document.getElementById("text-editor");
  const output    = document.getElementById("text-output");
  const modal     = document.querySelector(".modal-overlay");
  const symBtn    = document.getElementById("modal-symbol-btn");
  const symSearch = document.querySelector(".modal-symbol-ctr");
  const searchPrv = document.getElementById("tex-preview");
  handleEditorInput(editor, output);
  setExampleText(editor, output);
  setSearchPreviewText(searchPrv);
  listenModalClose(modal);
  listenSearchClick(symSearch);
  listenSymbolModalOpen(symBtn, modal);
}

document.addEventListener("DOMContentLoaded", main);
