.PHONY: dev backend frontend install test clean

# Start both servers (backend + frontend) simultaneously
dev:
	@echo "Starting ControlPlane.ai — Backend (:8000) + Frontend (:3000)..."
	@start cmd /k "cd /d %CD% && python -m uvicorn backend.app.main:app --port 8000 --host 127.0.0.1 --reload"
	@start cmd /k "cd /d %CD%\frontend && npm run dev"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "API Docs: http://localhost:8000/docs"

# Backend only
backend:
	python -m uvicorn backend.app.main:app --port 8000 --host 127.0.0.1 --reload

# Frontend only
frontend:
	cd frontend && npm run dev

# Install all dependencies
install:
	pip install -r requirements.txt
	cd frontend && npm install

# Run full test suite
test:
	python -m pytest -v backend/tests -o pythonpath=.

# Build frontend for production
build:
	cd frontend && npm run build

# Clean build artifacts
clean:
	rd /s /q frontend\dist 2>nul || true
	rd /s /q frontend\node_modules 2>nul || true
	rd /s /q __pycache__ 2>nul || true
