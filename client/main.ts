type GreetFn = (name: string) => string;
const greet: GreetFn = (name) => `hello, ${name}`;

function main(): void {
  console.log(greet("YEPPERS!"));
}

window.onload = main;
