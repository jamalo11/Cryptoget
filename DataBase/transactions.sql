CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    wallet_id INT,
    transaction_type ENUM('incoming', 'outgoing') NOT NULL,
    network VARCHAR(50) NOT NULL,
    token VARCHAR(50) NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    tx_hash VARCHAR(255) NOT NULL UNIQUE,
    status ENUM('pending', 'confirmed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
);