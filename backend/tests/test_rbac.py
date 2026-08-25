import os
import pytest
from fastapi.testclient import TestClient

# Ensure a clean test database for each pytest run
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'test_rbac.db'))
if os.path.exists(db_path):
    os.remove(db_path)

# Set up a test database before importing the app
os.environ["DATABASE_URL"] = "sqlite:///./test_rbac.db"

# Import the FastAPI app and related objects
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from backend.app import app, engine, Base, Session, User, hash_password, create_access_token

# Create tables for the test database
Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)

client = TestClient(app)

@pytest.fixture(scope="module")
def admin_token():
    # Create an admin user directly in the database
    with Session(engine) as session:
        # Ensure no duplicate admin user
        existing = session.query(User).filter(User.email == "admin@example.com").first()
        if existing:
            session.delete(existing)
            session.commit()
        admin_user = User(
            id="admin-1",
            email="admin@example.com",
            password_hash=hash_password("adminpass"),
            name="Admin User",
            organization="TestOrg",
            workspace="TestWorkspace",
            role="Owner",
        )
        session.add(admin_user)
        session.commit()
        token = create_access_token(admin_user.id, admin_user.email, admin_user.role)
        return token

def test_create_role(admin_token):
    response = client.post(
        "/api/roles",
        json={"name": "tester", "description": "Test role"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "tester"
    assert "id" in data

def test_create_permission(admin_token):
    response = client.post(
        "/api/permissions",
        json={"name": "read_data", "description": "Read permission"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "read_data"
    assert "id" in data

def test_assign_role(admin_token):
    # First, create a regular user
    with Session(engine) as session:
        # Ensure no duplicate regular user
        existing_user = session.query(User).filter(User.email == "user@example.com").first()
        if existing_user:
            session.delete(existing_user)
            session.commit()
        user = User(
            id="user-1",
            email="user@example.com",
            password_hash=hash_password("userpass"),
            name="Regular User",
            organization="TestOrg",
            workspace="TestWorkspace",
            role="Operator",
        )
        session.add(user)
        session.commit()
    # Assign the previously created role to the user
    response = client.post(
        "/admin/assign-role",
        json={"user_id": "user-1", "role": "tester"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "user-1"
    assert data["role"] == "tester"
