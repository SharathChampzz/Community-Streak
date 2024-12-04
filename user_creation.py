import sqlite3
from faker import Faker

def create_test_users(db_path: str, n: int, password: str = "common_password"):
    fake = Faker()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    for _ in range(n):
        username = fake.user_name()
        email = fake.email()
        cursor.execute("""
            INSERT INTO CS_Users (username, email, password, flags, created_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (username, email, password, "regular"))

    conn.commit()
    conn.close()
    print(f"{n} test users created successfully.")

# Usage
create_test_users("app.db", 50)  # Replace "app.db" with your database path
