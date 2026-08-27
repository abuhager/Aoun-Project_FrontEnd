export const featureFlags = Object.freeze({
  phoneVerification:
    process.env.NEXT_PUBLIC_PHONE_VERIFICATION_ENABLED === 'true',
});
