import { fromYAML, toYAML } from '../src/engine/yaml-engine';
import { PipelineState } from '../src/types/pipeline';
import * as fs from 'fs';

const complexYaml = `
stages:
  - build
  - test
  - deploy
  - cleanup

variables:
  GLOBAL_VAR: "true"
  ENV_NAME: "production"

build_job:
  stage: build
  image: node:18-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
      - coverage/
    expire_in: 1 week
  cache:
    key: \${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  tags:
    - docker
    - linux
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: always
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      when: manual

test_job:
  stage: test
  needs:
    - build_job
  script:
    - npm run test
  variables:
    TEST_LEVEL: "unit"
  allow_failure: true

deploy_job:
  stage: deploy
  needs:
    - test_job
  script:
    - echo "Deploying..."
  environment:
    name: production

.hidden_job:
  script:
    - echo "This is hidden"
`;

async function runTests() {
  console.log("=== Testing YAML Parser (fromYAML) ===");
  try {
    const state = fromYAML(complexYaml);
    console.log("Parsed Stages:", state.stages);
    console.log("Parsed Global Variables:", state.global.variables);
    console.log("Parsed Jobs Count:", Object.keys(state.jobs).length);
    
    const buildJob = Object.values(state.jobs).find(j => j.name === 'build_job');
    console.log("Build Job Rules:", buildJob?.rules);
    console.log("Build Job Tags:", buildJob?.tags);
    console.log("Build Job Artifacts:", buildJob?.artifacts);
    
    console.log("\n=== Testing YAML Generator (toYAML) ===");
    const generatedYaml = toYAML(state);
    console.log("Generated YAML starts with 'stages:'?", generatedYaml.startsWith('stages:'));
    console.log("Contains 'GLOBAL_VAR'?", generatedYaml.includes('GLOBAL_VAR'));
    console.log("Contains 'build_job' artifacts?", generatedYaml.includes('dist/'));
    console.log("Contains 'allow_failure: true'?", generatedYaml.includes('allow_failure: true'));
    
    // Check if the generated YAML can be parsed back (round-trip)
    const state2 = fromYAML(generatedYaml);
    console.log("\n=== Round-trip Test ===");
    console.log("Stage match:", JSON.stringify(state.stages) === JSON.stringify(state2.stages));
    console.log("Jobs count match:", Object.keys(state.jobs).length === Object.keys(state2.jobs).length);

  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTests();
