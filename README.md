# Mint Home - Take Home Challenge

This repository contains my submission for the take home challenge.  Each excercise is documented in the respective README:

1. Concurrent Fibonacci (see [01-concurrent-fibonacci/README.md](./01-concurrent-fibonacci/README.md))
1. Wizard Application (see [02-wizard-application/README.md](./02-wizard-application/README.md))

Each project includes:

* Code that sovles the problem
* Unit tests
* Documentation
* Github Actions workflows (see [.github/workflows](./.github/workflows))
* Docker examples included in the Wizard Application

## Publishing Artifacts

To publish the artifacts, you'll need Github credentials.

1. Create a Github token with read/write/delete packages scopes
2. Add `//npm.pkg.github.com/:_authToken=YOUR_TOKEN` to your local ~/.npmrc

```bash
# publish fibonacci from the root
npm publish

# publish backend
cd 02-wizard-application/backend
npm publish
cd -

# publish frontend
cd 02-wizard-application/frontend
npm publish
cd -
```

To publish the docker images, use the same Github token:

```bash
# from the 02-wizard-application dir, build images with docker compose
cd 02-wizard-application
docker compose build

# log into ghcr.io using the same Github token when prompted for a password
docker login ghcr.io -u cuperman

# tag the images
docker tag mint-backend:latest ghcr.io/cuperman/mint-assessment/mint-backend:v0.1.0
docker tag mint-frontend:latest ghcr.io/cuperman/mint-assessment/mint-frontend:v0.1.0

# publish the images
docker push ghcr.io/cuperman/mint-assessment/mint-backend:v0.1.0
docker push ghcr.io/cuperman/mint-assessment/mint-frontend:v0.1.0

cd -
```

## Original Scope

Welcome to the Mint Home take home challenge! This repo contains two coding challenges that will help us evaluate your technical skills and problem-solving approach.

## Overview

At Mint Home, we’re revolutionizing HVAC replacements by empowering homeowners to:

- Get instant, AI-driven quotes, no in-home sales visits, all generated online in minutes 
- Compare transparent pricing options, including rebates and flexible financing 
- Schedule professional installation, as soon as the very next day 

We use software to simplify a traditionally complex, sales-heavy process, cutting out hassle and hidden fees while ensuring quality HVAC installations.

This take home challenge has been crafted to mirror real-world scenarios of our platform. It will assess your ability to build solutions using our stack and tackle scenarios similar to what our engineers face on a daily basis.

## Challenges

### 1. Concurrent Fibonacci (TypeScript)

**Location:** [01-concurrent-fibonacci](./01-concurrent-fibonacci)

Implement a concurrent memoized Fibonacci function in TypeScript. This challenge tests your understanding of:
- Algorithms
- Asynchronous programming
- Memoization techniques
- Handling concurrent operations efficiently


### 2. Multi-Step Wizard Application (Next.js & NestJS)

**Location:** [02-wizard-application](./02-wizard-application)

Create a simple full-stack application that simulates a multi-step quote request wizard for HVAC installation services. This challenge tests your ability to:
- Build a multi-step form with simple conditional logic
- Implement a RESTful API
- Work with a databases

## Submission Guidelines

1. For your submission, create a new public repository or provide a ZIP file with your complete solution, so we can run it locally.
2. Include clear documentation on how to run the solutions to both challenges.

Good luck! We look forward to reviewing your solutions.
