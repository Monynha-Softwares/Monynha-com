# Authentication and Security Flows

This document describes the end-user and administrator-facing authentication flows now available in the Monynha stack.

## Password reset lifecycle

1. On the `/auth` screen, choose **"Esqueci minha senha"** under the login form.
2. Supply the email address associated with the account. Supabase will send a password reset email that points back to `/auth?type=recovery`.
3. Follow the emailed link. After Supabase validates the token, the application shows the **"Salvar nova senha"** form.
4. Enter and confirm the new password (minimum of 6 characters). After saving:
   - The password is updated via `supabase.auth.updateUser`.
   - The user is redirected to the dashboard automatically with a fresh session.

> **Note:** The reset entry point is also available from the dashboard security card via the same email flow.

## Two-factor authentication (TOTP)

The dashboard now exposes a **Segurança da conta** card that allows any authenticated user to manage TOTP-based MFA:

- **Enable:** Click **"Ativar autenticação em duas etapas"** to enroll. A QR code and recovery secret are displayed. Scan the code with an authenticator app and confirm the 6-digit code to finish enrollment.
- **Disable:** Use **"Desativar autenticação em duas etapas"** to remove the verified factor. This action requires the current session to meet `aal2` (verified) level.
- **Cancel enrollment:** If enrollment is started but not confirmed, the setup can be cancelled to discard the pending factor.

The Supabase client APIs used:

- `supabase.auth.mfa.enroll({ factorType: 'totp' })`
- `supabase.auth.mfa.challenge` + `supabase.auth.mfa.verify`
- `supabase.auth.mfa.unenroll`
- `supabase.auth.mfa.challengeAndVerify` (for on-demand step-up verification)

## Admin data step-up requirement

Administrators who have a verified TOTP factor must enter a fresh authenticator code before the dashboard loads sensitive tables (`leads`, `newsletter_subscribers`). The UI presents a dedicated **Confirmação de duas etapas** card whenever the current authenticator assurance level is below `aal2`. Once validated, the data loads through the `get_admin_dashboard_data` RPC and the session is promoted to `aal2`.

## Payload CMS admin provisioning

A new Supabase trigger calls the edge function `payload-admin-sync` whenever `public.profiles.role` transitions to or from `admin`. The function provisions (or removes) the corresponding Payload CMS user and keeps the `payload_user_id` column synced.

To configure the integration:

1. Create a row in `public.payload_admin_sync_config` with the deployed function URL and a shared secret:
   ```sql
   insert into public.payload_admin_sync_config (id, webhook_url, webhook_secret)
   values (
     1,
     'https://<project>.functions.supabase.co/payload-admin-sync',
     '<shared-secret>'
   )
   on conflict (id) do update set webhook_url = excluded.webhook_url, webhook_secret = excluded.webhook_secret;
   ```
2. Configure the edge function environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PAYLOAD_API_BASE_URL`
   - `PAYLOAD_ADMIN_TOKEN`
   - `PAYLOAD_SYNC_SHARED_SECRET`
3. Deploy the function with `supabase functions deploy payload-admin-sync`.

The function automatically triggers a Payload password-reset email whenever a new admin is provisioned.

## Admin dashboard RPC

The dashboard now retrieves restricted data via the `get_admin_dashboard_data` RPC. The function enforces the `role = 'admin'` check server-side and returns the `leads` and `newsletter_subscribers` collections in a single round-trip. Access is granted to authenticated and service roles only.
