import { readAll } from "https://deno.land/std@0.99.0/io/util.ts";

console.log("Hello world!");
const stdinContent = await readAll(Deno.stdin);
console.log(stdinContent);
