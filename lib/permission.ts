import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  staffProfile: ["view", "update", "delete", "create"],
  diseaseRecord: ["view", "update", "delete", "create"],
  environmentalData: ["view", "update", "delete", "create"],
} as const;

export const ac = createAccessControl(statement);

export const staff = ac.newRole({
  staffProfile: ["view", "update"],
  diseaseRecord: ["view", "update", "create"],
  environmentalData: ["view", "create", "update"],
});

export const admin = ac.newRole({
  staffProfile: ["view", "update", "delete", "create"],
  diseaseRecord: ["view", "update", "delete", "create"],
  environmentalData: ["view", "update", "delete", "create"],
  ...adminAc.statements,
});
