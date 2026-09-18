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

export const community = ac.newRole({
  communityProfile: ["view", "update"],
  patientProfile: ["view", "update"],
  diseaseRecord: ["view", "create"],
  environmentalData: ["view"],
});

export const patient = community;

export const doctor = ac.newRole({
  communityProfile: ["view"],
  patientProfile: ["view"],
  diseaseRecord: ["view", "update", "create"],
  environmentalData: ["view", "create", "update"],
});

export const admin = ac.newRole({
  communityProfile: ["view", "update", "delete", "create"],
  patientProfile: ["view", "update", "delete", "create"],
  diseaseRecord: ["view", "update", "delete", "create"],
  environmentalData: ["view", "update", "delete", "create"],
  ...adminAc.statements,
});
