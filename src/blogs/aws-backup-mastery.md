---
title: "AWS Backup Mastery: Navigating Cross-Account, Cross-Regional Immutable Backups for RDS"
date: "2025-05-07"
category: "AWS Backup"
excerpt: "Master advanced AWS Backup techniques including cross-account, cross-regional, and immutable backups for RDS with practical step-by-step implementation."
---

**Authors:** Piyush Jalan, Saumil Shah  
**Service Category:** Backup & DR / CIA Resiliency

## Introduction

In the realm of tech, data safety is non-negotiable, and AWS Backup emerges as the superhero in this narrative. This blog unlocks the perks of savvy backups, spanning different accounts and regions, ensuring the fortification of your data.

This blog begins by addressing a quirk—certain AWS services, like RDS, can't execute backups across accounts and regions simultaneously. No sweat! This blog will walk you through a step-by-step plan. First, let's set up cross-regional backups to lay a solid foundation. Once that's nailed, this blog will guide you on extending this safety net across different AWS accounts, giving your data a superhero cape ready for any digital challenge.

## Considerations

- **Primary region:** us-east-1
- **Backup region:** us-east-2
- **Retention in backup account:** 30 days (Customizable in Python Lambda code)

## Step-by-Step Guide

### 1. Create a Backup Vault in Backup Account (Backup Region)

Establish a vault for storing immutable backups, a secure haven for your critical data.

![Create Backup Vault](/Saumils-blog/images/aws-backup-mastery/step1.png)

### 2. Set up an Immutable Vault Lock

Secure your vault by implementing an immutable vault lock, adding an extra layer of protection against accidental modifications or deletions.

![Immutable Vault Lock Configuration](/Saumils-blog/images/aws-backup-mastery/step2.png)

### 3. Create a KMS-CMK in Workload Account (Backup Region)

Generate a Key Management Service (KMS) key with a 'Single region & Symmetric key' configuration, enhancing data security in your workload account, which is shared with backup account for seamless transmission of backups from workload account to backup account.

![KMS Key Creation](/Saumils-blog/images/aws-backup-mastery/step3.png)

#### Key Policy for KMS key:

```json
{
    "Id": "key-consolepolicy-3",
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Enable IAM User Permissions",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::{workload-account-number}:root"
            },
            "Action": "kms:*",
            "Resource": "*"
        },
        {
            "Sid": "Allow use of the key",
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "arn:aws:iam::{backup-account-number}:root",
                    "arn:aws:iam::{workload-account-number}:root"
                ]
            },
            "Action": [
                "kms:Encrypt",
                "kms:Decrypt",
                "kms:ReEncrypt*",
                "kms:GenerateDataKey*",
                "kms:DescribeKey"
            ],
            "Resource": "*"
        },
        {
            "Sid": "Allow attachment of persistent resources",
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "arn:aws:iam::{backup-account-number}:root",
                    "arn:aws:iam::{workload-account-number}:root"
                ]
            },
            "Action": [
                "kms:CreateGrant",
                "kms:ListGrants",
                "kms:RevokeGrant"
            ],
            "Resource": "*",
            "Condition": {
                "Bool": {
                    "kms:GrantIsForAWSResource": "true"
                }
            }
        }
    ]
}
```

### 4. Create Backup Vault in Workload Account (Backup Region)

Establish a backup vault in the workload account, utilizing the KMS key created in the previous step to ensure a secure backup environment.

![Workload Account Backup Vault](/Saumils-blog/images/aws-backup-mastery/step4.png)

### 5. Set Up Backup Vaults in Primary Region (Workload Account)

Create backup vaults in the primary region, laying the groundwork for efficient data backup and recovery.

![Primary Region Vault Setup](/Saumils-blog/images/aws-backup-mastery/step5.png)

### 6. Create a Backup Plan for RDS in Workload Account

Develop a backup plan with a daily frequency set for 8 pm IST, ensuring a consistent and reliable backup schedule for your RDS instances.

![Backup Plan Configuration](/Saumils-blog/images/aws-backup-mastery/step6.png)

### 7. Copy Configuration to Intermediate Vault

Configure copy settings to an intermediate vault in the backup region, streamlining the process of moving backups between regions.

![Copy Configuration](/Saumils-blog/images/aws-backup-mastery/step7.png)

### 8. Add Crucial Tags

