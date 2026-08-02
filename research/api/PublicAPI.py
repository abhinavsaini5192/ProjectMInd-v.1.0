from typing import Dict, Any

from research.datasets.DatasetManager import DatasetManager
from research.training.FineTuningEngine import FineTuningEngine
from research.experiments.ExperimentManager import ExperimentManager
from research.evaluation.EvaluationFramework import EvaluationFramework
from research.registry.ModelRegistry import ModelRegistry

class ProjectMindResearchAPI:
    """Public API for interacting with the ProjectMind Research Platform."""
    
    def __init__(self, workspace_dir: str = "./workspace"):
        self.workspace_dir = workspace_dir
        self.dataset_mgr = DatasetManager(f"{workspace_dir}/datasets")
        self.exp_mgr = ExperimentManager(f"{workspace_dir}/experiments")
        self.registry = ModelRegistry(f"{workspace_dir}/registry")
        self.trainer = FineTuningEngine()
        self.evaluator = EvaluationFramework()

    def train(self, experiment_id: str, config: Dict[str, Any]):
        return self.trainer.train(None, config, self.exp_mgr, experiment_id)

    def evaluate(self, model_path: str):
        return self.evaluator.evaluate(model_path, None)
        
    def register_model(self, name: str, version: str, metadata: dict):
        return self.registry.register_model(name, version, metadata)
