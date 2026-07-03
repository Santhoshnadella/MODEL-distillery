import os
import random

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

# Pack 1: Proof of Concept / Niche Task (5,000)
def generate_poc_pack(filepath, count=5000):
    verbs = ["Rewrite", "Format", "Translate", "Summarize", "Convert"]
    tones = ["like a 17th-century pirate", "in valid JSON", "using only emojis", "in Shakespearean English", "in YAML"]
    subjects = ["the following sentence", "this movie plot", "the history of Rome", "a recipe for pancakes", "a car manual"]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        for i in range(count):
            prompt = f"{random.choice(verbs)} {random.choice(subjects)} {random.choice(tones)}. (Variation {i})\n"
            f.write(prompt)
    print(f"Generated {count} prompts in {filepath}")

# Pack 2: Task Specific (50,000)
def generate_task_pack(filepath, count=50000):
    tasks = ["Write a Python script using", "Design a SQL schema for", "Diagnose a segfault in", "Implement a loss function for", "Optimize a React component using"]
    techs = ["asyncio", "B-Trees", "PyTorch", "Redis", "WebSockets", "Docker", "FastAPI", "Next.js", "Celery", "Kafka"]
    contexts = ["for a high-traffic SaaS", "in a multi-tenant environment", "with O(1) time complexity", "with 99.9% uptime", "for a trading algorithm"]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        for i in range(count):
            prompt = f"{random.choice(tasks)} {random.choice(techs)} {random.choice(contexts)}. (Task Variant {i})\n"
            f.write(prompt)
    print(f"Generated {count} prompts in {filepath}")

# Pack 3: General Foundation (150,000)
def generate_general_pack(filepath, count=150000):
    domains = ["quantum physics", "macroeconomics", "Stoicism", "distributed databases", "Japanese culture", "evolutionary biology", "abstract algebra", "renaissance art"]
    actions = ["Explain the core mechanics of", "Compare and contrast", "Provide a step-by-step mathematical proof of", "Analyze the historical significance of", "What are the ethical implications of"]
    modifiers = ["in simple terms", "for a graduate level exam", "with historical context", "using a modern analogy", "focusing on the first principles"]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        for i in range(count):
            prompt = f"{random.choice(actions)} {random.choice(domains)} {random.choice(modifiers)}. (General Seed {i})\n"
            f.write(prompt)
    print(f"Generated {count} prompts in {filepath}")

if __name__ == "__main__":
    out_dir = "backend/packs"
    ensure_dir(out_dir)
    
    generate_poc_pack(os.path.join(out_dir, "proof_of_concept_5k.txt"), 5000)
    generate_task_pack(os.path.join(out_dir, "task_specific_50k.txt"), 50000)
    generate_general_pack(os.path.join(out_dir, "general_foundation_150k.txt"), 150000)
