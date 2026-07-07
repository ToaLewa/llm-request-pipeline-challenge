import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import { getClinicalTeamController, getTeamMemberCasesController } from './doctors/clinical-team.controller';
import { createRequestController } from './requests/request.controller';
import { createWorkflowActionController, getWorkflowController, getWorkflowsController } from './workflows/workflow.controller';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const host = process.env.HOST ?? '0.0.0.0';

const app = express();

app.use(express.json());

app.route('/api/clinical-team').get(getClinicalTeamController).all(methodNotAllowed('GET'));
app.route('/api/clinical-team/:teamMemberId/cases').get(getTeamMemberCasesController).all(methodNotAllowed('GET'));
app.route('/api/requests').post(createRequestController).all(methodNotAllowed('POST'));
app.route('/api/workflows').get(getWorkflowsController).all(methodNotAllowed('GET'));
app.route('/api/workflows/:workflowId').get(getWorkflowController).all(methodNotAllowed('GET'));
app.route('/api/workflows/:workflowId/actions').post(createWorkflowActionController).all(methodNotAllowed('POST'));

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found.' });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof SyntaxError) {
    response.status(400).json({ error: 'Invalid JSON body.' });
    return;
  }

  console.error('Unhandled server error.', error);
  response.status(500).json({ error: 'Internal server error.' });
};

app.use(errorHandler);

app.listen(port, host, () => {
  console.log(`Backend server listening on http://${host}:${port}`);
});

function methodNotAllowed(allowedMethod: string): RequestHandler {
  return (_request, response) => {
    response.setHeader('Allow', allowedMethod);
    response.status(405).end();
  };
}
