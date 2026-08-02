import json
import os

class DeploymentPreparation:
    """Generates Model Cards, evaluation reports, and license metadata."""
    
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        
    def generate_model_card(self, model_name: str, metadata: dict):
        card_content = f"""# Model Card: {model_name}

## Metadata
{json.dumps(metadata, indent=2)}

## Intended Use
This model is designed for Repository Intelligence within ProjectMind.
"""
        card_path = os.path.join(self.output_dir, f"{model_name}_MODEL_CARD.md")
        with open(card_path, 'w', encoding='utf-8') as f:
            f.write(card_content)
        print(f"Model Card generated at {card_path}")
