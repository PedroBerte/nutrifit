import os
import sys
import subprocess

root = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root, 'backend-node')

def run(cmd, cwd=None):
    print(f"\n> {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    result = subprocess.run(cmd, cwd=cwd or backend_dir, shell=isinstance(cmd, str))
    if result.returncode != 0:
        print(f"FAILED with exit code {result.returncode}")
        sys.exit(result.returncode)

print("=== NutriFit Node backend setup ===\n")
print("Step 1: Scaffold all module files...")
run(["node", "init-structure.js"])

print("\nStep 2: Add storage module, unit tests, patches...")
run(["node", "setup-add-modules.js"])

print("\nStep 3: Install npm dependencies...")
run(["npm", "install"])

print("\nStep 4: Generate Prisma client...")
run(["npx", "prisma", "generate"])

print("\n=== Setup complete! ===")
print("Next steps:")
print("  - Start PostgreSQL + Redis + MinIO (or run: docker-compose up db redis minio -d)")
print("  - Run: cd backend-node && npx prisma migrate dev --name init")
print("  - Run: cd backend-node && npx prisma db seed")
print("  - Run: cd backend-node && npm run test:unit")

