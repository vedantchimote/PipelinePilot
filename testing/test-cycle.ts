import { wouldCreateCycle, detectCycle } from '../src/utils/dependency-graph';
import { Job_Node_Config } from '../src/types/pipeline';

function createJob(name: string, needs: string[] = []): Job_Node_Config {
  return {
    id: name,
    name: name,
    stage: 'test',
    script: ['test'],
    needs
  } as Job_Node_Config;
}

const jobs: Record<string, Job_Node_Config> = {
  A: createJob('A'),
  B: createJob('B', ['A']),
  C: createJob('C', ['B']),
  D: createJob('D', ['B']),
  E: createJob('E', ['C', 'D']),
};

console.log("=== Testing Dependency Graph Utils ===");

console.log("Current cycle (should be null):", detectCycle(jobs));

console.log("Can add A -> C? (A needs C)", wouldCreateCycle(jobs, 'A', 'C')); // true, C needs B needs A
console.log("Can add C -> A? (C needs A)", wouldCreateCycle(jobs, 'C', 'A')); // false, A doesn't need C

console.log("Can add B -> E? (B needs E)", wouldCreateCycle(jobs, 'B', 'E')); // true, E needs B

console.log("Can add F -> A? (F needs A, F is new)", wouldCreateCycle(jobs, 'F', 'A')); // false, F is new

// Create a cycle
const jobsWithCycle = {
    ...jobs,
    A: createJob('A', ['E'])
};
console.log("Cycle created in new graph:", detectCycle(jobsWithCycle)?.join(' -> '));

