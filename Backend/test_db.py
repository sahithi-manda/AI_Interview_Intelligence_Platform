from sqlalchemy import text

from app.database.database import engine


try:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    print("PostgreSQL connection successful!")

except Exception as error:
    print("Database connection failed:")
    print(error)