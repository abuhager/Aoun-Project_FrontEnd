export const featureFlags = Object.freeze({
  demoLogin: process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED !== 'false',
  phoneVerification:
    process.env.NEXT_PUBLIC_PHONE_VERIFICATION_ENABLED === 'true',
});
