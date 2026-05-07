import { validateJobConfig } from '../src/utils/validation';
import { Job_Node_Config } from '../src/types/pipeline';

const validJob: Partial<Job_Node_Config> = {
  id: 'job_1',
  name: 'job_1',
  stage: 'build',
  script: ['echo "Hello"']
};

const allJobs = { job_1: validJob as Job_Node_Config };

console.log("=== Testing Validation ===");

console.log("Valid state errors:", validateJobConfig(validJob, allJobs));

// Test empty script
const noScriptJob = JSON.parse(JSON.stringify(validJob));
noScriptJob.script = [];
console.log("Empty script errors:", validateJobConfig(noScriptJob, allJobs));

// Test invalid docker image
const invalidImageJob = JSON.parse(JSON.stringify(validJob));
invalidImageJob.image = "node:18|alpine"; // Pipe is invalid
console.log("Invalid image errors:", validateJobConfig(invalidImageJob, allJobs));

// Test variable with invalid characters
const invalidVarJob = JSON.parse(JSON.stringify(validJob));
invalidVarJob.variables = { "VAR NAME": "value" };
console.log("Invalid variable name errors:", validateJobConfig(invalidVarJob, allJobs));

// Test missing required stage
const missingStageJob = JSON.parse(JSON.stringify(validJob));
missingStageJob.stage = "";
console.log("Missing stage errors:", validateJobConfig(missingStageJob, allJobs));
