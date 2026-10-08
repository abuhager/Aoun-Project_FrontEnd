# Admin and support UI

Requires the paired backend admin-support-demo change and its documented index migration.

- Admin settings: enable/disable donation requests. The navbar reflects public settings updates, and the donation-request route group shows an unavailable state when disabled.
- Admin items: booking account/date plus an expandable ordered waitlist with account links and contact actions.
- Admin users and report review: account links and private administrative contact.
- `/support`: create/reopen the user's private support conversation and view its status.
- `/admin/support`: paginated inbox, claim, chat, and resolve. Personal `/support` reads only the signed-in user's tickets; the administrative inbox uses `/api/support/inbox`. Ticket metadata refreshes every 15 seconds; messages use the existing Socket.IO channel.
- Admin demo: visible read-only banner. Contact and support actions explain the real action without creating records; other write attempts receive the backend's explicit DEMO_READ_ONLY message. Forms remain inspectable.

Backend identity returns `isDemo`. Configure backend DEMO_ADMIN_EMAIL to match the frontend demo login; frontend demo configuration alone cannot secure the account.

## Verification

`npm run verify` passes: ESLint, TypeScript, and all 126 frontend tests. Production build also passes.

The pre-existing security test failure around JSON-LD was resolved by consolidating its rendering in one reviewed component. The serializer is exercised with closing-script and HTML payloads; unsafe sinks remain forbidden everywhere else.

Browser end-to-end/visual verification was not completed in this environment: no browser binary was installed, and the Chromium download failed. Staging should verify mobile/desktop layout, RTL, dialogs, real-time replies, and all role transitions before release.