Enhance backup management by adding tags; a key tag to include is 'FinalVault' with a value representing the ARN of the backup vault in the backup account in the backup region.

![Tag Configuration](/Saumils-blog/images/aws-backup-mastery/step8.png)

### 9. Create Lambda Function in Workload Account (Backup Region)

Implement a Lambda function using any runtime environment to automate AWS Backup copy jobs, enhancing the efficiency of your backup strategy. The lambda function would be responsible for initiating a copy job from secondary region of workload account to backup account.

```python
import boto3

def lambda_handler(event, context):
    # Main lambda function to invoke AWS Backup copy job
    try:
        eventDetail = event.get('detail')
        if eventDetail:
            # Fetching parameters from event
            jobState = eventDetail.get('state')
            destinationBackupVaultArn = eventDetail.get('destinationBackupVaultArn')
            iamRoleArn = eventDetail.get('iamRoleArn')
            backupVaultName = destinationBackupVaultArn.split(':')[-1]
            destinationRecoveryPointArn = eventDetail.get('destinationRecoveryPointArn')
        
        if 'COMPLETED' == jobState:  # Ensuring the config work on 'COMPLETE'
            backup_client = boto3.client('backup')
            response = backup_client.list_tags(ResourceArn=destinationRecoveryPointArn)
            tag_list = response.get('Tags')
            print(f'tag_list from Copy Job: {tag_list}')
            
            for key in tag_list:
                # Fetching tag from recovery points, to identify and copy RDS to final vault
                if key.lower() == 'FinalVault'.lower():
                    destinationVaultArn = tag_list[key]
                    print(f'Copying {destinationRecoveryPointArn} to {destinationVaultArn} from {backupVaultName}')
                    
                    # Initiating a copy job from intermediate to final vault
                    response = backup_client.start_copy_job(
                        RecoveryPointArn=destinationRecoveryPointArn,
                        SourceBackupVaultName=backupVaultName,
                        DestinationBackupVaultArn=destinationVaultArn,
                        IamRoleArn=iamRoleArn,
                        # Retention period for final recovery point
                        Lifecycle={
                            'DeleteAfterDays': 30
                        }
                    )
                    print(f'start_copy_job done: {response}')
    
    except Exception as e:
        print(e)
```

### 10. Create EventBridge Rule in Workload Account (Backup Region)

Develop an EventBridge rule to trigger the Lambda function upon completion of a copy job, enhancing automation and responsiveness. Don't forget to update the backup plan id in below code with newly created backup plan.

![EventBridge Rule Configuration](/Saumils-blog/images/aws-backup-mastery/step9.png)

#### Event Pattern:

```json
{
    "source": ["aws.backup"],
    "detail-type": ["Copy Job State Change"],
    "detail": {
        "createdBy": {
            "backupPlanId": ["6d0fefcf-t4a4-46c2-9d87-770c506f4e54"]
        }
    }
}
```

### 11. Add Resource-Based Policy to Lambda Function

Strengthen Lambda function security by adding a resource-based policy, allowing the EventBridge rule to invoke it seamlessly.

### 12. Create EventBridge Rule in Workload Account (Primary Region)

Establish a second EventBridge rule in the primary region to trigger the EventBridge rule in the backup region upon completion of a copy job. Don't forget to update the backup plan id in below code with newly created backup plan.

#### Event Pattern:

```json
{
    "source": ["aws.backup"],
    "detail-type": ["Copy Job State Change"],
    "detail": {
        "createdBy": {
            "backupPlanId": ["6d0fefcf-t4a4-46c2-9d87-770c506f4e54"]
        }
    }
}
```

## Final Flourish for Security and Management

You can utilize AWS Organizations to manage the backups:

- **SCPs** can be used to enhance the security of backups
- **Least privileged IAM roles** with IAM policies should be used for backup plan and lambda function
- **Regular audits** of backup policies and access controls
- **Monitoring** with CloudWatch for backup job status

## Conclusion

By following these steps, you'll successfully implement a robust cross-account, cross-regional immutable backup solution for your RDS instances using AWS Backup, ensuring the safety and integrity of your critical data.

This comprehensive approach provides:
- **Multi-layer protection** across accounts and regions
- **Immutability** to prevent accidental or malicious deletions
- **Automation** through Lambda and EventBridge
- **Compliance** with data retention requirements
- **Disaster recovery** capabilities for business continuity
