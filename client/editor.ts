function handleEditorInput(editor: HTMLElement | null,
                           output: HTMLElement | null): void {
  if (!editor || !output) throw new Error("Null DOM input.")
  editor.addEventListener("input", (e) => {
    output.innerHTML = (e.target as HTMLInputElement).value;
  });
}

function main(): void {
  console.log("Hello, editor!");
  const editor = document.getElementById("text-editor");
  const output = document.getElementById("text-output");
  handleEditorInput(editor, output);
}

document.addEventListener("DOMContentLoaded", main);
