---
title: "Automated S3 Security: Lambda Functions to the Rescue"
date: "2025-02-28"
category: "Automation"
excerpt: "Implementing automated security controls for S3 buckets using Lambda functions to prevent data breaches and ensure compliance."
---

S3 bucket misconfigurations are a leading cause of data breaches. In this post, we'll build automated security controls using Lambda functions to continuously monitor and remediate S3 security issues.

## The Problem

Common S3 security issues include:
- Publicly accessible buckets
- Missing encryption
- Disabled versioning
- No access logging
- Weak bucket policies

Manual monitoring doesn't scale and leaves windows of vulnerability.

## The Solution: Automated Security with Lambda

We'll create Lambda functions that automatically:
1. Detect security misconfigurations
2. Remediate issues in real-time
3. Send alerts for critical violations
4. Maintain compliance audit logs

## Architecture

```
S3 Event → EventBridge → Lambda → Remediation
                              ↓
                         CloudWatch Logs
                              ↓
                         SNS Alerts
```

## Implementation

### Lambda Function: Block Public Access

```python
import boto3
import json

s3 = boto3.client('s3')
sns = boto3.client('sns')

def lambda_handler(event, context):
    bucket_name = event['detail']['requestParameters']['bucketName']
    
    try:
        # Check if bucket is public
        acl = s3.get_bucket_acl(Bucket=bucket_name)
        
        is_public = any(
            grant['Grantee'].get('URI') == 'http://acs.amazonaws.com/groups/global/AllUsers'
            for grant in acl['Grants']
        )
        
        if is_public:
            # Block public access
            s3.put_public_access_block(
                Bucket=bucket_name,
                PublicAccessBlockConfiguration={
                    'BlockPublicAcls': True,
                    'IgnorePublicAcls': True,
                    'BlockPublicPolicy': True,
                    'RestrictPublicBuckets': True
                }
            )
            
            # Send alert
            send_alert(bucket_name, 'Public access blocked')
            
            return {
                'statusCode': 200,
                'body': json.dumps(f'Blocked public access for {bucket_name}')
            }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        send_alert(bucket_name, f'Failed to block public access: {str(e)}')
        raise

def send_alert(bucket_name, message):
    sns.publish(
        TopicArn='arn:aws:sns:us-east-1:ACCOUNT:s3-security-alerts',
        Subject=f'S3 Security Alert: {bucket_name}',
        Message=message
    )
```

### Lambda Function: Enable Encryption

```python
def enable_encryption(bucket_name):
    try:
        s3.put_bucket_encryption(
            Bucket=bucket_name,
            ServerSideEncryptionConfiguration={
                'Rules': [{
                    'ApplyServerSideEncryptionByDefault': {
                        'SSEAlgorithm': 'AES256'
                    },
                    'BucketKeyEnabled': True
                }]
            }
        )
        
        print(f"Enabled encryption for {bucket_name}")
        return True
        
    except Exception as e:
        print(f"Failed to enable encryption: {str(e)}")
        return False
```

### Lambda Function: Enable Versioning

```python
def enable_versioning(bucket_name):
    try:
        s3.put_bucket_versioning(
            Bucket=bucket_name,
            VersioningConfiguration={
                'Status': 'Enabled'
            }
        )
        
        print(f"Enabled versioning for {bucket_name}")
        return True
        
    except Exception as e:
        print(f"Failed to enable versioning: {str(e)}")
        return False
```

### Lambda Function: Enable Access Logging

```python
def enable_logging(bucket_name, log_bucket):
    try:
        s3.put_bucket_logging(
            Bucket=bucket_name,
            BucketLoggingStatus={
                'LoggingEnabled': {
                    'TargetBucket': log_bucket,
                    'TargetPrefix': f'{bucket_name}/'
                }
            }
        )
        
        print(f"Enabled logging for {bucket_name}")
        return True
        
    except Exception as e:
        print(f"Failed to enable logging: {str(e)}")
        return False
```

## EventBridge Rules

### Trigger on Bucket Creation

