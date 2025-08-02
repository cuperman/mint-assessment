#!/usr/bin/env ts-node
import { AppInstance } from '@cuperman/cdk-cluster';

// avoid committing account id to public repo
const accountId = process.env.CDK_DEFAULT_ACCOUNT;
if (!accountId) {
  throw new Error('CDK_DEFAULT_ACCOUNT environment variable is not set');
}

new AppInstance({
  name: 'MintWizardApp',
  account: accountId,
  regions: ['us-east-1'],
  defaults: {
    registry: {
      description: 'Mint application image registries',
      tags: {
        Application: 'Mint',
        Environment: 'Production',
        Service: 'Mint Registry',
      },
      imageNames: [
        'mint-assessment/mint-backend',
        'mint-assessment/mint-frontend',
      ],
    },
  },
});
