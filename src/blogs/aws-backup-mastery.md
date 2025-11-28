---
title: "AWS Backup Mastery: Cross-Account, Cross-Regional Immutable Backups for RDS"
date: "2024-11-10"
category: "AWS Backup"
excerpt: "Master advanced AWS Backup techniques including cross-account, cross-regional, and immutable backups for RDS with practical implementation."
---

Taking your AWS Backup strategy to the next level requires understanding advanced features like cross-account backups, cross-regional replication, and immutable backups. This guide provides practical implementation steps for RDS.

## Architecture Overview

A robust backup strategy for RDS should include:
- **Primary backups** in the same region
- **Cross-regional copies** for disaster recovery
- **Cross-account copies** for additional security
- **Immutable backups** to prevent tampering

## Cross-Account Backup Setup

### Step 1: Configure Backup Vault in Target Account

```bash
aws backup create-backup-vault \
  --backup-vault-name cross-account-vault \
  --region us-east-1
```

### Step 2: Set Backup Vault Access Policy

Create a policy that allows the source account to copy backups:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "arn:aws:iam::SOURCE-ACCOUNT-ID:root"
    },
    "Action": "backup:CopyIntoBackupVault",
    "Resource": "*"
  }]
}
```

### Step 3: Configure Copy Action in Source Account

In your backup plan, add a copy action:

```json
{
  "CopyActions": [{
    "DestinationBackupVaultArn": "arn:aws:backup:us-east-1:TARGET-ACCOUNT:backup-vault:cross-account-vault",
    "Lifecycle": {
      "MoveToColdStorageAfterDays": 30,
      "DeleteAfterDays": 365
    }
  }]
}
```

## Cross-Regional Backup Configuration

Enable cross-regional copies for disaster recovery:

```json
{
  "CopyActions": [{
    "DestinationBackupVaultArn": "arn:aws:backup:us-west-2:ACCOUNT-ID:backup-vault:dr-vault",
    "Lifecycle": {
      "DeleteAfterDays": 90
    }
  }]
}
```

## Implementing Immutable Backups

AWS Backup Vault Lock provides immutability:

### Enable Vault Lock

```bash
aws backup put-backup-vault-lock-configuration \
  --backup-vault-name immutable-vault \
  --min-retention-days 30 \
  --max-retention-days 365
```

### Key Benefits

- **Compliance**: Meet regulatory requirements (FINRA, SEC, HIPAA)
- **Ransomware Protection**: Backups cannot be deleted even by root user
- **Data Integrity**: Ensures backup retention policies are enforced

## Complete RDS Backup Plan

Here's a comprehensive backup plan for RDS:

```json
{
  "BackupPlanName": "rds-comprehensive-backup",
  "Rules": [{
    "RuleName": "daily-backup",
    "TargetBackupVaultName": "primary-vault",
    "ScheduleExpression": "cron(0 2 * * ? *)",
    "StartWindowMinutes": 60,
    "CompletionWindowMinutes": 120,
    "Lifecycle": {
      "MoveToColdStorageAfterDays": 30,
      "DeleteAfterDays": 365
    },
    "CopyActions": [
      {
        "DestinationBackupVaultArn": "arn:aws:backup:us-west-2:ACCOUNT:backup-vault:dr-vault",
        "Lifecycle": {
          "DeleteAfterDays": 90
        }
      },
      {
        "DestinationBackupVaultArn": "arn:aws:backup:us-east-1:TARGET-ACCOUNT:backup-vault:cross-account-vault",
        "Lifecycle": {
          "DeleteAfterDays": 365
        }
      }
    ]
  }]
}
```

## Monitoring and Alerts

Set up CloudWatch alarms for backup monitoring:

```python
import boto3

cloudwatch = boto3.client('cloudwatch')

cloudwatch.put_metric_alarm(
    AlarmName='backup-failure-alert',
    MetricName='NumberOfBackupJobsFailed',
    Namespace='AWS/Backup',
    Statistic='Sum',
    Period=3600,
    EvaluationPeriods=1,
    Threshold=1,
    ComparisonOperator='GreaterThanThreshold',
    AlarmActions=['arn:aws:sns:us-east-1:ACCOUNT:backup-alerts']
)
```

## Cost Optimization

- Use lifecycle policies to move old backups to cold storage
- Set appropriate retention periods based on compliance needs
- Monitor backup storage costs with AWS Cost Explorer
- Delete unnecessary backup copies

## Testing Your Backup Strategy

Regular testing is crucial:

1. **Monthly Restore Tests**: Restore a database to verify backup integrity
2. **Disaster Recovery Drills**: Practice cross-region failover
3. **Cross-Account Access Tests**: Verify access from target accounts
4. **Immutability Verification**: Attempt to delete locked backups

## Conclusion

Implementing cross-account, cross-regional, and immutable backups for RDS provides enterprise-grade data protection. This multi-layered approach ensures your data is protected against various failure scenarios and meets compliance requirements.
