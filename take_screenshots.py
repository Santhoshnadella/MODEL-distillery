import asyncio
from playwright.async_api import async_playwright

async def handle_route(route):
    # Mock all API requests so we don't get 401 redirects
    if "/api/recipes" in route.request.url:
        await route.fulfill(status=200, json=[{"id": 1, "name": "Amber-Infused Qwen Blend", "safety": 84, "base_model": "Qwen 2.5 14B", "knowledge_blend": 12, "flavor_profile": "Analytical", "estimated_cost": 0.82}])
    elif "/api/datasets" in route.request.url:
        await route.fulfill(status=200, json=[{"id": 1, "name": "Company-Docs-V1", "token_count": 1200000}])
    elif "/api/jobs" in route.request.url:
        await route.fulfill(status=200, json=[{"id": 1, "name": "Distill Qwen", "progress": "60%", "stage": "Distilling", "status": "Running", "owner": "Admin"}])
    else:
        await route.fulfill(status=200, json={})

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        
        # Intercept API calls
        await context.route("**/api/**", handle_route)

        page = await context.new_page()
        
        # Fake token to bypass initial checks if any
        await page.goto("http://localhost:3000/")
        await page.evaluate("localStorage.setItem('token', 'fake_token')")

        paths = [
            ("/", "landing_page.png"),
            ("/recipes", "recipes_page.png"),
            ("/datasets", "datasets_page.png"),
            ("/workflows", "workflows_page.png"),
            ("/synthetic", "synthetic_page.png"),
            ("/evaluation", "evaluation_page.png"),
            ("/marketplace", "marketplace_page.png")
        ]
        
        artifact_dir = r"C:\Users\Santosh\.gemini\antigravity-ide\brain\ad904732-63c8-41be-a73f-1dd09ed4148d"

        for route, filename in paths:
            print(f"Taking screenshot of {route}...")
            await page.goto(f"http://localhost:3000{route}")
            await asyncio.sleep(2) # wait for animations
            await page.screenshot(path=f"{artifact_dir}\\{filename}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
