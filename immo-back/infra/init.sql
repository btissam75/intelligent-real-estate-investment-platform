CREATE SCHEMA IF NOT EXISTS immo;

CREATE TABLE IF NOT EXISTS immo.userx(
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS immo.wallet(
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES immo.userx(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS immo.wallet_address(
  id SERIAL PRIMARY KEY,
  wallet_id INT NOT NULL REFERENCES immo.wallet(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('EOA','SMART','VAULT')),
  chain_id INT NOT NULL,
  address TEXT NOT NULL,
  label TEXT,
  UNIQUE(chain_id,address)
);

CREATE TABLE IF NOT EXISTS immo.wallet_settings(
  wallet_id INT PRIMARY KEY REFERENCES immo.wallet(id) ON DELETE CASCADE,
  ref_currency TEXT DEFAULT 'EUR',
  main_address_id INT REFERENCES immo.wallet_address(id),
  active_vault_id INT REFERENCES immo.wallet_address(id)
);

CREATE TABLE IF NOT EXISTS immo.asset(
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  symbol TEXT,
  decimals INT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('NATIVE','ERC20','INTERNAL')),
  chain_id INT,
  contract_address TEXT,
  UNIQUE(code, COALESCE(chain_id,0), COALESCE(contract_address,''))
);

CREATE TABLE IF NOT EXISTS immo.wallet_asset(
  id SERIAL PRIMARY KEY,
  wallet_id INT NOT NULL REFERENCES immo.wallet(id) ON DELETE CASCADE,
  asset_id INT NOT NULL REFERENCES immo.asset(id),
  figure NUMERIC(78,0) NOT NULL DEFAULT 0,
  virtual NUMERIC(78,0) NOT NULL DEFAULT 0,
  UNIQUE(wallet_id, asset_id)
);

CREATE TABLE IF NOT EXISTS immo.tx(
  id BIGSERIAL PRIMARY KEY,
  wallet_id INT REFERENCES immo.wallet(id),
  kind TEXT NOT NULL,
  ref TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS immo.op(
  id BIGSERIAL PRIMARY KEY,
  tx_id BIGINT NOT NULL REFERENCES immo.tx(id) ON DELETE CASCADE,
  wallet_id INT REFERENCES immo.wallet(id),
  asset_id INT NOT NULL REFERENCES immo.asset(id),
  amount NUMERIC(78,0) NOT NULL,
  memo TEXT
);

CREATE OR REPLACE FUNCTION immo.enforce_balanced() RETURNS trigger AS $$
DECLARE s NUMERIC(78,0);
BEGIN
  SELECT COALESCE(SUM(amount),0) INTO s FROM immo.op WHERE tx_id = NEW.tx_id;
  IF s <> 0 THEN RAISE EXCEPTION 'Transaction % non équilibrée', NEW.tx_id; END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_balanced ON immo.op;
CREATE CONSTRAINT TRIGGER trg_balanced
AFTER INSERT OR UPDATE ON immo.op
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION immo.enforce_balanced();

-- ===== Seeds =====
INSERT INTO immo.userx(email) VALUES ('alice@example.com') ON CONFLICT DO NOTHING;
INSERT INTO immo.wallet(user_id)
SELECT id FROM immo.userx WHERE email='alice@example.com' ON CONFLICT DO NOTHING;

INSERT INTO immo.asset(code,symbol,decimals,kind,chain_id,contract_address) VALUES
 ('ETH','ETH',18,'NATIVE',11155111,NULL),
 ('USDC','USDC',6,'ERC20',11155111,'0x0000000000000000000000000000000000000000'),
 ('POINTS','PTS',0,'INTERNAL',NULL,NULL)
ON CONFLICT DO NOTHING;

INSERT INTO immo.wallet_asset(wallet_id,asset_id)
SELECT w.id, a.id FROM immo.wallet w
JOIN immo.userx u ON u.id=w.user_id AND u.email='alice@example.com'
JOIN immo.asset a ON a.code IN ('ETH','USDC','POINTS')
ON CONFLICT DO NOTHING;

WITH w AS (SELECT id FROM immo.wallet LIMIT 1)
INSERT INTO immo.wallet_address(wallet_id,kind,chain_id,address,label) VALUES
 ((SELECT id FROM w),'EOA',11155111,'0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','Eepm  2623'),
 ((SELECT id FROM w),'VAULT',11155111,'0xcccccccccccccccccccccccccccccccccccccccc','CvVAULT…, 133')
ON CONFLICT DO NOTHING;

INSERT INTO immo.wallet_settings(wallet_id,ref_currency,main_address_id,active_vault_id)
SELECT w.id, 'EUR',
 (SELECT id FROM immo.wallet_address WHERE kind='EOA'   AND wallet_id=w.id LIMIT 1),
 (SELECT id FROM immo.wallet_address WHERE kind='VAULT' AND wallet_id=w.id LIMIT 1)
FROM immo.wallet w
ON CONFLICT (wallet_id) DO NOTHING;
