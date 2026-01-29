-- naWfside core schema

-- membership_tiers: Defines the tiered system
CREATE TABLE IF NOT EXISTS membership_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'producer' or 'artist'
  publishing_stake INTEGER NOT NULL, -- Platform % (0-100)
  training_cost_credits INTEGER,
  generation_cost_credits DECIMAL,
  features JSONB
);

-- profiles: User metadata
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  user_type TEXT NOT NULL, -- 'producer' or 'artist'
  tier_id TEXT REFERENCES membership_tiers,
  stripe_connect_id TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- credits_ledger: Credit tracking
CREATE TABLE IF NOT EXISTS credits_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles,
  amount DECIMAL NOT NULL,
  transaction_type TEXT, -- 'purchase', 'training', 'generation'
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Producer trained sound models (trained on producer stems)
CREATE TABLE IF NOT EXISTS lora_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID REFERENCES profiles,
  model_name TEXT NOT NULL,
  safetensors_url TEXT NOT NULL,
  status TEXT DEFAULT 'training', -- 'training', 'ready', 'failed'
  training_job_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- generations: Artist generation history
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES profiles,
  producer_id UUID REFERENCES profiles,
  lora_model_id UUID REFERENCES lora_models,
  prompt TEXT NOT NULL,
  audio_url TEXT,
  isrc_code TEXT,
  publishing_split JSONB,
  credits_used DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

