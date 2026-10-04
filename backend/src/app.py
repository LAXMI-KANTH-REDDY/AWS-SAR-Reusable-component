import json
import logging
import os
import uuid
from datetime import datetime, timezone

import boto3


# ============================================================
# LOGGING
# ============================================================

logger = logging.getLogger()
logger.setLevel(logging.INFO)


# ============================================================
# CONFIGURATION
# ============================================================

REQUIRED_FIELDS = [
    "name",
    "email",
    "phone",
    "course",
    "college",
    "scholarship",
]

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
}


# ============================================================
# AWS CLIENT HELPERS
# ============================================================

def get_table():
    """
    Return the DynamoDB scholarship applications table.
    """

    dynamodb = boto3.resource(
        "dynamodb",
        region_name=os.environ.get(
            "AWS_REGION",
            "us-east-1",
        ),
    )

    return dynamodb.Table(
        os.environ["TABLE_NAME"]
    )


def get_sns_client():
    """
    Return the SNS client used for notifications.
    """

    return boto3.client(
        "sns",
        region_name=os.environ.get(
            "AWS_REGION",
            "us-east-1",
        ),
    )


# ============================================================
# HTTP RESPONSE
# ============================================================

def json_response(status_code, payload):
    """
    Build a standard API response.
    """

    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(payload),
    }


# ============================================================
# REQUEST BODY
# ============================================================

def parse_json_body(event):
    """
    Parse the JSON request body.
    """

    raw_body = event.get("body")

    if raw_body is None or raw_body == "":
        raise ValueError(
            "Request body is required."
        )

    try:
        return json.loads(raw_body)

    except (TypeError, ValueError) as exc:
        logger.exception(
            "Malformed JSON received in request body."
        )

        raise ValueError(
            "Malformed JSON"
        ) from exc


# ============================================================
# VALIDATION
# ============================================================

def validate_required_fields(payload):
    """
    Validate all required scholarship application fields.
    """

    missing_fields = [
        field
        for field in REQUIRED_FIELDS
        if not payload.get(field)
    ]

    if missing_fields:
        raise ValueError(
            f"Missing required fields: "
            f"{', '.join(missing_fields)}"
        )


# ============================================================
# APPLICATION ID
# ============================================================

def generate_application_id():
    """
    Generate a unique scholarship application ID.

    Example:
        SCH-A81F29CD
    """

    return (
        "SCH-"
        + uuid.uuid4().hex[:8].upper()
    )


# ============================================================
# TIMESTAMP
# ============================================================

def utc_now_iso8601():
    """
    Generate the current UTC timestamp.
    """

    return (
        datetime.now(timezone.utc)
        .isoformat()
        .replace("+00:00", "Z")
    )


# ============================================================
# SNS MESSAGE
# ============================================================

def build_sns_message(
    payload,
    application_id,
    status,
):
    """
    Build the standardized notification message
    consumed by the reusable SAR notification component.
    """

    subject = "Scholarship Application Submitted"

    message = (
        f"Dear {payload['name']}, "
        f"your scholarship application "
        f"{application_id} has been submitted successfully."
    )

    return {
        # Required by the reusable notification component
        "subject": subject,
        "message": message,

        # Scholarship application information
        "applicationId": application_id,
        "email": payload["email"],
        "name": payload["name"],
        "scholarship": payload["scholarship"],
        "status": status,
    }


# ============================================================
# POST /applications
# ============================================================

def handle_post_application(event):
    """
    Create and store a scholarship application,
    then publish a notification to SNS.
    """

    # --------------------------------------------------------
    # Parse request
    # --------------------------------------------------------

    payload = parse_json_body(event)

    # --------------------------------------------------------
    # Validate request
    # --------------------------------------------------------

    validate_required_fields(payload)

    # --------------------------------------------------------
    # Generate application information
    # --------------------------------------------------------

    application_id = generate_application_id()

    submitted_at = utc_now_iso8601()

    # --------------------------------------------------------
    # Build DynamoDB item
    # --------------------------------------------------------

    item = {
        "applicationId": application_id,
        "name": payload["name"],
        "email": payload["email"],
        "phone": payload["phone"],
        "course": payload["course"],
        "college": payload["college"],
        "scholarship": payload["scholarship"],
        "status": "SUBMITTED",
        "submittedAt": submitted_at,
    }

    # --------------------------------------------------------
    # Save application to DynamoDB
    # --------------------------------------------------------

    table = get_table()

    try:
        table.put_item(
            Item=item
        )

    except Exception:
        logger.exception(
            "DynamoDB put_item failed "
            "while saving application."
        )

        return json_response(
            500,
            {
                "message":
                    "Unable to submit application"
            },
        )

    # --------------------------------------------------------
    # Get SNS topic ARN
    # --------------------------------------------------------

    topic_arn = os.environ.get(
        "NOTIFICATION_TOPIC_ARN"
    )

    if not topic_arn:
        raise RuntimeError(
            "NOTIFICATION_TOPIC_ARN "
            "environment variable is not set."
        )

    # --------------------------------------------------------
    # Build notification message
    # --------------------------------------------------------

    sns_message = build_sns_message(
        payload,
        application_id,
        "SUBMITTED",
    )

    sns_client = get_sns_client()

    # --------------------------------------------------------
    # Publish notification to SNS
    # --------------------------------------------------------

    try:
        sns_client.publish(
            TopicArn=topic_arn,
            Message=json.dumps(
                sns_message
            ),
            Subject=(
                "Scholarship Application "
                "Submitted"
            ),
        )

    except Exception:
        logger.exception(
            "SNS publish failed while "
            "notifying application submission."
        )

        return json_response(
            500,
            {
                "message":
                    "Unable to submit application"
            },
        )

    # --------------------------------------------------------
    # Successful response
    # --------------------------------------------------------

    return json_response(
        201,
        {
            "message":
                "Scholarship application "
                "submitted successfully",

            "applicationId":
                application_id,

            "status":
                "SUBMITTED",
        },
    )


