type GreetFn = (name: string) => string;
const greet: GreetFn = (name) => `hello, ${name}`;

function main(): void {
  console.log(greet("from main!"));
}

window.onload = main;
