#!/usr/bin/env ts-node
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
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
  primaryRegion: 'us-east-1',
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
    documentDatabase: {
      description: 'Mint document database (MongoDB interface)',
      vpc: {
        vpcName: 'MintVpc',
      },
      masterUser: {
        username: 'master',
        excludeCharacters: '@"\\/?:#[]{}=;%+&$\'', // consider removing single quote at the end before committing
      },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MEDIUM,
      ),
    },
    cluster: {
      description: 'Mint container cluster',
      tags: {
        Application: 'Mint',
        Environment: 'Production',
        Service: 'Mint Cluster',
      },
      vpc: {
        vpcName: 'MintVpc',
      },
      zone: {
        domainName: 'jeffws.com',
      },
      fqdn: 'mint.jeffws.com',
      clusterName: 'MintWizard',
      services: [
        {
          image: {
            imageName: 'mint-assessment/mint-backend',
            imageTag: 'v0.1.0',
          },
          environmentVariables: {
            NODE_ENV: 'production',
            MONGODB_DATABASE: 'wizard_app',
          },
          documentDatabaseSecrets: {
            environmentVariables: {
              MONGODB_HOST: 'host',
              MONGODB_PORT: 'port',
              MONGODB_USERNAME: 'username',
              MONGODB_PASSWORD: 'password',
              MONGODB_SSL: 'ssl',
            },
          },
          targets: [
            {
              containerPort: 3001,
              healthCheck: {
                path: '/api/health',
              },
              priority: 1,
              conditions: [elbv2.ListenerCondition.pathPatterns(['/api/*'])],
            },
          ],
        },
        {
          image: {
            imageName: 'mint-assessment/mint-frontend',
            imageTag: 'v0.1.0',
          },
          targets: [
            {
              containerPort: 3000,
              healthCheck: {
                path: '/',
              },
              priority: 2,
              conditions: [elbv2.ListenerCondition.pathPatterns(['/*'])],
            },
          ],
        },
      ],
    },
  },
});
