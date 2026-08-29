const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const targetFiles = ['README.md', 'CONTRIBUTING.md', 'ROADMAP.md', 'SECURITY.md'];

const linkMap = {
  'ARCHITECTURE.md': 'docs/architecture/system_architecture.md',
  'DATA_FLOW.md': 'docs/architecture/data_flow.md',
  'PRD.md': 'docs/architecture/product_vision.md',
  'VISION.md': 'docs/architecture/product_vision.md',
  'WORKSPACE_CORE.md': 'docs/architecture/workspace_architecture.md',
  'WORKSPACE_SPEC.md': 'docs/architecture/workspace_architecture.md',
  'STORAGE_ARCHITECTURE.md': 'docs/architecture/storage_architecture.md',
  'STORAGE_ABSTRACTION.md': 'docs/architecture/storage_architecture.md',
  'WORKSPACE_LIFECYCLE.md': 'docs/architecture/lifecycle_management.md',
  'REPO_LIFECYCLE.md': 'docs/architecture/lifecycle_management.md',
  'GRAPH_SPEC.md': 'docs/specifications/graph_spec.md',
  'MEMORY_SPEC.md': 'docs/specifications/memory_spec.md',
  'PROMPT_SPEC.md': 'docs/specifications/prompt_spec.md',
  'UPDATE_SPEC.md': 'docs/specifications/update_spec.md',
  'FILE_FORMATS.md': 'docs/specifications/file_formats.md',
  'CODING_STANDARDS.md': 'docs/development/coding_standards.md',
  'TESTING_PLAN.md': 'docs/development/testing_plan.md',
  'ENGINEERING_BLUEPRINT.md': 'docs/development/engineering_blueprint.md',
  'IMPLEMENTATION_PLAN.md': 'docs/development/engineering_blueprint.md',
  'RULES.md': 'docs/development/ai_agent_rules.md',
  'AI_RULES.md': 'docs/development/ai_agent_rules.md',
  'AI_WORKFLOW.md': 'docs/development/ai_agent_rules.md',
  'MIGRATION_GUIDE.md': 'docs/guides/migration_guide.md',
  'WORKSPACE_API_SPEC.md': 'docs/generated/api_reference.md',
  'WORKSPACE_SERVICES.md': 'docs/generated/services_reference.md',
  'WORKSPACE_EVENTS.md': 'docs/generated/events_catalog.md',
  'WORKSPACE_ERRORS.md': 'docs/generated/errors_catalog.md',
  'CLI_DESIGN.md': 'docs/generated/cli_reference.md',
  'MODULES.md': 'docs/generated/module_map.md'
};

for (const file of targetFiles) {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;
    
    for (const [oldName, newLink] of Object.entries(linkMap)) {
      const regex = new RegExp(`\\]\\(\\/?${oldName.replace('.', '\\.')}\\)`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `](${newLink})`);
        changed = true;
        console.log(`Updated link to ${oldName} in ${file}`);
      }
    }
    
    if (changed) {
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

console.log('Root link updates complete.');
