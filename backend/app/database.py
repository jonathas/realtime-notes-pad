from sqlmodel import create_engine, SQLModel
import os

# PostgreSQL URL format: postgresql://user:password@host:port/database
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+psycopg://notes:notes@localhost:5432/notes"
)

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)