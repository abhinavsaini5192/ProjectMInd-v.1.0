const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'docs');

const linkMap = {
  'ARCHITECTURE.md': '../architecture/system_architecture.md',
  'DATA_FLOW.md': '../architecture/data_flow.md',
  'PRD.md': '../architecture/product_vision.md',
  'VISION.md': '../architecture/product_vision.md',
  'WORKSPACE_CORE.md': '../architecture/workspace_architecture.md',
  'WORKSPACE_SPEC.md': '../architecture/workspace_architecture.md',
  'STORAGE_ARCHITECTURE.md': '../architecture/storage_architecture.md',
  'STORAGE_ABSTRACTION.md': '../architecture/storage_architecture.md',
  'WORKSPACE_LIFECYCLE.md': '../architecture/lifecycle_management.md',
  'REPO_LIFECYCLE.md': '../architecture/lifecycle_management.md',
  'GRAPH_SPEC.md': '../specifications/graph_spec.md',
  'MEMORY_SPEC.md': '../specifications/memory_spec.md',
  'PROMPT_SPEC.md': '../specifications/prompt_spec.md',
  'UPDATE_SPEC.md': '../specifications/update_spec.md',
  'FILE_FORMATS.md': '../specifications/file_formats.md',
  'CODING_STANDARDS.md': '../development/coding_standards.md',
  'TESTING_PLAN.md': '../development/testing_plan.md',
  'ENGINEERING_BLUEPRINT.md': '../development/engineering_blueprint.md',
  'IMPLEMENTATION_PLAN.md': '../development/engineering_blueprint.md',
  'RULES.md': '../development/ai_agent_rules.md',
  'AI_RULES.md': '../development/ai_agent_rules.md',
  'AI_WORKFLOW.md': '../development/ai_agent_rules.md',
  'MIGRATION_GUIDE.md': '../guides/migration_guide.md',
  'WORKSPACE_API_SPEC.md': '../generated/api_reference.md',
  'WORKSPACE_SERVICES.md': '../generated/services_reference.md',
  'WORKSPACE_EVENTS.md': '../generated/events_catalog.md',
  'WORKSPACE_ERRORS.md': '../generated/errors_catalog.md',
  'CLI_DESIGN.md': '../generated/cli_reference.md',
  'MODULES.md': '../generated/module_map.md'
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [oldName, newLink] of Object.entries(linkMap)) {
        // Find markdown links like [Text](OLD_NAME)
        // Note: this regex ensures we only catch relative local links to these files
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
}

processDir(docsDir);
console.log('Link updates complete.');
