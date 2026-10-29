import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'cotec',
  charset: process.env.DB_CHARSET || 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(config);

export async function ensureDatabase() {
  const adminConfig = {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    charset: config.charset,
  };

  try {
    const connection = await mysql.createConnection(adminConfig);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
    await connection.end();
  } catch (error) {
    console.warn('[mysql] création de la base impossible :', error.message);
  }

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) NOT NULL,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      password_salt VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY unique_email (email),
      KEY idx_users_email (email),
      KEY idx_users_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      author VARCHAR(255) NOT NULL,
      service VARCHAR(255) DEFAULT 'Service client',
      text TEXT NOT NULL,
      status ENUM('approved','pending','rejected') NOT NULL DEFAULT 'approved',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_comments_status (status),
      KEY idx_comments_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) DEFAULT NULL,
      subject VARCHAR(255) DEFAULT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS whatsapp_message_templates (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      key_name VARCHAR(100) NOT NULL,
      phone_number VARCHAR(30) NOT NULL DEFAULT '243817483857',
      message TEXT NOT NULL,
      description VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY unique_whatsapp_key (key_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const seedMessages = [
    ['general_contact', '243817483857', 'Bonjour COTEC, je souhaite parler à un conseiller.', 'Bouton de contact général'],
    ['plan_installation', '243817483857', 'Bonjour COTEC, je souhaite planifier une installation.', 'Bouton planifier une installation'],
    ['technician_help', '243817483857', 'Bonjour COTEC, je viens du site et je souhaite parler à un technicien.', 'Bouton float WhatsApp'],
    ['shop_inquiry', '243817483857', 'Bonjour COTEC, je souhaite en savoir plus sur la boutique.', 'Bouton boutique'],
    ['product_inquiry', '243817483857', 'Bonjour COTEC, je souhaite plus d’informations sur ce produit.', 'Demande produit'],
    ['service_quote', '243817483857', 'Bonjour COTEC, je souhaite demander un devis.', 'Demande de devis'],
    ['coverage_check', '243817483857', 'Bonjour COTEC, je souhaite vérifier la couverture Internet.\nLocalisation / quartier : ____\nUsage : maison / boutique / bureau', 'Vérification de couverture'],
    ['maintenance_issue', '243817483857', 'Bonjour COTEC, je suis abonné(e) et j’ai un problème après l’installation.\nLocalisation / quartier : ____\nÉquipement : routeur / point à point / Tenda / NanoStation / LiteBeam\nProblème constaté : ____', 'Problème technique'],
    ['subscription_request', '243817483857', 'Bonjour COTEC, je souhaite m’abonner à Internet.', 'Abonnement'],
    ['stage_request', '243817483857', 'Bonjour COTEC, je souhaite déposer ma demande de stage ou de formation.', 'Stage et formation']
  ];

  for (const [keyName, phoneNumber, messageText, description] of seedMessages) {
    await pool.execute(
      `INSERT INTO whatsapp_message_templates (key_name, phone_number, message, description)
       SELECT ?, ?, ?, ?
       WHERE NOT EXISTS (SELECT 1 FROM whatsapp_message_templates WHERE key_name = ?)`,
      [keyName, phoneNumber, messageText, description, keyName]
    );
  }
}
