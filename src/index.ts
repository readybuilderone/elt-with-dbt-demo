import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as redshift from '@aws-cdk/aws-redshift';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';

export class DBTRedshift extends cdk.Construct {
    private readonly RedshiftUser = 'redshift-user';
    private readonly RedshiftDB = 'redshift-db';

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        const vpc = this._createVPC();
        const dbtBucket = this._createDBTBucket();
        const redshiftSecret = this._createRedshiftSecret();
        const redshift = this._createRedshiftCluster(vpc, redshiftSecret, dbtBucket);
        new cdk.CfnOutput(this, 'redshift-host', {
            value: redshift.clusterEndpoint.hostname,
            exportName: 'RedshiftHost'
        });
        new cdk.CfnOutput(this, 'dbt-bucket', {
            value: dbtBucket.bucketName,
            exportName: 'BucketName',
        });
    }

    private _createVPC() {
        return new ec2.Vpc(this, 'dataops-vpc', {
            maxAzs: 2,
            natGateways: 1,
        });
    }


    private _createRedshiftSecret() {
        return new secretsmanager.Secret(this, 'redshift-credentials', {
            secretName: 'redshift-credentials',
            generateSecretString: {
                secretStringTemplate: '{"username":"redshift-user"}',
                generateStringKey: 'password',
                passwordLength: 32,
                excludeCharacters: '\"@/',
                excludePunctuation: true,
            },
        });
    }

    private _createRedshiftCluster(vpc: ec2.IVpc, redshiftSecret: secretsmanager.ISecret, dataBucket: s3.IBucket): redshift.ICluster {
        const subnetGroup = new redshift.ClusterSubnetGroup(this, 'RedshiftSubnetGroup', {
            description: 'Redshift Private Subnet Group',
            vpc,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC,
            },
        });

        const redshiftRole = new iam.Role(this, 'redshift-role', {
            assumedBy: new iam.ServicePrincipal('redshift.amazonaws.com'),
        });
        dataBucket.grantRead(redshiftRole);

        new cdk.CfnOutput(this, 'redshift-role-arn', {
            value: redshiftRole.roleArn,
            description: 'RedshiftRoleARN',
        })

        const redshiftCluster = new redshift.Cluster(this, 'redshift-cluster', {
            vpc,
            masterUser: {
                masterUsername: this.RedshiftUser,
                masterPassword: redshiftSecret.secretValueFromJson('password'),
            },
            clusterName: 'redshift-cluster',
            clusterType: redshift.ClusterType.SINGLE_NODE,
            defaultDatabaseName: this.RedshiftDB,
            publiclyAccessible: true,
            subnetGroup,
            roles:[redshiftRole],
        });

        redshiftCluster.connections.allowDefaultPortFromAnyIpv4('Just for Demo Purpose');
        return redshiftCluster;
    }

    private _createDBTBucket(): s3.IBucket {
        const bucketName = `dbt-bucket-${Math.floor(Math.random() * 1000001)}`;
        const dbtBucket = new s3.Bucket(this, 'DBTBucket', {
            bucketName,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            blockPublicAccess: new s3.BlockPublicAccess({
                blockPublicAcls: true,
                blockPublicPolicy: true,
                ignorePublicAcls: true,
                restrictPublicBuckets: true,
            }),
            autoDeleteObjects: true,
        });
        return dbtBucket;
    }
}