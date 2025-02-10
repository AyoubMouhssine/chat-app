import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server : {
    port:3000,
    host: true,
    origin: "http://0.0.0.0:3000",
  },
  define:{
    global:'window'
  },
  plugins: [react()],
});
