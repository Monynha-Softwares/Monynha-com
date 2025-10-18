import { preview } from 'vite';

const port = Number.parseInt(process.env.PORT ?? '4173', 10);

console.log(`Starting Monynha preview server on port ${port}`);

const server = await preview({
  preview: {
    host: '0.0.0.0',
    port,
    strictPort: true,
  },
});

server.printUrls();

const shutdown = async () => {
  await server.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
