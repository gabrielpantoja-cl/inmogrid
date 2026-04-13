-- ============================================================
-- ADR-006: Sofia RAG chatbot tables
-- ALREADY EXECUTED in Supabase on 2026-04-13
-- Kept here for reference and reproducibility
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE inmogrid_sofia_documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT DEFAULT 'general',
  metadata JSONB DEFAULT '{}',
  embedding vector(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sofia_docs_embedding_idx
ON inmogrid_sofia_documents USING hnsw (embedding vector_cosine_ops);

CREATE INDEX sofia_docs_type_idx
ON inmogrid_sofia_documents(document_type);

CREATE TABLE inmogrid_sofia_conversations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sofia_conv_user_idx ON inmogrid_sofia_conversations(user_id);
CREATE INDEX sofia_conv_session_idx ON inmogrid_sofia_conversations(session_id);

CREATE TABLE inmogrid_sofia_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT NOT NULL REFERENCES inmogrid_sofia_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sofia_msg_conv_idx ON inmogrid_sofia_messages(conversation_id, created_at);

ALTER TABLE inmogrid_sofia_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inmogrid_sofia_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE inmogrid_sofia_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "docs_read_all" ON inmogrid_sofia_documents FOR SELECT USING (true);
CREATE POLICY "docs_admin_write" ON inmogrid_sofia_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM inmogrid_profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "conv_own" ON inmogrid_sofia_conversations FOR ALL USING (
  auth.uid() = user_id OR session_id IS NOT NULL
);
CREATE POLICY "msg_conv_access" ON inmogrid_sofia_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM inmogrid_sofia_conversations WHERE id = conversation_id)
);
