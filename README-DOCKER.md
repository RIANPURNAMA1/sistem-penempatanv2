# Docker Setup - Sistem Penempatan Kandidat

## Prerequisites
- Docker installed
- Docker Compose installed

## Quick Start

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## Services

| Service   | Port  | Description              |
|-----------|-------|--------------------------|
| frontend  | 3000  | React frontend (nginx)   |
| backend   | 5000  | Express API server       |
| mysql     | 3306  | MySQL 8 database         |

## Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Users
| Username | Password | Role     |
|----------|----------|----------|
| admin    | admin123 | admin    |
| hrd      | hrd123   | hrd      |

## Database Connection
- Host: mysql (from containers)
- Port: 3306
- Database: kandidat_db
- Username: kandidat_user
- Password: kandidat_password

## Troubleshooting

### Reset Database
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d    # Fresh start
```

### Rebuild Backend
```bash
docker-compose up -d --build backend
```

### View Container Logs
```bash
docker-compose logs backend
docker-compose logs mysql
docker-compose logs frontend
```
