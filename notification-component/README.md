# Scholarship Notification Component

## Purpose

This component is a reusable AWS Serverless Application Model (SAM) project that listens for Amazon SNS notification messages and sends email through Amazon SES. It is intentionally independent from scholarship business logic and is designed to be reused by other serverless applications that need a lightweight notification pipeline.

The scholarship backend does not need to implement email-sending logic directly. It can publish a structured JSON message to an SNS topic, and this reusable component handles the SES email step.

This project has NOT been deployed to AWS and has NOT been published to AWS Serverless Application Repository.

## Architecture

SNS Topic
    |
    v
Lambda Notification Function
    |
    v
Amazon SES
    |
    v
Recipient Email

## Why this is reusable

The scholarship backend does not need to know anything about SES. It only publishes a notification payload with an email, subject, and message. Any future serverless application can reuse the same component as long as it emits a compatible SNS message.

## Prerequisites

- AWS SAM CLI installed locally
- Python 3.13 for the Lambda runtime
- An AWS account with an SES verified sender email address
- Local AWS credentials configured only if you later choose to test against AWS outside of the local SAM validation flow
- SES is often limited to the SES sandbox until the account is moved out of sandbox mode

## Input format

The Lambda expects an SNS payload whose message body is valid JSON in the following format:

```json
{
  "email": "student@example.com",
  "subject": "Scholarship Application Received",
  "message": "Your scholarship application SCH-12345678 has been received successfully."
}
```

## Environment variables

The function expects one environment variable:

- `SENDER_EMAIL` — a verified SES sender address configured in the SAM template via the `SenderEmail` parameter.

This value is not hard-coded in the source code.

## How the Lambda works

The function:

1. Receives an SNS event.
2. Validates that records exist.
3. Reads the SNS message from each record.
4. Parses the message as JSON.
5. Validates required fields: `email`, `subject`, and `message`.
6. Sends the message with Amazon SES.
7. Logs the result to CloudWatch Logs.
8. Returns a structured success response only after successful processing.

Malformed JSON, missing required fields, and failed SES calls raise exceptions so the Lambda invocation fails rather than silently reporting success.

## How SNS triggers Lambda

The SAM template creates an SNS topic and subscribes the Lambda to it using the AWS SAM SNS event source. When the topic receives a message, Lambda processes it and sends the notification via SES.

## How Lambda uses SES

The Lambda uses the AWS SDK for Python (`boto3`) to call `ses.send_email`. It sends a plain-text email with:

- Source: `SENDER_EMAIL`
- Destination: the email from the SNS message
- Subject: the subject from the SNS message
- Body: the message from the SNS message

## Local testing

A sample event file is included at `events/sns-event.json` for local testing.

### SAM validation

```bash
sam validate
```

### SAM build

```bash
sam build
```

### Unit tests

```bash
python -m pytest -q
```

### Local function invocation

If Docker is available, you can invoke the Lambda locally with the sample event:

```bash
sam local invoke --event events/sns-event.json
```

This will run the function locally without creating AWS resources. Because the function sends email through SES, you should mock or isolate SES behavior in local testing if you are validating logic beyond syntax and packaging.

## Deployment and SAR notes

This project is intentionally prepared for a later deployment workflow, but it is not deployed here. The next phase would be to configure the AWS SAM parameter values, validate the stack locally, and then deploy a stack only when you are ready.

This application is designed to be reusable and can later be published to the AWS Serverless Application Repository (SAR). The template includes the required `AWS::ServerlessRepo::Application` metadata, but it is not yet intended to be a public release and should not be treated as already published.

## Duplicate event limitation

SNS and Lambda processing are asynchronous. Duplicate deliveries can happen in real event-driven systems, especially during retries or network disruptions. This component does not include a database-backed idempotency mechanism. Production systems may need idempotency protection or deduplication logic before processing email notifications repeatedly.

## Security considerations

- No credentials are stored in the project files.
- The SES sender address is supplied through an environment variable.
- IAM permissions are limited to the SES actions needed for email sending: `ses:SendEmail`.
- No broad administrative permissions are granted.
- CloudWatch logging is used for operational visibility without exposing sensitive credentials.
- The project does not include AWS access keys, secret keys, passwords, or tokens.

## Limitations

- This component is a notification processor only. It does not handle scholarship eligibility, business validation, or database logic.
- SES requires a verified sender address before emails can be sent successfully in AWS.
- SES may require account sandbox configuration before sending to non-verified recipients.
- Local invocation does not create AWS resources or publish to AWS.
- This is a demonstration component for a larger serverless architecture and is intentionally simple.

## Example SNS message

```json
{
  "email": "student@example.com",
  "subject": "Scholarship Application Received",
  "message": "Your scholarship application SCH-12345678 has been received successfully."
}
```

## Example expected email

Subject: Scholarship Application Received

Body:

Your scholarship application SCH-12345678 has been received successfully.

## License

This project is licensed under the Apache License 2.0.
