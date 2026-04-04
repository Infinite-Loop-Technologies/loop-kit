import { FatalError, sleep } from "workflow";

type DemoUser = {
  id: string;
  email: string;
  createdAt: string;
};

export async function demoSignupWorkflow(email: string) {
  "use workflow";

  const user = await createDemoUser(email);
  await queueWelcomeEmail(user);
  await sleep("3s");
  await queueOnboardingFollowup(user);

  return {
    status: "onboarded",
    userId: user.id,
  };
}

async function createDemoUser(email: string): Promise<DemoUser> {
  "use step";

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.includes("@")) {
    throw new FatalError("Invalid email address");
  }

  console.log(`[workflow] creating demo user for ${normalizedEmail}`);

  return {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
  };
}

async function queueWelcomeEmail(user: DemoUser) {
  "use step";

  console.log(`[workflow] queueing welcome email for ${user.email}`);
}

async function queueOnboardingFollowup(user: DemoUser) {
  "use step";

  console.log(`[workflow] queueing onboarding follow-up for ${user.email}`);
}
