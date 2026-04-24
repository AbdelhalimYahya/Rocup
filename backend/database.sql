CREATE DATABASE rocup;

\c rocup;

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    num_members INT NOT NULL,
    department VARCHAR(255),
    leader_name VARCHAR(255) NOT NULL,
    leader_phone VARCHAR(50) NOT NULL,
    leader_national_id VARCHAR(50) NOT NULL,
    leader_email VARCHAR(255) NOT NULL,
    members JSONB,
    receipt_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
