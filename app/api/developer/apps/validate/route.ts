import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/rbac';

interface AppManifest {
  id: string;
  name: string;
  version: string;
  scopes: string[];
  permissions: string[];
  taskTypes: { code: string; label: string }[];
  routes?: {
    dashboardPanel?: string;
    settings?: string;
  };
  serverHooksModule?: string;
  clientModule?: string;
}

function validateManifest(manifest: any): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!manifest.id || typeof manifest.id !== 'string') {
    errors.push('id is required and must be a string');
  } else if (!/^[a-z0-9-]+$/.test(manifest.id)) {
    errors.push('id must contain only lowercase letters, numbers, and hyphens');
  }

  if (!manifest.name || typeof manifest.name !== 'string') {
    errors.push('name is required and must be a string');
  }

  if (!manifest.version || typeof manifest.version !== 'string') {
    errors.push('version is required and must be a string');
  } else if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    warnings.push('version should follow semver format (e.g., 1.0.0)');
  }

  if (!Array.isArray(manifest.scopes)) {
    errors.push('scopes must be an array');
  } else if (manifest.scopes.length === 0) {
    errors.push('at least one scope is required');
  } else {
    const validScopes = ['org', 'user'];
    manifest.scopes.forEach((scope: string) => {
      if (!validScopes.includes(scope)) {
        errors.push(`invalid scope: ${scope}. Valid scopes: ${validScopes.join(', ')}`);
      }
    });
  }

  if (!Array.isArray(manifest.permissions)) {
    errors.push('permissions must be an array');
  } else if (manifest.permissions.length === 0) {
    errors.push('at least one permission is required');
  } else {
    const validPermissions = [
      'credits:spend',
      'credits:view',
      'assets:read',
      'assets:write',
      'org:read',
      'user:read',
    ];
    manifest.permissions.forEach((perm: string) => {
      if (!validPermissions.includes(perm)) {
        warnings.push(`non-standard permission: ${perm}`);
      }
    });
  }

  if (!Array.isArray(manifest.taskTypes)) {
    errors.push('taskTypes must be an array');
  } else if (manifest.taskTypes.length === 0) {
    errors.push('at least one taskType is required for chargeable apps');
  } else {
    manifest.taskTypes.forEach((task: any, index: number) => {
      if (!task.code || typeof task.code !== 'string') {
        errors.push(`taskTypes[${index}].code is required and must be a string`);
      } else if (!/^[A-Z_]+$/.test(task.code)) {
        warnings.push(`taskTypes[${index}].code should be UPPER_SNAKE_CASE`);
      }
      if (!task.label || typeof task.label !== 'string') {
        errors.push(`taskTypes[${index}].label is required and must be a string`);
      }
    });
  }

  if (manifest.routes) {
    if (manifest.routes.dashboardPanel && typeof manifest.routes.dashboardPanel !== 'string') {
      errors.push('routes.dashboardPanel must be a string');
    }
    if (manifest.routes.settings && typeof manifest.routes.settings !== 'string') {
      errors.push('routes.settings must be a string');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission('developer:publish');

    const body = await req.json();
    const { manifest } = body;

    if (!manifest) {
      return NextResponse.json({ error: 'manifest is required' }, { status: 400 });
    }

    const validation = validateManifest(manifest);

    return NextResponse.json({
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
      manifest,
    });
  } catch (error: any) {
    console.error('Manifest validation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
