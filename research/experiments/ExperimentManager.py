import json
import os
import time

class ExperimentManager:
    """Tracks training configurations, hyperparameters, metrics, and artifacts."""
    
    def __init__(self, storage_dir: str):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        
    def start_experiment(self, experiment_id: str, config: dict):
        exp_path = os.path.join(self.storage_dir, f"{experiment_id}.json")
        data = {
            "experiment_id": experiment_id,
            "status": "running",
            "start_time": time.time(),
            "config": config,
            "metrics": []
        }
        with open(exp_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            
    def log_metrics(self, experiment_id: str, metrics: dict):
        exp_path = os.path.join(self.storage_dir, f"{experiment_id}.json")
        if not os.path.exists(exp_path):
            raise ValueError(f"Experiment {experiment_id} not found.")
            
        with open(exp_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        data["metrics"].append({
            "timestamp": time.time(),
            **metrics
        })
        
        with open(exp_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)

    def finish_experiment(self, experiment_id: str, status: str = "completed"):
        exp_path = os.path.join(self.storage_dir, f"{experiment_id}.json")
        with open(exp_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        data["status"] = status
        data["end_time"] = time.time()
        
        with open(exp_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
