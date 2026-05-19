import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    {
      name: 'steam-api-dev',
      configureServer(server) {
        server.middlewares.use('/api/steam', async (req, res) => {
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

          // server.config.env contains VITE_* vars loaded from .env
          process.env.VITE_STEAM_API_KEY ??= server.config.env['VITE_STEAM_API_KEY']

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error -- api/steam.js is a plain JS Vercel handler with no type declarations
          const { default: handler } = await import('./api/steam.js')
          await handler(mockReq, mockRes)
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
