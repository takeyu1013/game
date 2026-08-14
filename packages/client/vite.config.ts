import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const entry = "/src/main.tsx";

const spaHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>game</title>
  </head>
  <body>
    <script type="module" src="${entry}"></script>
  </body>
</html>
`;

const spaHtmlPlugin = (): Plugin => {
  let root = "";
  const indexFile = (): string => path.resolve(root, "index.html");
  return {
    name: "spa-html",
    enforce: "pre",
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split("?")[0] ?? "";
          if (req.method !== "GET" && req.method !== "HEAD") {
            next();
            return;
          }
          if (url !== "/" && url !== "/index.html") {
            next();
            return;
          }
          void server.transformIndexHtml("/index.html", spaHtml, req.originalUrl).then((html) => {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);
          }, next);
        });
      };
    },
    resolveId(source) {
      if (source === "index.html" || path.resolve(source) === indexFile()) {
        return indexFile();
      }
      return undefined;
    },
    load(id) {
      if (path.resolve(id) === indexFile()) {
        return spaHtml;
      }
      return undefined;
    },
  };
};

export default defineConfig({
  appType: "spa",
  plugins: [spaHtmlPlugin(), react()],
  server: {
    port: 5173,
  },
  optimizeDeps: {
    include: ["phaser"],
  },
});
