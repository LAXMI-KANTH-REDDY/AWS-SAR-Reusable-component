import json
import logging
import os

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

ses_client = None


def get_ses_client():
    global ses_client

    if ses_client is not None:
        return ses_client

    if not os.environ.get("AWS_ACCESS_KEY_ID") and not os.environ.get("AWS_PROFILE"):
        logger.warning("No AWS credentials are configured for the local runtime; SES client initialization is deferred.")
        return None

    ses_client = boto3.client("ses", region_name=os.environ.get("AWS_REGION", "us-east-1"))
    return ses_client


def _validate_message(payload):
    if not isinstance(payload, dict):
        raise ValueError("Notification payload must be a JSON object.")

    missing_fields = [
        field for field in ("email", "subject", "message") if not payload.get(field)
    ]
    if missing_fields:
        raise ValueError(
            "Missing required notification field(s): " + ", ".join(missing_fields)
        )


def lambda_handler(event, context):
    logger.info("Received SNS event.")

    records = event.get("Records") if isinstance(event, dict) else None
    if not records:
        raise ValueError("No SNS records found in event.")

    processed_count = 0

    for record in records:
        sns_record = record.get("Sns", {})
        message = sns_record.get("Message")

        if not message:
            raise ValueError("SNS message is missing from a record.")

        try:
            payload = json.loads(message)
        except (TypeError, ValueError) as exc:
            logger.exception("Invalid SNS message JSON received.")
            raise ValueError(f"Invalid SNS message JSON: {exc}") from exc

        _validate_message(payload)

        sender_email = os.environ.get("SENDER_EMAIL")
        if not sender_email:
            raise RuntimeError("SENDER_EMAIL environment variable is not set.")

        email = payload["email"]
        subject = payload["subject"]
        text_message = payload["message"]

        email_client = get_ses_client()
        if email_client is None:
            raise RuntimeError("SES client could not be initialized. Configure AWS credentials or mock SES in local testing.")

        logger.info("Sending SES notification to recipient.")
        try:
            email_client.send_email(
                Source=sender_email,
                Destination={"ToAddresses": [email]},
                Message={
                    "Subject": {"Data": subject},
                    "Body": {"Text": {"Data": text_message}},
                },
            )
        except Exception:
            logger.exception("SES send_email failed for this notification.")
            raise

        logger.info("SES notification sent successfully.")
        processed_count += 1

    return {
        "statusCode": 200,
        "body": {
            "status": "success",
            "processed": processed_count,
        },
    }
