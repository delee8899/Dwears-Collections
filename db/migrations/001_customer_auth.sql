CREATE TABLE customer_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(254) NOT NULL,
  password_hash varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  disabled_at timestamptz NULL,
  CONSTRAINT customer_accounts_email_lowercase CHECK (email = lower(email)),
  CONSTRAINT customer_accounts_email_not_empty CHECK (length(email) > 0)
);
CREATE UNIQUE INDEX customer_accounts_email_unique ON customer_accounts (email);

CREATE TABLE customer_auth_sessions (
  id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  last_used_at timestamptz NOT NULL DEFAULT NOW(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz NULL,
  CONSTRAINT customer_auth_sessions_expiry_after_creation CHECK (expires_at > created_at)
);
CREATE INDEX customer_auth_sessions_customer_id_idx ON customer_auth_sessions (customer_id);
CREATE INDEX customer_auth_sessions_active_expiry_idx ON customer_auth_sessions (expires_at) WHERE revoked_at IS NULL;

CREATE TABLE customer_refresh_tokens (
  token_hash char(64) PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES customer_auth_sessions(id) ON DELETE CASCADE,
  issued_at timestamptz NOT NULL DEFAULT NOW(),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz NULL,
  CONSTRAINT customer_refresh_tokens_hash_format CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT customer_refresh_tokens_expiry_after_issue CHECK (expires_at > issued_at)
);
CREATE INDEX customer_refresh_tokens_session_idx ON customer_refresh_tokens (session_id);
