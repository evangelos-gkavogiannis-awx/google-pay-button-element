// vite.config.js
export default {
    root: './',
    server: {
        port: 5173,
    },
    build: {
        outDir: '../public', // so Express can serve it
        emptyOutDir: true
    },
    server: {
        proxy: {
            '/api': 'http://localhost:3000',
        }
    }
}
