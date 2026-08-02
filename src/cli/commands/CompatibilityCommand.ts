import { Command } from '../CommandRouter';
import { ProjectMindKernel } from '../../kernel/ProjectMindKernel';
import * as fs from 'fs';
import * as path from 'path';

export class CompatibilityCommand implements Command {
  name = 'compatibility';
  description = 'Generates a compatibility report for the current ProjectMind installation.';

  public async execute(args: string[], kernel: ProjectMindKernel): Promise<void> {
    console.log('Generating Compatibility Report...');

    const report = {
      projectmindVersion: "1.0.0",
      pluginApiVersion: "1.x",
      datasetSchemaVersion: "training_sample.v1",
      knowledgeSchemaVersion: "1.0",
      eventContractVersion: "1.0",
      slmCompatibilityVersion: "1.0"
    };

    const outPath = path.join(kernel.workspaceManager.workspacePath, 'compatibility_report.json');
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

    console.log(`Report generated at: ${outPath}`);
    console.log(JSON.stringify(report, null, 2));
  }
}
