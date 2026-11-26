-- Runs once, when the database volume is first created.
-- Migrations will declare the same extensions (IF NOT EXISTS), so production gets them too.
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS postgis;
