# Scholarship Portal Backend

This project provides the main AWS SAM backend for the scholarship application workflow.

## Architecture

- API Gateway HTTP API
- AWS Lambda (`ScholarshipPortalAPI`)
- DynamoDB table: `ScholarshipApplications`
- Existing SNS topic: `ScholarshipNotificationTopic`
- Reusable notification component already deployed through AWS Serverless Application Repository

## API endpoints

### POST /applications
Creates a new scholarship application.

Required JSON fields:
- `name`
- `email`
- `phone`
- `course`
- `college`
- `scholarship`

### GET /applications/{applicationId}
Retrieves an application by ID.

## Environment variables

- `TABLE_NAME` — DynamoDB table name
- `NOTIFICATION_TOPIC_ARN` — existing SNS topic ARN

## Local validation

```bash
sam validate
sam build
pytest
```

## Notes

- This project intentionally does not create a new SNS topic or another notification component.
- It publishes to the existing notification topic that was already created by the SAR component.
- No AWS resources are created during this local-only development stage.
