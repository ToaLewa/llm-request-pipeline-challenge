import {
  createOpenAIRoutingDecisionClient,
  createRoutingDecision,
} from '../inference/routing.ts';
import { createInitialWorkflow } from '../workflows/workflow.service.ts';

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let input = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      input += chunk;
    });
    process.stdin.on('end', () => {
      resolve(input);
    });
    process.stdin.on('error', reject);
  });
}

function printUsage(): void {
  console.error('Usage: npm run route -- "request text"');
  console.error('   or: printf "request text" | npm run route');
}

async function main(): Promise<void> {
  const argRequest = process.argv.slice(2).join(' ').trim();
  const rawRequest = argRequest || (process.stdin.isTTY ? '' : await readStdin()).trim();

  if (!rawRequest) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const client = createOpenAIRoutingDecisionClient();
  const decision = await createRoutingDecision(rawRequest, client);
  const workflow = await createInitialWorkflow(rawRequest, decision);

  console.log(JSON.stringify({ ...workflow, routingDecision: decision }, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Routing failed: ${message}`);
  process.exitCode = 1;
});
