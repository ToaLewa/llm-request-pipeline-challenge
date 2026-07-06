import { createServer } from 'node:http';
import { getDoctorPoolController } from './doctors/pool.controller';
import { createRequestController } from './requests/request.controller';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const host = process.env.HOST ?? '0.0.0.0';

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  if (url.pathname === '/api/doctors') {
    if (request.method !== 'GET') {
      response.statusCode = 405;
      response.setHeader('Allow', 'GET');
      response.end();
      return;
    }

    void getDoctorPoolController(request, response);
    return;
  }

  if (url.pathname === '/api/requests') {
    if (request.method !== 'POST') {
      response.statusCode = 405;
      response.setHeader('Allow', 'POST');
      response.end();
      return;
    }

    void createRequestController(request, response);
    return;
  }

  response.statusCode = 404;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify({ error: 'Not found.' }));
});

server.listen(port, host, () => {
  console.log(`Backend server listening on http://${host}:${port}`);
});
