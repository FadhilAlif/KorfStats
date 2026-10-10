-- ==============================================================================
-- KorfStats Bantul — Database Initialization Script (Neon PostgreSQL)
-- ==============================================================================

-- 1. TABEL TIM (TEAMS)
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL PEMAIN / ATLET (PLAYERS)
CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    nickname VARCHAR(50),
    jersey_number INT NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('MALE', 'FEMALE')),
    jersey_size VARCHAR(10),
    primary_position VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_team_jersey UNIQUE (team_id, jersey_number)
);

-- 3. TABEL PERTANDINGAN (MATCHES)
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(36) PRIMARY KEY,
    match_code VARCHAR(50) NOT NULL UNIQUE,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue VARCHAR(100),
    format VARCHAR(10) NOT NULL CHECK (format IN ('K4', 'K8')),
    team_structure VARCHAR(20) NOT NULL CHECK (team_structure IN ('TWO_TEAM', 'THREE_TEAM')),
    team_a_id VARCHAR(36) NOT NULL REFERENCES teams(id),
    team_b_id VARCHAR(36) NOT NULL REFERENCES teams(id),
    team_c_id VARCHAR(36) REFERENCES teams(id),
    periods INT DEFAULT 2,
    period_duration_minutes INT DEFAULT 20,
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'LIVE', 'COMPLETED')),
    score_team_a INT DEFAULT 0,
    score_team_b INT DEFAULT 0,
    score_team_c INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL SUSUNAN PEMAIN PERTANDINGAN (MATCH_LINEUPS)
CREATE TABLE IF NOT EXISTS match_lineups (
    id VARCHAR(36) PRIMARY KEY,
    match_id VARCHAR(36) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id VARCHAR(36) NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id VARCHAR(36) NOT NULL REFERENCES teams(id),
    is_starter BOOLEAN DEFAULT FALSE,
    is_on_court BOOLEAN DEFAULT FALSE,
    period_entered INT DEFAULT 1,
    CONSTRAINT uq_match_player UNIQUE (match_id, player_id)
);

-- 5. TABEL EVENT AKSI PERTANDINGAN (MATCH_EVENTS - EVENT SOURCING LOG)
CREATE TABLE IF NOT EXISTS match_events (
    id VARCHAR(36) PRIMARY KEY,
    client_event_id VARCHAR(64) NOT NULL UNIQUE,
    match_id VARCHAR(36) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id VARCHAR(36) REFERENCES players(id),
    team_id VARCHAR(36) NOT NULL REFERENCES teams(id),
    period INT NOT NULL,
    game_time_seconds INT NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- SHOOT_M, SHOOT_A, RI_M, RI_A, PENALTY_M, PENALTY_A, REB_OFF, REB_DEF, ASSIST, INTERCEPT, TURNOVER, FOUL, BAD_DEFENSE
    shot_position INT,                -- 1 s/d 8
    shot_distance_meter INT,          -- 2, 4, 6, 8
    turnover_type VARCHAR(20),        -- TO_BP, TO_BI, TO_T, TO_DD, TO_DRI, TO_C
    opponent_player_id VARCHAR(36) REFERENCES players(id),
    points_awarded INT DEFAULT 0,
    running_score_a INT DEFAULT 0,
    running_score_b INT DEFAULT 0,
    running_score_c INT DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events(match_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_match_events_player ON match_events(player_id);

-- 6. TABEL AGREGAT STATISTIK PEMAIN PER PERTANDINGAN (PLAYER_GAME_STATS)
CREATE TABLE IF NOT EXISTS player_game_stats (
    id VARCHAR(36) PRIMARY KEY,
    match_id VARCHAR(36) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id VARCHAR(36) NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    sa INT DEFAULT 0,
    sm INT DEFAULT 0,
    ria INT DEFAULT 0,
    rim INT DEFAULT 0,
    fpa INT DEFAULT 0,
    fpm INT DEFAULT 0,
    pa INT DEFAULT 0,
    pm INT DEFAULT 0,
    fsa INT DEFAULT 0,
    fsm INT DEFAULT 0,
    reb_off INT DEFAULT 0,
    reb_def INT DEFAULT 0,
    assist INT DEFAULT 0,
    intercept INT DEFAULT 0,
    defended INT DEFAULT 0,
    to_sum INT DEFAULT 0,
    fouls INT DEFAULT 0,
    fg_percentage DOUBLE PRECISION DEFAULT 0.0,
    ri_percentage DOUBLE PRECISION DEFAULT 0.0,
    positive_score DOUBLE PRECISION DEFAULT 0.0,
    negative_score DOUBLE PRECISION DEFAULT 0.0,
    total_score DOUBLE PRECISION DEFAULT 0.0,
    total_positive_actions INT DEFAULT 0,
    efficiency DOUBLE PRECISION DEFAULT 0.0,
    total_points INT DEFAULT 0,
    CONSTRAINT uq_player_match_stat UNIQUE (match_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_player_game_stats_match ON player_game_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_player_game_stats_player ON player_game_stats(player_id);

-- 7. TABEL KONFIGURASI BOBOT PELATIH UNTUK SELEKSI (COACH_WEIGHT_CONFIGS)
CREATE TABLE IF NOT EXISTS coach_weight_configs (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    weight_sm DOUBLE PRECISION DEFAULT 1.0,
    weight_rim DOUBLE PRECISION DEFAULT 1.0,
    weight_reb_off DOUBLE PRECISION DEFAULT 1.0,
    weight_reb_def DOUBLE PRECISION DEFAULT 1.0,
    weight_assist DOUBLE PRECISION DEFAULT 1.0,
    weight_intercept DOUBLE PRECISION DEFAULT 1.0,
    weight_defended DOUBLE PRECISION DEFAULT 1.0,
    weight_turnover_penalty DOUBLE PRECISION DEFAULT 1.0,
    weight_foul_penalty DOUBLE PRECISION DEFAULT 1.0,
    weight_bad_defense_penalty DOUBLE PRECISION DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
