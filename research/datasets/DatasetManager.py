import json
import os
from typing import List, Dict

class DatasetManager:
    """Manages training datasets extracted by the ProjectMind kernel."""

    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        os.makedirs(self.data_dir, exist_ok=True)

    def load_dataset(self, version: str) -> List[Dict]:
        """Loads a versioned dataset from disk."""
        filepath = os.path.join(self.data_dir, f"dataset_{version}.jsonl")
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Dataset version {version} not found at {filepath}")
        
        data = []
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                data.append(json.loads(line))
        return data

    def register_dataset(self, version: str, data: List[Dict]) -> None:
        """Registers a new immutable dataset version."""
        filepath = os.path.join(self.data_dir, f"dataset_{version}.jsonl")
        with open(filepath, 'w', encoding='utf-8') as f:
            for item in data:
                f.write(json.dumps(item) + '\n')
        print(f"Registered dataset {version} with {len(data)} samples.")
