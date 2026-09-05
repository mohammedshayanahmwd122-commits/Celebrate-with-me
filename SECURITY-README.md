# Celebrate-with-me — Security Package

This package contains the client-side security layer and CI checks for the
Celebrate-with-me / CelebrationVerse static web app.

## Included

- `security/client-security.js`
  - input length limits
  - control-character cleanup
  - celebration JSON validation
  - media type/size validation
  - protocol validation
  - lightweight client-side abuse throttling
  - safer localStorage wrappers

- `.github/workflows/security-checks.yml`
  - obvious-secret scanning
  - insecure HTTP script-source detection
  - security-module validation
  - basic CSP/HTML checks

## Important limitation

The current application is primarily a static client-side app. Client-side
security can be bypassed by a modified browser or direct requests.

For real accounts, add a backend with:

1. Argon2id or another modern password hashing scheme.
2. Server-side login rate limiting and progressive throttling.
3. MFA support.
4. Secure, HttpOnly, SameSite cookies for sessions.
5. Session rotation/revocation.
6. Server-side authorization on every protected operation.
7. CSRF protection where cookie authentication is used.
8. Strict schema validation and output encoding.
9. Audit/security-event logging.
10. Centralized monitoring and alerting.
11. Secret storage outside source code.
12. A WAF/CDN layer and security headers at the deployment layer.

Do not treat browser-side bot detection as proof that a visitor is human.
Use risk scoring and progressive verification instead of relying on a single
"AI detector".

This package improves defense-in-depth; it does not make the application
"unhackable".
