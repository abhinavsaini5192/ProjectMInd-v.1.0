import { Command } from '../CommandRouter';
import { ProjectMindKernel } from '../../kernel/ProjectMindKernel';
import * as fs from 'fs';
import * as path from 'path';

export class InitCommand implements Command {
  name = 'init';
  description = 'Initializes a new ProjectMind repository.';

  public async execute(args: string[], kernel: ProjectMindKernel): Promise<void> {
    const workspacePath = kernel.workspaceManager.workspacePath;
    const configDir = path.join(workspacePath, '.projectmind');
    
    console.log(`Initializing ProjectMind in ${workspacePath}...`);
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    const configPath = path.join(configDir, 'config.json');
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify({
        version: "1.0.0",
        repository: path.basename(workspacePath)
      }, null, 2));
      console.log('Created .projectmind/config.json');
    } else {
      console.log('ProjectMind is already initialized in this directory.');
    }
  }
}
