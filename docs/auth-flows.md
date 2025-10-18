# Auth flows and security features

The Monynha SPA and Payload CMS expose secure authentication flows that should be
followed in every environment.

## Password reset

1. From `/auth`, select **Esqueceu sua senha?** and inform the Supabase email.
2. Supabase sends a recovery link that redirects back to `/auth` with a
   temporary session (`type=recovery`).
3. The SPA exchanges the recovery token, switches to the **Defina uma nova
   senha** form, and requires the user to set and confirm a password.
4. After confirmation the user is redirected to the dashboard with the new
   session.

## Multi-factor authentication (MFA)

1. Logged-in users open the **Segurança da conta** card on the dashboard.
2. Selecting **Configurar MFA** enrols a TOTP factor and displays a QR code plus
   the plain secret.
3. The user scans the QR code (or copies the secret) in the authenticator app
   and confirms the 6-digit code.
4. Every subsequent login requires the authenticator code when Supabase flags
   the session as `mfa_required`.
5. Administrators can remove authenticators from the same card if needed.

## Payload provisioning for admins

* Supabase triggers the `sync_payload_admin` function whenever
  `public.profiles.role` changes.
* The trigger calls the CMS webhook with `action: promote|demote` and the
  profile payload.
* The CMS creates, updates, or removes the matching Payload user. Password
  reset emails are dispatched automatically when a new admin is provisioned.

## Configuration checklist

* Set `SUPABASE_ADMIN_SYNC_SECRET` in the CMS environment and update the
  `public.payload_admin_sync_settings` table with the webhook URL and secret.
* Expose the same secret as the `x-admin-sync-secret` header in your Supabase
  trigger configuration.
* Ensure the SPA runs with the new build so users can access the recovery and
  MFA forms.
