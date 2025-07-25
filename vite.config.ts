import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    return {
        plugins: [
            monkey({
                entry: "src/main.ts",
                userscript: {
                    icon: "https://vitejs.dev/logo.svg",
                    namespace: "npm/vite-plugin-monkey",
                    match: ["https://exhentai.org/*", "https://e-hentai.org/*"],
                },
            }),
        ],
        esbuild: {
            drop: mode === "production" ? ["console"] : [], // Remove console logging in production environment
        },
    };
});
