---
title: "Serverless-Notify: Event-Driven Notifications with AWS Lambda"
date: "2024-09-25"
category: "Automation"
excerpt: "Building a serverless notification system using AWS Lambda, SNS, and EventBridge for real-time alerts."
---

Serverless-Notify is a project that demonstrates how to build an event-driven notification system using AWS serverless services. This architecture provides real-time alerts without managing any servers.

## Architecture Overview

The system uses the following AWS services:
- **AWS Lambda**: Processes events and sends notifications
- **Amazon SNS**: Delivers notifications via email, SMS, or other channels
- **Amazon EventBridge**: Routes events from various sources
- **Amazon DynamoDB**: Stores notification preferences and history

## Key Features

### Event-Driven Architecture

The system responds to various AWS events:
- EC2 instance state changes
- RDS backup completions
- CloudWatch alarms
- Custom application events

### Multi-Channel Notifications

Send notifications through multiple channels:
- Email via SNS
- SMS messages
- Slack webhooks
- Microsoft Teams
- Custom HTTP endpoints

### Flexible Routing

EventBridge rules allow sophisticated event routing:

```json
{
  "source": ["aws.ec2"],
  "detail-type": ["EC2 Instance State-change Notification"],
  "detail": {
    "state": ["stopped", "terminated"]
  }
}
```

## Implementation

### Lambda Function for Notifications

```python
import boto3
import json
import os

sns = boto3.client('sns')
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    # Parse the event
    event_source = event.get('source')
    detail_type = event.get('detail-type')
    detail = event.get('detail')
    
    # Get notification preferences
    table = dynamodb.Table(os.environ['PREFERENCES_TABLE'])
    preferences = table.get_item(Key={'event_type': detail_type})
    
    if preferences.get('Item'):
        # Send notification
        message = format_message(event_source, detail_type, detail)
        
        sns.publish(
            TopicArn=os.environ['SNS_TOPIC_ARN'],
            Subject=f"Alert: {detail_type}",
            Message=message
        )
        
        # Log notification
        log_notification(event, message)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Notification processed')
    }

def format_message(source, detail_type, detail):
    return f"""
    Event Source: {source}
    Event Type: {detail_type}
    Details: {json.dumps(detail, indent=2)}
    """

def log_notification(event, message):
    table = dynamodb.Table(os.environ['HISTORY_TABLE'])
    table.put_item(
        Item={
            'timestamp': str(event['time']),
            'event_id': event['id'],
            'message': message
        }
    )
```

### EventBridge Rule Configuration

```yaml
Resources:
  EC2StateChangeRule:
    Type: AWS::Events::Rule
    Properties:
      Description: "Trigger on EC2 state changes"
      EventPattern:
        source:
          - aws.ec2
        detail-type:
          - EC2 Instance State-change Notification
      State: ENABLED
      Targets:
        - Arn: !GetAtt NotificationFunction.Arn
          Id: NotificationTarget
```

### SNS Topic Setup

```yaml
NotificationTopic:
  Type: AWS::SNS::Topic
  Properties:
    DisplayName: ServerlessNotifications
    Subscription:
      - Endpoint: admin@example.com
        Protocol: email
```

## Advanced Features

### Notification Throttling

Prevent notification spam with DynamoDB:

```python
def should_send_notification(event_type):
    table = dynamodb.Table(os.environ['THROTTLE_TABLE'])
    
    response = table.get_item(Key={'event_type': event_type})
    
    if response.get('Item'):
        last_sent = response['Item']['last_sent']
        cooldown = response['Item']['cooldown_minutes']
        
        if (datetime.now() - last_sent).minutes < cooldown:
            return False
    
    # Update last sent time
    table.put_item(
        Item={
            'event_type': event_type,
            'last_sent': datetime.now().isoformat()
        }
    )
    
    return True
```

### Custom Notification Templates

Use different templates for different event types:

```python
TEMPLATES = {
    'ec2_stopped': """
    ⚠️ EC2 Instance Stopped
    Instance ID: {instance_id}
    Region: {region}
    Time: {time}
    """,
    'rds_backup_complete': """
    ✅ RDS Backup Completed
    Database: {db_identifier}
    Backup ID: {backup_id}
    Status: {status}
    """
}
```

## Deployment

Deploy using AWS SAM:

```bash
sam build
sam deploy --guided
```

Or using Terraform:

```hcl
resource "aws_lambda_function" "notification_handler" {
  filename      = "notification_handler.zip"
  function_name = "serverless-notify"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.lambda_handler"
  runtime       = "python3.11"
  
  environment {
    variables = {
      SNS_TOPIC_ARN = aws_sns_topic.notifications.arn
      PREFERENCES_TABLE = aws_dynamodb_table.preferences.name
    }
  }
}
```

## Monitoring

Track notification metrics with CloudWatch:

```python
cloudwatch = boto3.client('cloudwatch')

cloudwatch.put_metric_data(
    Namespace='ServerlessNotify',
    MetricData=[
        {
            'MetricName': 'NotificationsSent',
            'Value': 1,
            'Unit': 'Count',
            'Dimensions': [
                {'Name': 'EventType', 'Value': event_type}
            ]
        }
    ]
)
```

## Cost Optimization

- Use Lambda's free tier (1M requests/month)
- Implement notification throttling
- Use SNS filtering to reduce unnecessary invocations
- Set appropriate Lambda memory and timeout

## Conclusion

Serverless-Notify demonstrates how to build a scalable, cost-effective notification system using AWS serverless services. The event-driven architecture ensures real-time alerts while minimizing operational overhead.

GitHub: https://github.com/Saumil343/Serverless-Notify
