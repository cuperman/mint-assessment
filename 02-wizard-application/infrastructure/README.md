# HVAC Wizard Infrastructure

Uses [cdk-cluster](https://github.com/cuperman/cdk-cluster) to run Docker containers in an AWS ECS Cluster

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npm run cdk -- deploy`  deploy this stack to your default AWS account/region
* `npm run cdk -- diff`    compare deployed stack with current state
* `npm run cdk -- synth`   emits the synthesized CloudFormation template

## Specific commands

```bash
# specify the AWS account ID
export CDK_DEFAULT_ACCOUNT="123456789012"

# working with environment stacks
npm run cdk -- --app ./bin/mint-environment.ts list
npm run cdk -- --app ./bin/mint-environment.ts synth
npm run cdk -- --app ./bin/mint-environment.ts deploy --all

# working with instance stacks (default app)
npm run cdk -- list
npm run cdk -- synth
npm run cdk -- deploy --all
```
