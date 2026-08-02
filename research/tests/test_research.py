import unittest
import os
import shutil
from research.datasets.DatasetManager import DatasetManager
from research.registry.ModelRegistry import ModelRegistry

class TestResearchPlatform(unittest.TestCase):
    def setUp(self):
        self.test_dir = "./test_workspace"
        os.makedirs(self.test_dir, exist_ok=True)
        
    def tearDown(self):
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
            
    def test_dataset_manager(self):
        dm = DatasetManager(f"{self.test_dir}/datasets")
        dm.register_dataset("v1", [{"test": "data"}])
        data = dm.load_dataset("v1")
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["test"], "data")
        
    def test_model_registry(self):
        registry = ModelRegistry(f"{self.test_dir}/registry")
        registry.register_model("pm-slm", "v1.0.0", {"metrics": {"accuracy": 0.9}})
        
        # Verify file exists
        self.assertTrue(os.path.exists(f"{self.test_dir}/registry/index.json"))

if __name__ == "__main__":
    unittest.main()
