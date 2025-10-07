# Symfony Task Manager API

A RESTful API built with Symfony 7.3 for managing tasks with a modern web UI. Built as a learning project to demonstrate Symfony REST API development with Doctrine ORM and SQLite.

## 🚀 Features

### Backend API
- ✅ Create, read, update, and delete tasks
- ✅ Task validation (title required, status choices)
- ✅ RESTful endpoints with proper HTTP methods
- ✅ JSON responses with consistent structure
- ✅ SQLite database (no external DB required)
- ✅ CORS enabled for frontend integration
- ✅ Proper error handling and validation messages

### Frontend UI (NEW!)
- ✅ Modern, responsive dashboard
- ✅ Real-time API response monitor
- ✅ Task filtering by status
- ✅ Complete API documentation page
- ✅ No Twig dependency - pure HTML/CSS/JS

## 🛠️ Tech Stack

### Backend
- **PHP** 8.2+
- **Symfony** 7.3
- **Doctrine ORM** 3.5
- **SQLite** (embedded database)
- **Validator Component**
- **CORS Bundle**

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **Vanilla JavaScript** - No frameworks required

## 📦 Installation

### 1. Clone the repository
```bash
git clone git@github.com:abdullahrather/task-api.git
cd task-api
```

### 2. Install dependencies
```bash
composer install
```

### 3. Create the database
```bash
php bin/console doctrine:schema:create
```

### 4. Start the development server
```bash
php -S localhost:8000 -t public/
```

### 5. Open in your browser
```
http://localhost:8000/
```

## 🎯 Usage

### Web Interface
Open `http://localhost:8000/` in your browser to access:
- **Dashboard** - Create and manage tasks with a visual interface
- **API Documentation** - Complete API reference with examples

### API Endpoints

#### List all tasks
```bash
GET /api/tasks
# Optional: ?status=pending|in_progress|completed
```

#### Get a specific task
```bash
GET /api/tasks/{id}
```

#### Create a new task
```bash
POST /api/tasks
Content-Type: application/json

{
  "title": "My Task",
  "description": "Task description",
  "status": "pending"
}
```

#### Update a task
```bash
PUT /api/tasks/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "completed"
}
```

#### Delete a task
```bash
DELETE /api/tasks/{id}
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Task Title",
    "description": "Task description",
    "status": "pending",
    "createdAt": "2025-10-07 22:51:34",
    "updatedAt": null
  }
}
```

### Error Response
```json
{
  "success": false,
  "errors": [
    {
      "field": "title",
      "message": "Title must be at least 3 characters"
    }
  ]
}
```

## 🏗️ Project Structure

```
task-api/
├── public/
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css      # Frontend styling
│   │   └── js/
│   │       └── app.js          # Frontend logic
│   ├── index.html              # Main UI
│   └── index.php               # Symfony front controller
├── src/
│   ├── Controller/
│   │   ├── HomeController.php  # Serves the frontend UI
│   │   └── TaskController.php  # API endpoints
│   ├── Entity/
│   │   └── Task.php            # Task entity
│   └── Repository/
│       └── TaskRepository.php  # Database queries
├── config/                     # Symfony configuration
└── var/                        # Cache and database
```

## 🎨 Features Overview

### Dashboard
- Create tasks with validation
- View all tasks or filter by status
- Update task status with one click
- Delete tasks with confirmation
- Real-time API response monitor

### API Documentation Page
- Complete endpoint reference
- Request/response examples
- Status codes table
- Validation rules

## 🔧 Development

### Running Tests
```bash
# Tests not yet implemented
php bin/phpunit
```

### Clearing Cache
```bash
php bin/console cache:clear
```

### Database Commands
```bash
# Create database schema
php bin/console doctrine:schema:create

# Drop and recreate schema
php bin/console doctrine:schema:drop --force
php bin/console doctrine:schema:create
```

## 📚 Learning Resources

This project demonstrates:
- ✅ Symfony routing with attributes
- ✅ Doctrine ORM entities and repositories
- ✅ REST API development
- ✅ JSON serialization
- ✅ Form validation
- ✅ Serving static HTML without Twig
- ✅ Frontend-backend integration

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!

## 📄 License

Proprietary - for learning purposes

## 🙏 Acknowledgments

Built with [Symfony](https://symfony.com/) - The PHP framework for web applications
