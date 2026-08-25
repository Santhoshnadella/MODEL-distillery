from argon2 import PasswordHasher

ph = PasswordHasher()

def hash_password(password: str) -> str:
    """Hash a plaintext password using Argon2."""
    return ph.hash(password)

def verify_password(hash: str, password: str) -> bool:
    """Verify a password against its Argon2 hash. Returns True if valid."""
    try:
        return ph.verify(hash, password)
    except Exception:
        return False
