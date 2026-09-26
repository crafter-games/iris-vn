import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Compiler, CompilerOptions } from "inkjs/full";
import type { IFileHandler } from "inkjs/compiler/IFileHandler";
import { ErrorType } from "inkjs/engine/Error";
import type { Plugin } from "vite";

// INCLUDE se resuelve relativo a la carpeta del .ink principal.
function includesFrom(root: string): IFileHandler {
  return {
    ResolveInkFilename: (filename) => resolve(root, filename),
    LoadInkFileContents: (filename) => readFileSync(filename, "utf8"),
  };
}

// Compila los .ink a JSON en build: el cliente solo carga el runtime ligero de inkjs.
export default function ink(): Plugin {
  return {
    name: "ink",
    transform(source, id) {
      if (!id.endsWith(".ink")) return null;
      const errors: string[] = [];
      const options = new CompilerOptions(
        id,
        [],
        false,
        (message, type) => {
          if (type === ErrorType.Error) errors.push(message);
          else this.warn(message);
        },
        includesFrom(dirname(id)),
      );
      const story = new Compiler(source, options).Compile();
      if (errors.length || !story) this.error(`Ink (${id}):\n${errors.join("\n")}`);
      return { code: `export default ${JSON.stringify(story.ToJson())};`, map: null };
    },
    handleHotUpdate({ file, server }) {
      // Un .ink incluido con INCLUDE no es un módulo: recarga todo al cambiar cualquier .ink.
      if (file.endsWith(".ink")) {
        server.moduleGraph.invalidateAll();
        server.ws.send({ type: "full-reload" });
        return [];
      }
    },
  };
}
