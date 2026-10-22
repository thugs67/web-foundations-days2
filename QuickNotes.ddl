-- 1. Create Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Create Notes Table
CREATE TABLE notes (
    note_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    body_text TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- 3. Create Tags Table
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    color_code VARCHAR(7) DEFAULT '#808080', -- Hex color code (e.g., #FF5733)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tag_user
        FOREIGN KEY(user_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT unique_user_tag UNIQUE (user_id, name) -- Prevents duplicate tags per user
);

-- 4. Create Note_Tags Junction Table (Many-to-Many Relationship)
CREATE TABLE note_tags (
    note_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    CONSTRAINT fk_note
        FOREIGN KEY(note_id) 
        REFERENCES notes(note_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_tag
        FOREIGN KEY(tag_id) 
        REFERENCES tags(tag_id)
        ON DELETE CASCADE
);

-- 5. Create Performance Indexes for Common Queries
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_notes_pinned_archived ON notes(user_id, is_pinned, is_archived);

