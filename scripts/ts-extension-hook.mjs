import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    return { url: pathToFileURL(withExtension(join(root, "src", specifier.slice(2)))).href, shortCircuit: true };
  }

  if ((specifier.startsWith("./") || specifier.startsWith("../")) && !/\.[cm]?[jt]sx?$/.test(specifier)) {
    const parentDir = context.parentURL ? dirname(fileURLToPath(context.parentURL)) : root;
    const base = join(parentDir, specifier);
    if (!existsSync(`${base}.ts`) && existsSync(`${base}.tsx`)) {
      return nextResolve(`${specifier}.tsx`, context);
    }
    return nextResolve(`${specifier}.ts`, context);
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (!url.endsWith(".tsx")) return nextLoad(url, context);
  const source = await readFile(fileURLToPath(url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: fileURLToPath(url),
  });
  return { format: "module", source: compiled.outputText, shortCircuit: true };
}

function withExtension(base) {
  if (existsSync(`${base}.ts`)) return `${base}.ts`;
  if (existsSync(`${base}.tsx`)) return `${base}.tsx`;
  if (existsSync(join(base, "index.ts"))) return join(base, "index.ts");
  if (existsSync(join(base, "index.tsx"))) return join(base, "index.tsx");
  return `${base}.ts`;
}
