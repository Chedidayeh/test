-- Initialize readly database with schemas for each microservice
-- This file is executed on PostgreSQL startup (docker-entrypoint-initdb.d)

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS progress;
CREATE SCHEMA IF NOT EXISTS ai;

-- Grant privileges
GRANT ALL PRIVILEGES ON SCHEMA auth TO readly_user;
GRANT ALL PRIVILEGES ON SCHEMA content TO readly_user;
GRANT ALL PRIVILEGES ON SCHEMA progress TO readly_user;
GRANT ALL PRIVILEGES ON SCHEMA ai TO readly_user;

-- Optionally, initialize basic tables (or let Prisma handle migrations)
-- Auth Service
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  google_id VARCHAR(255),
  role VARCHAR(50) DEFAULT 'parent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  age INT,
  avatar_url VARCHAR(255),
  access_code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Service
CREATE TABLE IF NOT EXISTS content.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(50) DEFAULT 'beginner',
  cover_image_url VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content.riddles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES content.stories(id),
  node_id VARCHAR(255),
  statement TEXT NOT NULL,
  difficulty VARCHAR(50) DEFAULT 'easy',
  accepted_answers TEXT[], -- JSON array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content.hints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  riddle_id UUID REFERENCES content.riddles(id),
  level INT CHECK (level BETWEEN 1 AND 3),
  hint_text TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progress Service
CREATE TABLE IF NOT EXISTS progress.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL,
  story_id UUID NOT NULL,
  riddle_id UUID NOT NULL,
  submitted_answer VARCHAR(255),
  result VARCHAR(50), -- 'correct', 'almost_correct', 'incorrect'
  stars INT DEFAULT 0,
  hints_used INT DEFAULT 0,
  time_to_answer INT, -- seconds
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL,
  story_id UUID NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  total_time INT -- seconds
);

-- AI Service (optional, can be left empty for MVP)
CREATE TABLE IF NOT EXISTS ai.validation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  riddle_id UUID NOT NULL,
  submitted_answer VARCHAR(255),
  is_correct BOOLEAN,
  similarity FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_status ON content.stories(status);
CREATE INDEX IF NOT EXISTS idx_riddles_story_id ON content.riddles(story_id);
CREATE INDEX IF NOT EXISTS idx_attempts_child_id ON progress.attempts(child_id);
CREATE INDEX IF NOT EXISTS idx_attempts_story_id ON progress.attempts(story_id);
CREATE INDEX IF NOT EXISTS idx_sessions_child_id ON progress.sessions(child_id);

-- Grant table privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO readly_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA content TO readly_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA progress TO readly_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ai TO readly_user;

-- Grant sequence privileges (for auto-increment-like functionality)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO readly_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA content TO readly_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA progress TO readly_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ai TO readly_user;

-- Log initialization
SELECT 'Readly database initialized successfully' as status;
