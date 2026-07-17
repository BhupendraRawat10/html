
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chats (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type          ENUM('direct', 'group') NOT NULL DEFAULT 'direct',
  name          VARCHAR(255) NULL, 
  created_by    BIGINT UNSIGNED NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chats_created_by FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chat_members (
  chat_id       BIGINT UNSIGNED NOT NULL,
  user_id       BIGINT UNSIGNED NOT NULL,
  role          ENUM('member', 'admin') NOT NULL DEFAULT 'member',
  joined_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (chat_id, user_id),
  CONSTRAINT fk_chat_members_chat FOREIGN KEY (chat_id) REFERENCES chats(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_chat_members_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE INDEX idx_chat_members_user ON chat_members (user_id);
CREATE INDEX idx_chat_members_chat ON chat_members (chat_id);
