// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import ConditionalCompile from "vite-plugin-conditional-compiler";

// import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  // WOJTEK: this is from https://github.com/KeJunMao/vite-plugin-conditional-compile
  // plugins: [ConditionalCompile()],
  

  // WOJTEK: this is necessary for Vite to include .fbx files into the build.
  assetsInclude: ['**/*.fbx'],

  
  build: {
    rollupOptions: {
      // WOJTEK: Specify all the entrypoints of the app, i.e. all the .html files that should be parsed by Vite. This is necessary for Vite to know which files to include in the build. 
      input: {
        main: resolve(__dirname, "index.html"),
        auth: resolve(__dirname, "auth.html"),
        bulk_labeller: resolve(__dirname, "bulk_labeller.html"),
        refcams: resolve(__dirname, "refcams.html"),
      },
    },  
  },
  // WOJTEK:  thanks to that, Vite knows that calls from clientside to "/api" should be proxied to the backend server running on http://backend:8080. Inspect "docker-compose-dev.yml" to see why "backend". See also https://vite.dev/config/server-options#server-proxy.
  server: {
    // port: 8000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://backend:8080',
        // WOJTEK: this is probably important for CORS
        changeOrigin: true
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
});

