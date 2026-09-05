# Security Policy

## Scope

CelebrationVerse is currently a client-side/static web application. Browser code cannot provide trustworthy server-side authentication, authorization, brute-force protection, or account security by itself.

The repository therefore uses defense-in-depth controls for the client and CI, while documenting the controls that must exist if a backend is added.

## Current protections

- Client-side input length/type validation utilities in `security/client-security.js`.
- Media MIME allowlisting and size limits.
- Import size and JSON-shape validation.
- Protocol validation for user-controlled media URLs.
- Lightweight client-side throttling for sensitive UI operations.
- Safe wrappers for localStorage reads/writes.
- Automated repository security checks in GitHub Actions.

## If authentication/backend services are added

Do not implement authentication only in browser JavaScript. The backend should provide, at minimum:

- Argon2id or another modern password-hashing scheme with appropriate parameters.
- Server-side login, password-reset, and OTP rate limits.
- MFA support for accounts that need stronger protection.
- Secure, HttpOnly, SameSite cookies for cookie-based sessions.
- Session expiration, revocation, and refresh-token rotation where applicable.
- Server-side authorization on every protected operation, including object-level checks.
- Strict input validation and parameterized database queries.
- CSRF protection for cookie-authenticated state-changing requests.
- Strict CORS and security headers.
- Audit logging without passwords, tokens, OTPs, or other secrets.
- Abuse/risk scoring based on behavior rather than claiming to identify AI with certainty.
- Secret management outside the client bundle and source repository.

## Reporting

Please report suspected vulnerabilities privately to the repository owner rather than publishing exploit details in an issue. Do not include passwords, authentication tokens, payment information, or other sensitive personal data in a report.

## Security expectation

No web application can honestly be guaranteed to be “unhackable.” Security is an ongoing process of layered controls, monitoring, dependency updates, testing, and safe deployment configuration.
