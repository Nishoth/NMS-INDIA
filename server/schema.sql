/* =========================================================
   0) DATABASE CREATION (run as postgres / db admin)
   ========================================================= */

-- Note: We are ignoring the DATABASE CREATION lines inside the script and will run them explicitly outside because we already have the target jls_db.
-- Create DB code is skipped inside this file, it will be executed on the DB directly.

/* =========================================================
   1) EXTENSIONS + SCHEMA
   ========================================================= */

-- UUID generator
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Optional: case-insensitive text
CREATE EXTENSION IF NOT EXISTS citext;

-- Put everything in a dedicated schema
CREATE SCHEMA IF NOT EXISTS app;
SET search_path TO app, public;

/* =========================================================
   2) ENUMS (strong typing for core state)
   ========================================================= */

DO $$ BEGIN
  CREATE TYPE app.user_role AS ENUM ('super_admin','case_manager','advocate','staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app.user_status AS ENUM ('active','locked','disabled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app.actor_type AS ENUM ('internal','victim','system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app.party_type AS ENUM ('applicant','co_applicant','guarantor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app.notice_status AS ENUM ('draft','sent','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app.delivery_channel AS ENUM ('sms','whatsapp','email');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app.delivery_status AS ENUM ('queued','sent','delivered','read','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app.meeting_status AS ENUM ('scheduled','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app.meet_provider AS ENUM ('google_meet');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app.doc_source AS ENUM ('internal','victim');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app.doc_category AS ENUM ('ID_PROOF','LOAN_DOC','NOTICE','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app.import_status AS ENUM ('uploaded','validated','imported','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app.import_row_status AS ENUM ('success','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app.milestone_type AS ENUM (
    'FIRST_MEETING',
    'SECOND_MEETING',
    'THIRD_MEETING_EXPARTE',
    'EVIDENCE_ARGUMENT',
    'AWARD_DATE',
    'STAMP_PURCHASE_DATE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* =========================================================
   3) COMMON UTIL: updated_at trigger
   ========================================================= */

CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

/* =========================================================
   4) AUTH / USERS / RBAC
   ========================================================= */

CREATE TABLE IF NOT EXISTS app.users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     text UNIQUE,
  username        citext UNIQUE NOT NULL,
  email           citext UNIQUE NOT NULL,
  phone           text UNIQUE,
  password_hash   text NOT NULL,
  role            app.user_role NOT NULL,
  designation     text,
  department      text,
  status          app.user_status NOT NULL DEFAULT 'active',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  last_login_at   timestamptz
);

CREATE INDEX IF NOT EXISTS idx_users_email  ON app.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role   ON app.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON app.users(status);

DROP TRIGGER IF EXISTS trg_users_updated_at ON app.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON app.users
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- Optional RBAC tables (matches your PERMISSIONS + ROLE_PERMISSIONS approach)
CREATE TABLE IF NOT EXISTS app.permissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  description text
);

CREATE TABLE IF NOT EXISTS app.role_permissions (
  role_key        app.user_role NOT NULL,
  permission_key  text NOT NULL REFERENCES app.permissions(key) ON DELETE CASCADE,
  PRIMARY KEY (role_key, permission_key)
);

CREATE TABLE IF NOT EXISTS app.user_permissions (
  user_id        uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  permission_key text NOT NULL REFERENCES app.permissions(key) ON DELETE CASCADE,
  is_allowed     boolean NOT NULL DEFAULT true,
  PRIMARY KEY (user_id, permission_key)
);

/* =========================================================
   5) CASE CORE
   ========================================================= */

CREATE TABLE IF NOT EXISTS app.cases (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_code            text UNIQUE NOT NULL,              -- CASE-00001 etc
  ref_no               text,
  mode                 text,
  agreement_no         text,
  agreement_date       date,
  status               text NOT NULL DEFAULT 'NEW',
  assigned_advocate_id uuid REFERENCES app.users(id) ON DELETE SET NULL,
  created_by           uuid REFERENCES app.users(id) ON DELETE SET NULL,
  allocated_at         date,

  -- Amounts
  claim_amount         numeric(14,2),
  claim_date           date,
  amount_financed      numeric(14,2),
  finance_charge       numeric(14,2),
  agreement_value      numeric(14,2),
  award_amount         numeric(14,2),
  award_amount_words   text,

  -- Asset/Vehicle fields
  make                text,
  model               text,
  engine_no           text,
  chassis_no          text,
  reg_no              text,

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Uniqueness rules often used in imports
CREATE UNIQUE INDEX IF NOT EXISTS uq_cases_agreement_no ON app.cases(agreement_no) WHERE agreement_no IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cases_status ON app.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_advocate ON app.cases(assigned_advocate_id);
CREATE INDEX IF NOT EXISTS idx_cases_ref_no ON app.cases(ref_no);

DROP TRIGGER IF EXISTS trg_cases_updated_at ON app.cases;
CREATE TRIGGER trg_cases_updated_at
BEFORE UPDATE ON app.cases
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

/* =========================================================
   6) PARTIES (Applicant / Co-applicant / Guarantor)
   ========================================================= */

CREATE TABLE IF NOT EXISTS app.case_parties (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id      uuid NOT NULL REFERENCES app.cases(id) ON DELETE CASCADE,
  party_type   app.party_type NOT NULL,
  name         text NOT NULL,
  father_name  text,
  address      text,
  age          int,
  phone        text,
  email        citext,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_parties_case_id ON app.case_parties(case_id);
CREATE INDEX IF NOT EXISTS idx_case_parties_type ON app.case_parties(party_type);

DROP TRIGGER IF EXISTS trg_case_parties_updated_at ON app.case_parties;
CREATE TRIGGER trg_case_parties_updated_at
BEFORE UPDATE ON app.case_parties
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

/* =========================================================
   7) ARBITRATION DETAILS (one per case)
   ========================================================= */

CREATE TABLE IF NOT EXISTS app.case_arbitration (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id            uuid NOT NULL UNIQUE REFERENCES app.cases(id) ON DELETE CASCADE,
  institution_name   text,
  arbitrator_name    text,
  arbitrator_phone   text,
  arbitrator_email   citext,
  arbitrator_address text,
  acceptance_date    date,
  arb_case_no        text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_arbitration_case_id ON app.case_arbitration(case_id);

DROP TRIGGER IF EXISTS trg_case_arbitration_updated_at ON app.case_arbitration;
CREATE TRIGGER trg_case_arbitration_updated_at
BEFORE UPDATE ON app.case_arbitration
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

/* =========================================================
   8) MILESTONES / SCHEDULE (many per case)
   ========================================================= */

CREATE TABLE IF NOT EXISTS app.case_milestones (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         uuid NOT NULL REFERENCES app.cases(id) ON DELETE CASCADE,
  milestone_type  app.milestone_type NOT NULL,
  planned_date    date,
  actual_date     date,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_milestones_case_id ON app.case_milestones(case_id);
CREATE INDEX IF NOT EXISTS idx_case_milestones_type ON app.case_milestones(milestone_type);

DROP TRIGGER IF EXISTS trg_case_milestones_updated_at ON app.case_milestones;
CREATE TRIGGER trg_case_milestones_updated_at
BEFORE UPDATE ON app.case_milestones
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

/* =========================================================
   9) NOTICES + DELIVERIES + CASE RULE STATE (3 notices => close)
   ========================================================= */

CREATE TABLE IF NOT EXISTS app.notices (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id       uuid NOT NULL REFERENCES app.cases(id) ON DELETE CASCADE,
  notice_no     int  NOT NULL CHECK (notice_no BETWEEN 1 AND 3),
  notice_type   text,
  content       jsonb,                     -- store template payload / variables
  created_by    uuid REFERENCES app.users(id) ON DELETE SET NULL,
  status        app.notice_status NOT NULL DEFAULT 'draft',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- One notice per case per notice_no (avoid duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS uq_notices_case_no ON app.notices(case_id, notice_no);
CREATE INDEX IF NOT EXISTS idx_notices_case_id ON app.notices(case_id);
CREATE INDEX IF NOT EXISTS idx_notices_status ON app.notices(status);

CREATE TABLE IF NOT EXISTS app.notice_deliveries (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id             uuid NOT NULL REFERENCES app.notices(id) ON DELETE CASCADE,
  channel               app.delivery_channel NOT NULL,
  to_address            text NOT NULL,
  provider_message_id   text,
  status                app.delivery_status NOT NULL DEFAULT 'queued',
  sent_at               timestamptz,
  delivered_at          timestamptz,
  error_message         text
);

CREATE INDEX IF NOT EXISTS idx_notice_deliveries_notice_id ON app.notice_deliveries(notice_id);
CREATE INDEX IF NOT EXISTS idx_notice_deliveries_status ON app.notice_deliveries(status);

-- Rule state table: closure enabled after 3 notices
CREATE TABLE IF NOT EXISTS app.case_rules_state (
  case_id             uuid PRIMARY KEY REFERENCES app.cases(id) ON DELETE CASCADE,
  notice_count        int NOT NULL DEFAULT 0 CHECK (notice_count >= 0),
  closure_enabled     boolean NOT NULL DEFAULT false,
  closure_enabled_at  timestamptz
);

-- Helper: when a notice is inserted, refresh notice_count + enable close if >=3
CREATE OR REPLACE FUNCTION app.refresh_case_notice_count()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM app.notices WHERE case_id = NEW.case_id;

  INSERT INTO app.case_rules_state(case_id, notice_count, closure_enabled, closure_enabled_at)
  VALUES (
    NEW.case_id,
    v_count,
    (v_count >= 3),
    CASE WHEN v_count >= 3 THEN now() ELSE NULL END
  )
  ON CONFLICT (case_id) DO UPDATE SET
    notice_count = EXCLUDED.notice_count,
    closure_enabled = EXCLUDED.closure_enabled,
    closure_enabled_at = CASE
      WHEN app.case_rules_state.closure_enabled = false AND EXCLUDED.closure_enabled = true THEN now()
      WHEN EXCLUDED.closure_enabled = false THEN NULL
      ELSE app.case_rules_state.closure_enabled_at
    END;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notices_refresh_rules ON app.notices;
CREATE TRIGGER trg_notices_refresh_rules
AFTER INSERT ON app.notices
FOR EACH ROW EXECUTE FUNCTION app.refresh_case_notice_count();

/* =========================================================
   10) MEETINGS + RECORDINGS
   ========================================================= */

CREATE TABLE IF NOT EXISTS app.meetings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id       uuid NOT NULL REFERENCES app.cases(id) ON DELETE CASCADE,
  created_by    uuid REFERENCES app.users(id) ON DELETE SET NULL,
  scheduled_at  timestamptz NOT NULL,
  meet_provider app.meet_provider NOT NULL DEFAULT 'google_meet',
  meet_url      text,
  portal_url    text,               -- secure victim portal meeting/join link
  status        app.meeting_status NOT NULL DEFAULT 'scheduled',
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meetings_case_id ON app.meetings(case_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON app.meetings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON app.meetings(status);

CREATE TABLE IF NOT EXISTS app.recordings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id              uuid REFERENCES app.meetings(id) ON DELETE SET NULL,
  case_id                 uuid NOT NULL REFERENCES app.cases(id) ON DELETE CASCADE,
  storage_key             text NOT NULL,      -- encrypted object path
  file_name               text NOT NULL,
  mime_type               text,
  size_bytes              bigint,
  checksum_sha256         text,
  uploaded_by             uuid REFERENCES app.users(id) ON DELETE SET NULL,
  uploaded_at             timestamptz NOT NULL DEFAULT now(),
  is_downloadable_internal boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_recordings_case_id ON app.recordings(case_id);
CREATE INDEX IF NOT EXISTS idx_recordings_meeting_id ON app.recordings(meeting_id);

/* =========================================================
   11) DOCUMENTS (internal + victim uploads) + ACCESS LOGS
   ========================================================= */

CREATE TABLE IF NOT EXISTS app.victim_accounts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id      uuid NOT NULL REFERENCES app.cases(id) ON DELETE CASCADE,
  phone        text,
  email        citext,
  status       text NOT NULL DEFAULT 'active',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_victim_accounts_case_id ON app.victim_accounts(case_id);

CREATE TABLE IF NOT EXISTS app.documents (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id              uuid NOT NULL REFERENCES app.cases(id) ON DELETE CASCADE,
  uploaded_by_user_id  uuid REFERENCES app.users(id) ON DELETE SET NULL,
  uploaded_by_victim_id uuid REFERENCES app.victim_accounts(id) ON DELETE SET NULL,
  source              app.doc_source NOT NULL,
  category            app.doc_category NOT NULL DEFAULT 'OTHER',
  file_name           text NOT NULL,
  mime_type           text,
  size_bytes          bigint,
  storage_key         text NOT NULL,
  checksum_sha256     text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  -- Enforce internal vs victim uploader consistency
  CONSTRAINT chk_documents_uploader_consistency CHECK (
    (source = 'internal' AND uploaded_by_user_id IS NOT NULL AND uploaded_by_victim_id IS NULL)
 OR (source = 'victim'   AND uploaded_by_victim_id IS NOT NULL AND uploaded_by_user_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_documents_case_id ON app.documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_source ON app.documents(source);
CREATE INDEX IF NOT EXISTS idx_documents_category ON app.documents(category);

DROP TRIGGER IF EXISTS trg_documents_updated_at ON app.documents;
CREATE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON app.documents
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- Optional high-compliance access logs
CREATE TABLE IF NOT EXISTS app.document_access_logs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     uuid NOT NULL REFERENCES app.documents(id) ON DELETE CASCADE,
  viewer_user_id  uuid REFERENCES app.users(id) ON DELETE SET NULL,
  action          text NOT NULL CHECK (action IN ('VIEW','DOWNLOAD')),
  ip_address      inet,
  user_agent      text,
  at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doc_access_logs_doc_id ON app.document_access_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_access_logs_viewer ON app.document_access_logs(viewer_user_id);
CREATE INDEX IF NOT EXISTS idx_doc_access_logs_at ON app.document_access_logs(at);

/* =========================================================
   12) OTP SESSIONS (temporary portal access)
   ========================================================= */

CREATE TABLE IF NOT EXISTS app.otp_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id        uuid NOT NULL REFERENCES app.cases(id) ON DELETE CASCADE,
  victim_contact text NOT NULL,                 -- phone/email used
  otp_hash       text NOT NULL,
  expires_at     timestamptz NOT NULL,
  attempts       int NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  verified_at    timestamptz,
  session_token  text UNIQUE NOT NULL,          -- used in /portal/:token
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_sessions_case_id ON app.otp_sessions(case_id);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_expires_at ON app.otp_sessions(expires_at);

/* =========================================================
   13) AUDIT LOGS (mandatory)
   ========================================================= */

CREATE TABLE IF NOT EXISTS app.audit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type      app.actor_type NOT NULL,
  actor_user_id   uuid REFERENCES app.users(id) ON DELETE SET NULL,
  actor_victim_id uuid REFERENCES app.victim_accounts(id) ON DELETE SET NULL,
  action          text NOT NULL,  -- CASE_CREATED, NOTICE_SENT, CASE_CLOSED, etc.
  entity_type     text NOT NULL,  -- case/notice/document/meeting/recording/user
  entity_id       uuid NOT NULL,
  before          jsonb,
  after           jsonb,
  ip_address      inet,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON app.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON app.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON app.audit_logs(action);

/* =========================================================
   14) EXCEL IMPORT TRACKING
   ========================================================= */

CREATE TABLE IF NOT EXISTS app.case_imports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by  uuid REFERENCES app.users(id) ON DELETE SET NULL,
  file_name    text NOT NULL,
  storage_key  text NOT NULL,
  status       app.import_status NOT NULL DEFAULT 'uploaded',
  total_rows   int NOT NULL DEFAULT 0 CHECK (total_rows >= 0),
  success_rows int NOT NULL DEFAULT 0 CHECK (success_rows >= 0),
  failed_rows  int NOT NULL DEFAULT 0 CHECK (failed_rows >= 0),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_imports_status ON app.case_imports(status);
CREATE INDEX IF NOT EXISTS idx_case_imports_created_at ON app.case_imports(created_at);

DROP TRIGGER IF EXISTS trg_case_imports_updated_at ON app.case_imports;
CREATE TRIGGER trg_case_imports_updated_at
BEFORE UPDATE ON app.case_imports
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE IF NOT EXISTS app.case_import_rows (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id  uuid NOT NULL REFERENCES app.case_imports(id) ON DELETE CASCADE,
  row_no     int NOT NULL CHECK (row_no > 0),
  raw_data   jsonb NOT NULL,                 -- store original Excel row
  case_id    uuid REFERENCES app.cases(id) ON DELETE SET NULL,
  status     app.import_row_status NOT NULL,
  error      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_import_rows_import_id ON app.case_import_rows(import_id);
CREATE INDEX IF NOT EXISTS idx_case_import_rows_status ON app.case_import_rows(status);

-- Avoid duplicate row numbers per import
CREATE UNIQUE INDEX IF NOT EXISTS uq_case_import_rows_import_rowno
ON app.case_import_rows(import_id, row_no);

/* =========================================================
   15) SAFETY RULE: prevent editing/deleting victim documents by default
   (Hard DB guard. Internal deletion should be done only if you add a
    special admin function or permission-based stored procedure.)
   ========================================================= */

CREATE OR REPLACE FUNCTION app.block_victim_document_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.source = 'victim' THEN
    RAISE EXCEPTION 'Victim-uploaded documents cannot be modified/deleted (document_id=%).', OLD.id;
  END IF;
  RETURN OLD;
END $$;

DROP TRIGGER IF EXISTS trg_block_victim_doc_update ON app.documents;
CREATE TRIGGER trg_block_victim_doc_update
BEFORE UPDATE ON app.documents
FOR EACH ROW
WHEN (OLD.source = 'victim')
EXECUTE FUNCTION app.block_victim_document_mutation();

DROP TRIGGER IF EXISTS trg_block_victim_doc_delete ON app.documents;
CREATE TRIGGER trg_block_victim_doc_delete
BEFORE DELETE ON app.documents
FOR EACH ROW
WHEN (OLD.source = 'victim')
EXECUTE FUNCTION app.block_victim_document_mutation();

/* =========================================================
   16) OPTIONAL: seed minimal permissions (example)
   ========================================================= */

INSERT INTO app.permissions(key, description) VALUES
  ('CASE_CLOSE', 'Close a case'),
  ('CASE_IMPORT', 'Import cases from Excel'),
  ('USER_MANAGE', 'Manage users and roles'),
  ('AUDIT_VIEW', 'View audit logs'),
  ('RECORDING_DOWNLOAD', 'Download recordings')
ON CONFLICT (key) DO NOTHING;

-- Example mapping (tune as you want)
INSERT INTO app.role_permissions(role_key, permission_key) VALUES
  ('super_admin','CASE_CLOSE'),
  ('super_admin','CASE_IMPORT'),
  ('super_admin','USER_MANAGE'),
  ('super_admin','AUDIT_VIEW'),
  ('super_admin','RECORDING_DOWNLOAD'),

  ('case_manager','CASE_CLOSE'),
  ('case_manager','CASE_IMPORT'),
  ('case_manager','AUDIT_VIEW'),
  ('case_manager','RECORDING_DOWNLOAD'),

  ('advocate','RECORDING_DOWNLOAD'),

  ('staff','AUDIT_VIEW')
ON CONFLICT DO NOTHING;

/* =========================================================
   DONE
   ========================================================= */