```json
{
  "source": ["aws.s3"],
  "detail-type": ["AWS API Call via CloudTrail"],
  "detail": {
    "eventName": ["CreateBucket"]
  }
}
```

### Trigger on Policy Changes

```json
{
  "source": ["aws.s3"],
  "detail-type": ["AWS API Call via CloudTrail"],
  "detail": {
    "eventName": [
      "PutBucketPolicy",
      "DeleteBucketPolicy",
      "PutBucketAcl"
    ]
  }
}
```

## Comprehensive Security Function

Combine all checks into one function:

```python
def lambda_handler(event, context):
    bucket_name = event['detail']['requestParameters']['bucketName']
    
    security_checks = {
        'public_access': check_public_access(bucket_name),
        'encryption': check_encryption(bucket_name),
        'versioning': check_versioning(bucket_name),
        'logging': check_logging(bucket_name)
    }
    
    # Remediate issues
    if not security_checks['public_access']:
        block_public_access(bucket_name)
    
    if not security_checks['encryption']:
        enable_encryption(bucket_name)
    
    if not security_checks['versioning']:
        enable_versioning(bucket_name)
    
    if not security_checks['logging']:
        enable_logging(bucket_name, os.environ['LOG_BUCKET'])
    
    # Log results
    log_security_check(bucket_name, security_checks)
    
    return {
        'statusCode': 200,
        'body': json.dumps(security_checks)
    }
```

## Deployment with Terraform

```hcl
resource "aws_lambda_function" "s3_security" {
  filename      = "s3_security.zip"
  function_name = "s3-security-automation"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.lambda_handler"
  runtime       = "python3.11"
  timeout       = 60
  
  environment {
    variables = {
      LOG_BUCKET = aws_s3_bucket.logs.id
      SNS_TOPIC  = aws_sns_topic.alerts.arn
    }
  }
}

resource "aws_cloudwatch_event_rule" "s3_events" {
  name        = "s3-security-events"
  description = "Capture S3 security events"
  
  event_pattern = jsonencode({
    source      = ["aws.s3"]
    detail-type = ["AWS API Call via CloudTrail"]
    detail = {
      eventName = [
        "CreateBucket",
        "PutBucketPolicy",
        "PutBucketAcl"
      ]
    }
  })
}

resource "aws_cloudwatch_event_target" "lambda" {
  rule      = aws_cloudwatch_event_rule.s3_events.name
  target_id = "S3SecurityLambda"
  arn       = aws_lambda_function.s3_security.arn
}
```

## Monitoring and Alerts

Create a dashboard to track security metrics:

```python
def create_dashboard():
    cloudwatch = boto3.client('cloudwatch')
    
    dashboard_body = {
        "widgets": [
            {
                "type": "metric",
                "properties": {
                    "metrics": [
                        ["S3Security", "PublicBucketsBlocked"],
                        [".", "EncryptionEnabled"],
                        [".", "VersioningEnabled"]
                    ],
                    "period": 300,
                    "stat": "Sum",
                    "region": "us-east-1",
                    "title": "S3 Security Remediations"
                }
            }
        ]
    }
    
    cloudwatch.put_dashboard(
        DashboardName='S3-Security',
        DashboardBody=json.dumps(dashboard_body)
    )
```

## Best Practices

1. **Test in Non-Production First**: Validate automation logic before production deployment
2. **Use IAM Conditions**: Restrict Lambda permissions to specific buckets if needed
3. **Implement Approval Workflows**: For critical buckets, require manual approval
4. **Regular Audits**: Schedule periodic security audits even with automation
5. **Document Exceptions**: Maintain a list of buckets that require special configurations

## Cost Considerations

- Lambda invocations: ~$0.20 per 1M requests
- CloudWatch Logs: ~$0.50 per GB
- SNS notifications: ~$0.50 per 1M notifications
- Typical monthly cost: < $5 for most organizations

## Conclusion

Automated S3 security using Lambda functions provides continuous protection against misconfigurations. This proactive approach significantly reduces the risk of data breaches while ensuring compliance with security policies.

The automation runs 24/7, responds in real-time, and scales effortlessly with your infrastructure.
