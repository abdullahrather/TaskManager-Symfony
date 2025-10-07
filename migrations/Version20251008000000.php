<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251008000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add priority and due_date columns to tasks table';
    }

    public function up(Schema $schema): void
    {
        // Add columns as nullable first
        $this->addSql('ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE tasks ADD COLUMN due_date DATE DEFAULT NULL');

        // Set default value for existing rows
        $this->addSql("UPDATE tasks SET priority = 'medium' WHERE priority IS NULL");

        // Note: SQLite doesn't support ALTER COLUMN, so we keep it nullable with default 'medium' in code
    }

    public function down(Schema $schema): void
    {
        $this->addSql('CREATE TEMPORARY TABLE __temp__tasks AS SELECT id, title, description, status, created_at, updated_at FROM tasks');
        $this->addSql('DROP TABLE tasks');
        $this->addSql('CREATE TABLE tasks (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, title VARCHAR(255) NOT NULL, description CLOB DEFAULT NULL, status VARCHAR(50) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL)');
        $this->addSql('INSERT INTO tasks (id, title, description, status, created_at, updated_at) SELECT id, title, description, status, created_at, updated_at FROM __temp__tasks');
        $this->addSql('DROP TABLE __temp__tasks');
    }
}
