import { describe, it, expect } from 'vitest';
import { UIComponentMappingSource } from '../../../../src/knowledge/features/mapping/sources/UIComponentMappingSource';
import { CommandMappingSource } from '../../../../src/knowledge/features/mapping/sources/CommandMappingSource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { MappingContext } from '../../../../src/knowledge/features/mapping/interfaces/IFeatureMappingSource';

describe('Feature-to-Code Mapping: UIComponentMappingSource & CommandMappingSource', () => {
  it('should map UI components to feature with UI role', () => {
    const uiSource = new UIComponentMappingSource();
    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });

    const context: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      uiComponents: [
        {
          componentId: 'comp_login_form',
          name: 'LoginForm',
          filePath: 'src/components/auth/LoginForm.tsx',
          props: ['onSubmit', 'isLoading'],
        },
        {
          componentId: 'comp_billing_card',
          name: 'BillingCard',
          filePath: 'src/components/billing/BillingCard.tsx',
        },
      ],
    };

    const candidates = uiSource.mapFeature(authFeature, context);

    expect(candidates).toHaveLength(1);
    const loginFormCand = candidates[0]!;
    expect(loginFormCand.resourceId).toBe('comp_login_form');
    expect(loginFormCand.resourceType).toBe('UI_COMPONENT');
    expect(loginFormCand.proposedRole).toBe('UI');
    expect(loginFormCand.evidence[0]!.evidenceType).toBe('UI_PRESENTATION_LAYER');
  });

  it('should map commands to feature with COMMAND role', () => {
    const cmdSource = new CommandMappingSource();
    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });

    const context: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      commands: [
        {
          commandId: 'cmd_auth_login',
          name: 'auth:login',
          signature: 'login [options]',
          filePath: 'src/cli/commands/auth.ts',
        },
        {
          commandId: 'cmd_db_migrate',
          name: 'db:migrate',
          signature: 'migrate [up|down]',
          filePath: 'src/cli/commands/db.ts',
        },
      ],
    };

    const candidates = cmdSource.mapFeature(authFeature, context);

    expect(candidates).toHaveLength(1);
    const cmdCand = candidates[0]!;
    expect(cmdCand.resourceId).toBe('cmd_auth_login');
    expect(cmdCand.resourceType).toBe('COMMAND');
    expect(cmdCand.proposedRole).toBe('COMMAND');
    expect(cmdCand.evidence[0]!.evidenceType).toBe('CLI_OR_APP_COMMAND');
  });
});
