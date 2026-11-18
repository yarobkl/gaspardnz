# GaspardNZ notifications on Cloudflare Workers

Cloudflare Workers is an alternative execution host for the **notification
routes only**. The admin, public articles, Apple native client, Supabase data
model and existing Vercel routes stay unchanged until cutover is verified.

## Required existing Supabase tables

`admin_access`, `notification_campaigns`, `notification_deliveries`,
`news_posts`, `push_subscriptions`, `notification_test_pairings`, and
`notification_test_devices`. No database migration is performed.

## Configuration

Connect the existing `yarobkl/gaspardnz` repository and choose branch
`feature/gnz-cloudflare-notifications`, root directory
`cloudflare/notifications`, deploy command `npx wrangler deploy`.
Deploy `wrangler.toml` in the authorized GaspardNZ Cloudflare account.
Configure these **Worker secrets** through Cloudflare's
Secrets UI, never via committed `.env` files:

- `SUPABASE_SERVICE_ROLE_KEY` — existing GaspardNZ Supabase key
- `APNS_PRIVATE_KEY` — existing APNs **auth** `.p8` (not signing `.p12`)
- `APNS_KEY_ID` — matching Apple APNs Key ID
- `APNS_ISSUER_ID` — Apple Team ID (`APPLE_TEAM_ID` also accepted)

The non-secret `SUPABASE_URL`, `APNS_BUNDLE_ID`, and `APNS_ENVIRONMENT` are
declared in `wrangler.toml`. Never expose private secrets through `vars`.

The initial Cloudflare repository wizard may select `main`; switch the
Worker's **Settings → Builds → Production branch** to
`feature/gnz-cloudflare-notifications` before deploying. A build of `main`
will fail because this Worker lives only on the dedicated branch.

After deploying, verify the Worker responds to `/health` and only then
configure Cloudflare Workers routes on the Cloudflare-proxied
`gaspardnz.style` zone:

- `gaspardnz.style/api/notifications/*`
- `gaspardnz.style/api/admin-notifications`

Those paths preserve the URLs already used by the site, iOS app and admin;
unrelated Vercel routes remain untouched. **Do not change DNS proxy or routes
without checking the current zone and testing a staging hostname first.**

Test on a registered iPhone: subscribe, create pairing code, pair, send an
APNs test, publish a direct-link notification (TikTok), verify both the deep
link and the permanent Actualités article; repeat with an article-only push.
Then test editor auto-push, idempotency and access denied for non-admins.

If the `gaspardnz.style` DNS zone is not managed by Cloudflare, do **not**
change DNS merely to install the Worker. Use the Worker-specific HTTPS
`*.workers.dev` URL and configure `VITE_GNZ_NOTIFICATION_API_ORIGIN`
on the next website/iOS build. The old Vercel notification endpoints should
remain active until the new build and APNs test both succeed.

The free Workers plan currently caps requests, CPU time and outbound
subrequests; publish in batches of eight, not as one long request. The current
implementation keeps delivery rows for retry/deduplication and prevents
automatic sending of drafts. Production cutover remains reversible by
removing only the two Worker route bindings.
