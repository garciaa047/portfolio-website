import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  /* Relative, so the built site works wherever it is served from: the root
     of a user page (garciaa047.github.io/), a project page under the repo
     name (garciaa047.github.io/<repo>/), or a local `vite preview`. An
     absolute "/" would 404 every asset on a project page, and hard-coding
     "/<repo>/" would break if the repo is ever renamed. Routing is
     hash-based, so the document URL is always the index page and every
     `import.meta.env.BASE_URL` path resolves against it correctly. */
  base: "./",
  plugins: [react()],
});
