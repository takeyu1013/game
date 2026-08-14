import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "../packages/client/src/module_bindings");

const toKebab = (name: string): string => name.replaceAll("_", "-");

const walk = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(path)));
      continue;
    }
    if (entry.name.endsWith(".ts")) {
      files.push(path);
    }
  }
  return files;
};

const files = await walk(root);

for (const file of files) {
  const source = await readFile(file, "utf8");
  const next = source.replaceAll(/from ("\.\.?\/[^"]+")/g, (match) => match.replaceAll("_", "-"));
  if (next !== source) {
    await writeFile(file, next);
  }
}

for (const file of files) {
  const parts = file.split("/");
  const name = parts.at(-1);
  if (!name || !name.includes("_")) {
    continue;
  }
  parts[parts.length - 1] = toKebab(name);
  await rename(file, parts.join("/"));
}
