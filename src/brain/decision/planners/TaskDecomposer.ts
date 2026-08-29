export class TaskDecomposer {
  public decompose(task: string): string[] {
    // For MVP, split by 'and' or commas to simulate semantic sub-task extraction
    if (task.includes('and')) {
       return task.split('and').map(t => t.trim());
    }
    return [task];
  }
}
