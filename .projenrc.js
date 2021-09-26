const { AwsCdkTypeScriptApp } = require('projen');
const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.95.2',
  defaultReleaseBranch: 'main',
  name: 'elt-with-dbt-demo',
  cdkDependencies: [
    '@aws-cdk/aws-codecommit',
    '@aws-cdk/aws-codepipeline-actions',
    '@aws-cdk/aws-codebuild',
    '@aws-cdk/aws-ecr',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-redshift',
    '@aws-cdk/aws-secretsmanager',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-ecs',
    '@aws-cdk/aws-iam',
  ]
});
project.synth();