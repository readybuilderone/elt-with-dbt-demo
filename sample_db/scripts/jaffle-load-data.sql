copy raw_customers from 's3://<myBucket>/jaffle_shop/raw_customers.csv' 
credentials 'aws_iam_role=<iam-role-arn>' 
delimiter ',' region '<aws-region>'
IGNOREHEADER 1;

copy raw_orders from 's3://<myBucket>/jaffle_shop/raw_orders.csv' 
credentials 'aws_iam_role=<iam-role-arn>' 
delimiter ',' region '<aws-region>'
IGNOREHEADER 1;

copy raw_payments from 's3://<myBucket>/jaffle_shop/raw_payments.csv' 
credentials 'aws_iam_role=<iam-role-arn>' 
delimiter ',' region '<aws-region>'
IGNOREHEADER 1;