import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({}) => {
  const deploymentName = process.env.LLAMA_DEPLOY_DEPLOYMENT_NAME;
  const basePath = process.env.LLAMA_DEPLOY_DEPLOYMENT_BASE_PATH;
  const projectId = process.env.LLAMA_DEPLOY_PROJECT_ID;
  const port = process.env.PORT;
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: port ? parseInt(port) : undefined,
      host: true,
      hmr: {
        port: port ? parseInt(port) : undefined,
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
    base: basePath,
    define: {
      // Copy through some standard environment variables to make
      // integration with workflows api easier
      ...(deploymentName && {
        "import.meta.env.VITE_LLAMA_DEPLOY_DEPLOYMENT_NAME":
          JSON.stringify(deploymentName),
      }),
      ...(basePath && {
        "import.meta.env.VITE_LLAMA_DEPLOY_DEPLOYMENT_BASE_PATH":
          JSON.stringify(basePath),
      }),
      ...(projectId && {
        "import.meta.env.VITE_LLAMA_CLOUD_PROJECT_ID":
          JSON.stringify(projectId),
      }),
    },
  };
});
