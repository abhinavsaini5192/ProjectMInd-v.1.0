import argparse
from research.api.PublicAPI import ProjectMindResearchAPI

def cli():
    parser = argparse.ArgumentParser(description="ProjectMind Research Platform CLI")
    subparsers = parser.add_subparsers(dest="command")
    
    train_parser = subparsers.add_parser("train", help="Train a model")
    train_parser.add_argument("--experiment-id", type=str, required=True)
    
    eval_parser = subparsers.add_parser("evaluate", help="Evaluate a model")
    eval_parser.add_argument("--model-path", type=str, required=True)
    
    args = parser.parse_args()
    api = ProjectMindResearchAPI()
    
    if args.command == "train":
        api.train(args.experiment_id, {"epochs": 1})
    elif args.command == "evaluate":
        api.evaluate(args.model_path)
    else:
        parser.print_help()

if __name__ == "__main__":
    cli()
