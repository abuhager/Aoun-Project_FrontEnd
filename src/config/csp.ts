const getPublicApiSources = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!configuredUrl) return [];
  try {
    const apiUrl = new URL(configuredUrl);
    const socketProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    return [apiUrl.origin, `${socketProtocol}//${apiUrl.host}`];
  } catch {
    return [];
  }
};

export const buildContentSecurityPolicy = (nonce: string) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ''} https://www.gstatic.com https://www.recaptcha.net https://recaptchaenterprise.googleapis.com https://www.google.com`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "img-src 'self' blob: data: https://res.cloudinary.com https://*.googleusercontent.com",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' ${getPublicApiSources().join(' ')} https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://recaptchaenterprise.googleapis.com https://www.recaptcha.net https://www.google.com https://*.firebase.com https://*.firebaseio.com`,
    "frame-src https://www.recaptcha.net https://recaptchaenterprise.googleapis.com https://www.google.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
  ].join('; ').replace(/\s{2,}/g, ' ').trim();
};
