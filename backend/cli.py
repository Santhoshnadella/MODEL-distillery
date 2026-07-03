import argparse
import requests
import json
import os

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
TOKEN_FILE = os.path.expanduser("~/.md_token")

def login(email, password, workspace):
    print(f"Logging into {BASE_URL} as {email}...")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password,
        "workspace": workspace,
        "role": "Owner"
    })
    if resp.status_code == 200:
        token = resp.json()["access_token"]
        with open(TOKEN_FILE, "w") as f:
            f.write(token)
        print("Successfully logged in.")
    else:
        print(f"Login failed: {resp.text}")

def _get_headers():
    if not os.path.exists(TOKEN_FILE):
        print("Please run 'python cli.py login ...' first.")
        exit(1)
    with open(TOKEN_FILE, "r") as f:
        token = f.read().strip()
    return {"Authorization": f"Bearer {token}"}

def list_jobs():
    resp = requests.get(f"{BASE_URL}/api/jobs", headers=_get_headers())
    if resp.ok:
        jobs = resp.json()
        print(f"--- Active Jobs ({len(jobs)}) ---")
        for j in jobs:
            print(f"[{j['id']}] {j['name']} - Stage: {j['stage']} - {j['progress']}")
    else:
        print(f"Failed to fetch jobs: {resp.text}")

def list_recipes():
    resp = requests.get(f"{BASE_URL}/api/recipes", headers=_get_headers())
    if resp.ok:
        recipes = resp.json()
        print(f"--- Available Recipes ({len(recipes)}) ---")
        for r in recipes:
            print(f"[{r['id']}] {r['name']} - Model: {r['base_model']}")
    else:
        print(f"Failed to fetch recipes: {resp.text}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Model Distillery CLI Tool")
    subparsers = parser.add_subparsers(dest="command")

    login_parser = subparsers.add_parser("login", help="Authenticate with the API")
    login_parser.add_argument("--email", required=True)
    login_parser.add_argument("--password", required=True)
    login_parser.add_argument("--workspace", default="Amber Forge")

    jobs_parser = subparsers.add_parser("jobs", help="List all jobs in the workspace")
    recipes_parser = subparsers.add_parser("recipes", help="List all recipes in the workspace")

    args = parser.parse_args()

    if args.command == "login":
        login(args.email, args.password, args.workspace)
    elif args.command == "jobs":
        list_jobs()
    elif args.command == "recipes":
        list_recipes()
    else:
        parser.print_help()
