import { createServer } from 'node:http';
import { getClinicalTeamController, getTeamMemberCasesController } from './doctors/clinical-team.controller';
import { createRequestController } from './requests/request.controller';
import { createWorkflowActionController, getWorkflowController, getWorkflowsController } from './workflows/workflow.controller';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const host = process.env.HOST ?? '0.0.0.0';

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  if (url.pathname === '/api/clinical-team') {
    if (request.method !== 'GET') {
      response.statusCode = 405;
      response.setHeader('Allow', 'GET');
      response.end();
      return;
    }

    void getClinicalTeamController(request, response);
    return;
  }

  const teamMemberCasesMatch = /^\/api\/clinical-team\/(\d+)\/cases$/.exec(url.pathname);

  if (teamMemberCasesMatch) {
    if (request.method !== 'GET') {
      response.statusCode = 405;
      response.setHeader('Allow', 'GET');
      response.end();
      return;
    }

    void getTeamMemberCasesController(request, response, Number.parseInt(teamMemberCasesMatch[1], 10));
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

  if (url.pathname === '/api/workflows') {
    if (request.method !== 'GET') {
      response.statusCode = 405;
      response.setHeader('Allow', 'GET');
      response.end();
      return;
    }

    void getWorkflowsController(request, response);
    return;
  }

  const workflowActionMatch = /^\/api\/workflows\/(\d+)\/actions$/.exec(url.pathname);

  if (workflowActionMatch) {
    if (request.method !== 'POST') {
      response.statusCode = 405;
      response.setHeader('Allow', 'POST');
      response.end();
      return;
    }

    void createWorkflowActionController(request, response, Number.parseInt(workflowActionMatch[1], 10));
    return;
  }

  const workflowMatch = /^\/api\/workflows\/(\d+)$/.exec(url.pathname);

  if (workflowMatch) {
    if (request.method !== 'GET') {
      response.statusCode = 405;
      response.setHeader('Allow', 'GET');
      response.end();
      return;
    }

    void getWorkflowController(request, response, Number.parseInt(workflowMatch[1], 10));
    return;
  }

  response.statusCode = 404;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify({ error: 'Not found.' }));
});

server.listen(port, host, () => {
  console.log(`Backend server listening on http://${host}:${port}`);
});