# ============================================================
# GET /applications/{applicationId}
# ============================================================

def handle_get_application(event):
    """
    Retrieve a scholarship application
    from DynamoDB.
    """

    # --------------------------------------------------------
    # Get path parameters
    # --------------------------------------------------------

    path_params = (
        event.get("pathParameters")
        or {}
    )

    application_id = (
        path_params.get(
            "applicationId"
        )
    )

    # --------------------------------------------------------
    # Validate application ID
    # --------------------------------------------------------

    if not application_id:

        return json_response(
            404,
            {
                "message":
                    "Application not found"
            },
        )

    # --------------------------------------------------------
    # Get DynamoDB table
    # --------------------------------------------------------

    table = get_table()

    # --------------------------------------------------------
    # Retrieve application
    # --------------------------------------------------------

    try:
        response = table.get_item(
            Key={
                "applicationId":
                    application_id
            }
        )

    except Exception:
        logger.exception(
            "DynamoDB get_item failed "
            "while fetching application."
        )

        return json_response(
            500,
            {
                "message":
                    "Unable to retrieve application"
            },
        )

    # --------------------------------------------------------
    # Check result
    # --------------------------------------------------------

    item = response.get(
        "Item"
    )

    if not item:

        return json_response(
            404,
            {
                "message":
                    "Application not found"
            },
        )

    # --------------------------------------------------------
    # Return application
    # --------------------------------------------------------

    return json_response(
        200,
        item,
    )


# ============================================================
# LAMBDA HANDLER
# ============================================================

def lambda_handler(event, context):
    """
    Main Lambda handler.

    Supports:

    1. API Gateway HTTP API payload format 2.0

       event["requestContext"]["http"]["method"]
       event["requestContext"]["http"]["path"]

    2. Legacy/SAM/test event format

       event["httpMethod"]
       event["path"]

    API Gateway may include the stage name in the path:

       /prod/applications

    The application internally uses:

       /applications

    Therefore the stage prefix is removed before routing.
    """

    # ========================================================
    # API GATEWAY HTTP API V2
    # ========================================================

    request_context = (
        event.get(
            "requestContext",
            {}
        )
    )

    http_info = (
        request_context.get(
            "http",
            {}
        )
    )

    method = http_info.get(
        "method"
    )

    path = http_info.get(
        "path"
    )

    # ========================================================
    # BACKWARD COMPATIBILITY
    # ========================================================

    # Existing pytest/SAM events use:
    #
    #     httpMethod
    #     path
    #
    # If API Gateway v2 values are not present,
    # use the legacy values.

    if not method:
        method = event.get(
            "httpMethod"
        )

    if not path:
        path = event.get(
            "path"
        ) or ""

    # ========================================================
    # REMOVE API GATEWAY STAGE PREFIX
    # ========================================================

    stage = request_context.get(
        "stage"
    )

    if stage:

        stage_prefix = f"/{stage}"

        if path.startswith(
            stage_prefix + "/"
        ):
            path = path[
                len(stage_prefix):
            ]

        elif path == stage_prefix:
            path = "/"

    # ========================================================
    # LOG REQUEST
    # ========================================================

    logger.info(
        "Received request: method=%s, path=%s",
        method,
        path,
    )

    # ========================================================
    # CORS PREFLIGHT
    # ========================================================

    if method == "OPTIONS":

        return json_response(
            200,
            {},
        )

    # ========================================================
    # ROUTING
    # ========================================================

    try:

        # ----------------------------------------------------
        # POST /applications
        # ----------------------------------------------------

        if (
            method == "POST"
            and path == "/applications"
        ):

            return handle_post_application(
                event
            )

        # ----------------------------------------------------
        # GET /applications/{applicationId}
        # ----------------------------------------------------

        if (
            method == "GET"
            and path.startswith(
                "/applications/"
            )
        ):

            return handle_get_application(
                event
            )

        # ----------------------------------------------------
        # Unknown route
        # ----------------------------------------------------

        return json_response(
            404,
            {
                "message":
                    "Not found"
            },
        )

    # ========================================================
    # VALIDATION ERROR
    # ========================================================

    except ValueError as exc:

        logger.warning(
            "Validation error: %s",
            exc,
        )

        return json_response(
            400,
            {
                "message":
                    str(exc)
            },
        )

    # ========================================================
    # UNEXPECTED ERROR
    # ========================================================

    except Exception:

        logger.exception(
            "Unexpected error while processing request."
        )

        return json_response(
            500,
            {
                "message":
                    "Internal server error"
            },
        )