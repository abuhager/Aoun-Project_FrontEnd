import "server-only";

import type { DemoAccount } from "@/app/(auth)/login/demoAccount";

interface DemoAccountDefinition {
  id: DemoAccount["id"];
  label: string;
  icon: string;
  emailEnv: string;
  passwordEnv: string;
  buttonClassName: string;
}

const definitions: readonly DemoAccountDefinition[] = [
  {
    id: "admin",
    label: "مسؤول",
    icon: "🛡️",
    emailEnv: "DEMO_ADMIN_EMAIL",
    passwordEnv: "DEMO_ADMIN_PASSWORD",
    buttonClassName: "bg-primary/10 text-primary hover:bg-primary/20",
  },
  {
    id: "donor",
    label: "متبرع",
    icon: "🎁",
    emailEnv: "DEMO_DONOR_EMAIL",
    passwordEnv: "DEMO_DONOR_PASSWORD",
    buttonClassName: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
  {
    id: "student",
    label: "طالب",
    icon: "🎓",
    emailEnv: "DEMO_STUDENT_EMAIL",
    passwordEnv: "DEMO_STUDENT_PASSWORD",
    buttonClassName: "bg-sky-50 text-sky-700 hover:bg-sky-100",
  },
];

const readOptional = (name: string) => process.env[name]?.trim() ?? "";

export function getDemoAccounts(): readonly DemoAccount[] {
  if (process.env.DEMO_LOGIN_ENABLED !== "true") {
    return [];
  }

  const accounts = definitions.flatMap((definition) => {
    const email = readOptional(definition.emailEnv);
    const password = readOptional(definition.passwordEnv);

    if (!email && !password) {
      return [];
    }

    if (!email || !password) {
      throw new Error(
        `Demo account ${definition.id} requires both ${definition.emailEnv} and ${definition.passwordEnv}.`
      );
    }

    return [{
      id: definition.id,
      label: definition.label,
      icon: definition.icon,
      email,
      password,
      buttonClassName: definition.buttonClassName,
    }];
  });

  if (accounts.length === 0) {
    throw new Error(
      "DEMO_LOGIN_ENABLED is true, but no complete demo account is configured."
    );
  }

  return accounts;
}
