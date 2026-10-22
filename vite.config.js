import { defineConfig } from 'vite'

export default defineConfig({
  base: '/terralens-earth-day/',
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
  },
})