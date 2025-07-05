from sqlmodel import create_engine, SQLModel
import os
from pathlib import Path

# SQLite URL format: sqlite:///path/to/database.db
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./data/notes.db"
)

def ensure_database_directory():
    """Ensure the database directory exists"""
    if DATABASE_URL.startswith("sqlite"):
        # Extract path from sqlite:///./data/notes.db
        db_path = DATABASE_URL.replace("sqlite:///", "")
        if db_path.startswith("./"):
            db_path = db_path[2:]  # Remove ./
        
        # Get directory path
        db_dir = Path(db_path).parent
        
        # Create directory if it doesn't exist
        db_dir.mkdir(parents=True, exist_ok=True)
        print(f"📁 Database directory ensured: {db_dir.absolute()}")

# Ensure directory exists before creating engine
ensure_database_directory()

# SQLite-specific engine configuration
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        echo=True,
        connect_args={"check_same_thread": False}  # Required for SQLite with FastAPI
    )
else:
    # PostgreSQL settings (If we decide to use PostgreSQL in the future)
    engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    """Create database tables"""
    try:
        SQLModel.metadata.create_all(engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        raise