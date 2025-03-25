/**
 * Example Pipeline Templates
 * Pre-built templates for common use cases
 */

import type { Template } from '@/types';

export const EXAMPLE_TEMPLATES: Template[] = [
  {
    id: 'example-nodejs',
    name: 'Node.js Pipeline',
    description: 'Complete Node.js pipeline with install, lint, test, build, and deploy stages',
    category: 'build',
    source: 'example',
    yaml: `stages:
  - install
  - lint
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

install_dependencies:
  stage: install
  image: node:\${NODE_VERSION}
  script:
    - npm ci
  cache:
    key: \${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

lint_code:
  stage: lint
  image: node:\${NODE_VERSION}
  script:
    - npm run lint
  needs:
    - install_dependencies

run_tests:
  stage: test
  image: node:\${NODE_VERSION}
  script:
    - npm run test
    - npm run test:coverage
  coverage: '/Lines\\s*:\\s*(\\d+\\.\\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
  needs:
    - install_dependencies

build_app:
  stage: build
  image: node:\${NODE_VERSION}
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
  needs:
    - lint_code
    - run_tests

deploy_production:
  stage: deploy
  image: node:\${NODE_VERSION}
  script:
    - npm run deploy
  environment:
    name: production
    url: https://example.com
  only:
    - main
  needs:
    - build_app
`,
  },
  {
    id: 'example-python',
    name: 'Python Pipeline',
    description: 'Python pipeline with setup, test, coverage, and deploy stages',
    category: 'test',
    source: 'example',
    yaml: `stages:
  - setup
  - test
  - coverage
  - deploy

variables:
  PYTHON_VERSION: "3.11"
  PIP_CACHE_DIR: "$CI_PROJECT_DIR/.cache/pip"

setup_environment:
  stage: setup
  image: python:\${PYTHON_VERSION}
  script:
    - pip install -r requirements.txt
  cache:
    key: \${CI_COMMIT_REF_SLUG}
    paths:
      - .cache/pip
      - venv/
  artifacts:
    paths:
      - venv/
    expire_in: 1 hour

lint_python:
  stage: test
  image: python:\${PYTHON_VERSION}
  script:
    - pip install flake8 black
    - flake8 .
    - black --check .
  needs:
    - setup_environment

run_unit_tests:
  stage: test
  image: python:\${PYTHON_VERSION}
  script:
    - pip install pytest pytest-cov
    - pytest tests/ -v
  needs:
    - setup_environment

generate_coverage:
  stage: coverage
  image: python:\${PYTHON_VERSION}
  script:
    - pip install pytest pytest-cov
    - pytest --cov=. --cov-report=xml --cov-report=term
  coverage: '/(?i)total.*? (100(?:\\.0+)?\\%|[1-9]?\\d(?:\\.\\d+)?\\%)$/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
  needs:
    - run_unit_tests

deploy_to_pypi:
  stage: deploy
  image: python:\${PYTHON_VERSION}
  script:
    - pip install twine build
    - python -m build
    - twine upload dist/*
  only:
    - tags
  needs:
    - generate_coverage
`,
  },
  {
    id: 'example-docker',
    name: 'Docker Pipeline',
    description: 'Docker pipeline with build, scan, and push stages',
    category: 'deploy',
    source: 'example',
    yaml: `stages:
  - build
  - scan
  - push

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG

build_image:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker build -t \${IMAGE_TAG} .
    - docker save \${IMAGE_TAG} -o image.tar
  artifacts:
    paths:
      - image.tar
    expire_in: 1 hour

scan_vulnerabilities:
  stage: scan
  image: aquasec/trivy:latest
  script:
    - trivy image --input image.tar --severity HIGH,CRITICAL --exit-code 0
  needs:
    - build_image
  allow_failure: true

scan_secrets:
  stage: scan
  image: trufflesecurity/trufflehog:latest
  script:
    - trufflehog filesystem . --json
  needs:
    - build_image
  allow_failure: true

push_to_registry:
  stage: push
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker load -i image.tar
    - echo \${CI_REGISTRY_PASSWORD} | docker login -u \${CI_REGISTRY_USER} --password-stdin \${CI_REGISTRY}
    - docker push \${IMAGE_TAG}
    - docker tag \${IMAGE_TAG} \${CI_REGISTRY_IMAGE}:latest
    - docker push \${CI_REGISTRY_IMAGE}:latest
  only:
    - main
    - tags
  needs:
    - scan_vulnerabilities
    - scan_secrets
`,
  },
];
