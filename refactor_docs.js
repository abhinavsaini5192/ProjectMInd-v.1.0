const fs = require('fs');
const path = require('path');

const root = __dirname;
const docs = path.join(root, 'docs');

const dirs = [
  'architecture',
  'specifications',
  'development',
  'guides',
  'generated',
  'assets',
  'examples'
];

dirs.forEach(d => {
  const dirPath = path.join(docs, d);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Helper to move file
function moveFile(srcName, destFolder, newName = null) {
  const src = path.join(root, srcName);
  if (!fs.existsSync(src)) {
    console.log(`Skipping ${srcName}, does not exist.`);
    return;
  }
  const dest = path.join(docs, destFolder, newName || srcName);
  fs.renameSync(src, dest);
  console.log(`Moved ${srcName} -> docs/${destFolder}/${newName || srcName}`);
}

// Helper to merge files
function mergeFiles(srcNames, destFolder, destName) {
  let combined = '';
  for (const srcName of srcNames) {
    const src = path.join(root, srcName);
    if (fs.existsSync(src)) {
      const content = fs.readFileSync(src, 'utf8');
      combined += `\n<!-- Original File: ${srcName} -->\n\n` + content + '\n';
      fs.unlinkSync(src);
      console.log(`Merged and deleted ${srcName}`);
    } else {
      console.log(`Skipping merge of ${srcName}, not found.`);
    }
  }
  const dest = path.join(docs, destFolder, destName);
  fs.writeFileSync(dest, combined);
  console.log(`Created merged file docs/${destFolder}/${destName}`);
}

// 1. Merges
mergeFiles(['RULES.md', 'AI_RULES.md', 'AI_WORKFLOW.md'], 'development', 'ai_agent_rules.md');
mergeFiles(['PRD.md', 'VISION.md'], 'architecture', 'product_vision.md');
mergeFiles(['STORAGE_ARCHITECTURE.md', 'STORAGE_ABSTRACTION.md'], 'architecture', 'storage_architecture.md');
mergeFiles(['WORKSPACE_CORE.md', 'WORKSPACE_SPEC.md'], 'architecture', 'workspace_architecture.md');
mergeFiles(['WORKSPACE_LIFECYCLE.md', 'REPO_LIFECYCLE.md'], 'architecture', 'lifecycle_management.md');
mergeFiles(['ENGINEERING_BLUEPRINT.md', 'IMPLEMENTATION_PLAN.md'], 'development', 'engineering_blueprint.md');

// 2. Simple Moves
// Architecture
moveFile('ARCHITECTURE.md', 'architecture', 'system_architecture.md');
moveFile('DATA_FLOW.md', 'architecture', 'data_flow.md');

// Specifications
moveFile('GRAPH_SPEC.md', 'specifications', 'graph_spec.md');
moveFile('MEMORY_SPEC.md', 'specifications', 'memory_spec.md');
moveFile('PROMPT_SPEC.md', 'specifications', 'prompt_spec.md');
moveFile('UPDATE_SPEC.md', 'specifications', 'update_spec.md');
moveFile('FILE_FORMATS.md', 'specifications', 'file_formats.md');

// Development
moveFile('CODING_STANDARDS.md', 'development', 'coding_standards.md');
moveFile('TESTING_PLAN.md', 'development', 'testing_plan.md');

// Guides
moveFile('MIGRATION_GUIDE.md', 'guides', 'migration_guide.md');

// Generated
moveFile('WORKSPACE_API_SPEC.md', 'generated', 'api_reference.md');
moveFile('WORKSPACE_SERVICES.md', 'generated', 'services_reference.md');
moveFile('WORKSPACE_EVENTS.md', 'generated', 'events_catalog.md');
moveFile('WORKSPACE_ERRORS.md', 'generated', 'errors_catalog.md');
moveFile('CLI_DESIGN.md', 'generated', 'cli_reference.md');
moveFile('MODULES.md', 'generated', 'module_map.md');

console.log('File structure reorganized.');
