import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string }

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    {
      name: 'steam-api-dev',
      configureServer(server) {
        function makeHandler(path: string, importFn: () => Promise<{ default: (req: unknown, res: unknown) => Promise<void> }>) {
          server.middlewares.use(path, async (req, res) => {
            const url = req.url ?? ''
            const queryString = url.includes('?') ? url.slice(url.indexOf('?') + 1) : ''
            const searchParams = new URLSearchParams(queryString)
            const query: Record<string, string> = {}
            searchParams.forEach((value, key) => { query[key] = value })

            const mockReq = { method: req.method, url, query }
            let statusCode = 200
            const mockRes = {
              setHeader: (name: string, value: string) => res.setHeader(name, value),
              status(code: number) { statusCode = code; return mockRes },
              json(data: unknown) {
                res.writeHead(statusCode, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(data))
              },
            }

            const { default: handler } = await importFn()
            await handler(mockReq, mockRes)
          })
        }

        // server.config.env contains VITE_* vars loaded from .env
        server.middlewares.use((req, _res, next) => {
          process.env.VITE_STEAM_API_KEY ??= server.config.env['VITE_STEAM_API_KEY']
          next()
        })

        // @ts-expect-error -- api/*.js are plain JS Vercel handlers without type declarations
        makeHandler('/api/steam', () => import('./api/steam.js'))
        // @ts-expect-error -- api/*.js are plain JS Vercel handlers without type declarations
        makeHandler('/api/store', () => import('./api/store.js'))
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
