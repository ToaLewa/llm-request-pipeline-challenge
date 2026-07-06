import { defineConfig } from 'vite';
import { getDoctorPoolController } from './src/doctors/pool.controller';

export default defineConfig({
  plugins: [
    {
      name: 'doctor-pool-api',
      configureServer(server) {
        server.middlewares.use('/api/doctors', (request, response) => {
          if (request.method !== 'GET') {
            response.statusCode = 405;
            response.setHeader('Allow', 'GET');
            response.end();
            return;
          }

          void getDoctorPoolController(request, response);
        });
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
