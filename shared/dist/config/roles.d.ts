declare const ROLES: {
    readonly ADMIN: "admin";
    readonly MANAGER: "manager";
    readonly IC: "ic";
};
type RoleValues = typeof ROLES[keyof typeof ROLES];
declare const ALL_ROLES: RoleValues[];
export { ROLES, ALL_ROLES, type RoleValues };
//# sourceMappingURL=roles.d.ts.map