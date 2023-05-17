import katex from "katex";

function handleEditorInput(editor: HTMLElement | null,
                           output: HTMLElement | null): void {
  if (!editor || !output) throw new Error("Null DOM input.")
  editor.addEventListener("input", (e) => {
    const input: string = (e.target as HTMLInputElement).value;
    console.log(input);
    const mathText = katex.renderToString(input, {
      displayMode: true,
      throwOnError: false,
      output: "mathml",
    });
    console.log(mathText);
    output.innerHTML = mathText;
  });
}

function main(): void {
  console.log("Hello, editor!");
  const editor = document.getElementById("text-editor");
  const output = document.getElementById("text-output");
  handleEditorInput(editor, output);
}

document.addEventListener("DOMContentLoaded", main);
