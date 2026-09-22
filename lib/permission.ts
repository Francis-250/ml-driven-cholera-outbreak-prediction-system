import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  communityProfile: ["view", "update", "delete", "create"],
  patientProfile: ["view", "update", "delete", "create"],
  diseaseRecord: ["view", "update", "delete", "create"],
  environmentalData: ["view", "update", "delete", "create"],
} as const;

export const ac = createAccessControl(statement);

export const staff = ac.newRole({
  communityProfile: ["view"],
  patientProfile: ["view"],
  diseaseRecord: ["view", "update", "create"],
  environmentalData: ["view", "create", "update"],
});

// Legacy aliases mapping to staff for backward-compatibility
export const doctor = staff;
export const community = staff;
export const patient = staff;

export const admin = ac.newRole({
  communityProfile: ["view", "update", "delete", "create"],
  patientProfile: ["view", "update", "delete", "create"],
  diseaseRecord: ["view", "update", "delete", "create"],
  environmentalData: ["view", "update", "delete", "create"],
  ...adminAc.statements,
});
