import { NextResponse, type NextRequest } from 'next/server';
import { isProtectedPath } from '@/config/routes';
import { buildContentSecurityPolicy } from '@/config/csp';

const hasSession = (request: NextRequest): boolean => {
  const signal = request.cookies.get('session_active')?.value;
  return signal === '1' || signal === 'true';
};

const addResponseCsp = (response: NextResponse, csp: string) => {
  response.headers.set('Content-Security-Policy', csp);
  return response;
};

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildContentSecurityPolicy(nonce);
  const { pathname, search } = request.nextUrl;
  const loggedIn = hasSession(request);

  if (isProtectedPath(pathname) && !loggedIn) {
    const acceptsHtml = request.headers.get('accept')?.includes('text/html') ?? false;
    const isNavigation = request.headers.get('sec-fetch-mode') === 'navigate';

    if (acceptsHtml || isNavigation) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', `${pathname}${search}`);
      return addResponseCsp(NextResponse.redirect(loginUrl), csp);
    }

    return addResponseCsp(
      NextResponse.json(
        { message: 'Unauthorized', code: 'NOT_AUTHENTICATED' },
        { status: 401 }
      ),
      csp
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  return addResponseCsp(response, csp);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
