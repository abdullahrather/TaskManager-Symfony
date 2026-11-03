# Symfony Task Manager

A task manager built with Symfony 7.3: a REST API for tasks with validation, filtering and statistics, plus a single-page front end that uses it. Data is stored in SQLite, so there's no database server to set up.

## Features

- **Tasks API:** create, read, update and delete tasks over JSON
- **Priorities and due dates:** priority `low`, `medium`, `high` or `urgent`, and an optional due date
- **Filtering and search** by status and priority, and by text in the title or description
- **Statistics:** totals per status, overdue count and completion rate
- **Overdue list:** unfinished tasks past their due date
- **Validation** with clear error messages, such as a title of at least 3 characters and only allowed status values
- **Consistent JSON** responses, with correct HTTP status codes (201, 400, 404)
- **CORS** set up for separate front ends through NelmioCorsBundle
- **Front end:** a Twig page with plain JavaScript that calls the API

## Tech stack

PHP 8.2+, Symfony 7.3, Doctrine ORM 3 with migrations, SQLite, Symfony Validator, NelmioCorsBundle, Twig and plain JavaScript.

## Getting started

You need PHP 8.2 or newer with the SQLite extension, and Composer.

```bash
git clone https://github.com/abdullahrather/symfony-task-manager.git
cd symfony-task-manager
composer install
php bin/console doctrine:migrations:migrate --no-interaction
php -S localhost:8000 -t public
```

Open http://localhost:8000 for the front end. If you have the [Symfony CLI](https://symfony.com/download), `symfony serve` works too.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/tasks` | List tasks. Optional `status`, `priority` and `search` query parameters |
| `GET` | `/api/tasks/{id}` | Get one task |
| `POST` | `/api/tasks` | Create a task |
| `PUT`/`PATCH` | `/api/tasks/{id}` | Update a task |
| `DELETE` | `/api/tasks/{id}` | Delete a task |
| `GET` | `/api/tasks/stats` | Counts per status, overdue count and completion rate |
| `GET` | `/api/tasks/overdue` | Unfinished tasks past their due date |

Create a task:

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write release notes", "priority": "high", "dueDate": "2026-12-01"}'
```

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": { "id": 1, "title": "Write release notes", "status": "pending", "priority": "high", "dueDate": "2026-12-01" }
}
```

A failed validation returns `400`:

```json
{ "success": false, "errors": { "title": "Title must be at least 3 characters" } }
```

Task fields are `title` (required, 3 to 255 characters), `description`, `status` (`pending`, `in_progress` or `completed`), `priority` and `dueDate` (`YYYY-MM-DD`).

## Project layout

| Path | What it holds |
|---|---|
| `src/Controller/TaskController.php` | API endpoints |
| `src/Entity/Task.php` | Task entity and validation rules |
| `src/Repository/TaskRepository.php` | Filtering, search and statistics queries |
| `migrations/` | Database schema |
| `templates/home/index.html.twig`, `public/assets/` | Front end |

## License

MIT
