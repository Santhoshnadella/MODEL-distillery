export type WorkspaceRole = 'Owner' | 'Operator' | 'Reviewer';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: WorkspaceRole;
  organization: string;
  workspace: string;
};

export const demoUser: AuthUser = {
  id: '',
  email: '',
  name: '',
  role: 'Owner',
  organization: '',
  workspace: '',
};

export const workspaceOptions = [
  'New workspace',
];

export const roleOptions: WorkspaceRole[] = ['Owner', 'Operator', 'Reviewer'];
