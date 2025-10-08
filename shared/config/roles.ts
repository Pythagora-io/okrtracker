const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  IC: 'ic'
} as const;

type RoleValues = typeof ROLES[keyof typeof ROLES];

const ALL_ROLES: RoleValues[] = Object.values(ROLES);

export {
  ROLES,
  ALL_ROLES,
  type RoleValues
};