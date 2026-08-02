import json
import os

class ModelRegistry:
    """Maintains model versions, checkpoints, and deployment statuses."""
    
    def __init__(self, registry_dir: str):
        self.registry_dir = registry_dir
        os.makedirs(self.registry_dir, exist_ok=True)
        self.index_file = os.path.join(self.registry_dir, "index.json")
        if not os.path.exists(self.index_file):
            with open(self.index_file, 'w', encoding='utf-8') as f:
                json.dump({"models": {}}, f)
                
    def register_model(self, model_name: str, version: str, metadata: dict):
        with open(self.index_file, 'r', encoding='utf-8') as f:
            registry = json.load(f)
            
        if model_name not in registry["models"]:
            registry["models"][model_name] = {}
            
        registry["models"][model_name][version] = {
            "status": "registered",
            "metadata": metadata
        }
        
        with open(self.index_file, 'w', encoding='utf-8') as f:
            json.dump(registry, f, indent=2)
        print(f"Model {model_name} version {version} registered.")
        
    def promote_to_production(self, model_name: str, version: str):
        with open(self.index_file, 'r', encoding='utf-8') as f:
            registry = json.load(f)
            
        if model_name in registry["models"] and version in registry["models"][model_name]:
            registry["models"][model_name][version]["status"] = "production"
            with open(self.index_file, 'w', encoding='utf-8') as f:
                json.dump(registry, f, indent=2)
            print(f"Model {model_name} version {version} promoted to production.")
        else:
            raise ValueError(f"Model {model_name} v{version} not found.")
