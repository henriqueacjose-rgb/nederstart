-- NederStart Migration 007: Subscriptions (schema prepared, Stripe not connected)

CREATE TABLE plans (
  id          SERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly  TEXT,
  price_monthly_eur DECIMAL(10,2),
  price_yearly_eur  DECIMAL(10,2),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id                  SERIAL PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id             INT NOT NULL REFERENCES plans(id),
  stripe_subscription_id TEXT,
  stripe_customer_id  TEXT,
  status              TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end  TIMESTAMPTZ,
  cancel_at           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
