#!/usr/bin/env ts-node
import { AppEnvironment } from '@cuperman/cdk-cluster';

// avoid committing account id to public repo
const accountId = process.env.CDK_DEFAULT_ACCOUNT;
if (!accountId) {
  throw new Error('CDK_DEFAULT_ACCOUNT environment variable is not set');
}

new AppEnvironment({
  name: 'MintEnvironment',
  account: accountId,
  regions: ['us-east-1'],
  defaults: {
    network: {
      description: 'Environment for Mint application instances',
      tags: {
        Application: 'Mint',
        Environment: 'Production',
        Service: 'Mint Network',
      },
      vpc: {
        vpcName: 'MintVpc',
        maxAzs: 2,
        natGateways: 1,
      },
    },
  },
});
