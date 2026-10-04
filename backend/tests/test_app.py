import json
from unittest.mock import MagicMock, patch

import app

VALID_PAYLOAD = {
    "name": "Student Name",
    "email": "student@example.com",
    "phone": "9876543210",
    "course": "B.Tech",
    "college": "Example University",
    "scholarship": "Merit Scholarship",
}


def build_post_event(body):
    return {
        "httpMethod": "POST",
        "path": "/applications",
        "body": json.dumps(body),
    }


def build_get_event(application_id):
    return {
        "httpMethod": "GET",
        "path": f"/applications/{application_id}",
        "pathParameters": {"applicationId": application_id},
    }


def test_valid_post_applicaton_creates_record_and_publishes_sns(monkeypatch):
    monkeypatch.setenv("TABLE_NAME", "ScholarshipApplications")
    monkeypatch.setenv("NOTIFICATION_TOPIC_ARN", "arn:aws:sns:us-east-1:528087308594:ScholarshipNotificationTopic")

    mock_table = MagicMock()
    mock_sns = MagicMock()

    with patch.object(app, "get_table", return_value=mock_table), patch.object(app, "get_sns_client", return_value=mock_sns):
        response = app.lambda_handler(build_post_event(VALID_PAYLOAD), None)

    assert response["statusCode"] == 201
    body = json.loads(response["body"])
    assert body["message"] == "Scholarship application submitted successfully"
    assert body["status"] == "SUBMITTED"
    assert body["applicationId"].startswith("SCH-")
    mock_table.put_item.assert_called_once()
    mock_sns.publish.assert_called_once()


def test_missing_required_field_returns_400(monkeypatch):
    monkeypatch.setenv("TABLE_NAME", "ScholarshipApplications")
    monkeypatch.setenv("NOTIFICATION_TOPIC_ARN", "arn:aws:sns:us-east-1:528087308594:ScholarshipNotificationTopic")

    event = build_post_event({"name": "Student Name", "email": "student@example.com"})
    response = app.lambda_handler(event, None)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert "Missing required fields" in body["message"]


def test_malformed_json_returns_400(monkeypatch):
    monkeypatch.setenv("TABLE_NAME", "ScholarshipApplications")
    monkeypatch.setenv("NOTIFICATION_TOPIC_ARN", "arn:aws:sns:us-east-1:528087308594:ScholarshipNotificationTopic")

    event = {"httpMethod": "POST", "path": "/applications", "body": "not valid json"}
    response = app.lambda_handler(event, None)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["message"] == "Malformed JSON"


def test_successful_get_application_returns_200(monkeypatch):
    monkeypatch.setenv("TABLE_NAME", "ScholarshipApplications")
    monkeypatch.setenv("NOTIFICATION_TOPIC_ARN", "arn:aws:sns:us-east-1:528087308594:ScholarshipNotificationTopic")

    mock_table = MagicMock()
    mock_table.get_item.return_value = {"Item": {"applicationId": "SCH-1234", "status": "SUBMITTED"}}

    with patch.object(app, "get_table", return_value=mock_table):
        response = app.lambda_handler(build_get_event("SCH-1234"), None)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["applicationId"] == "SCH-1234"
    mock_table.get_item.assert_called_once_with(Key={"applicationId": "SCH-1234"})


def test_missing_application_returns_404(monkeypatch):
    monkeypatch.setenv("TABLE_NAME", "ScholarshipApplications")
    monkeypatch.setenv("NOTIFICATION_TOPIC_ARN", "arn:aws:sns:us-east-1:528087308594:ScholarshipNotificationTopic")

    mock_table = MagicMock()
    mock_table.get_item.return_value = {}

    with patch.object(app, "get_table", return_value=mock_table):
        response = app.lambda_handler(build_get_event("SCH-9999"), None)

    assert response["statusCode"] == 404
    body = json.loads(response["body"])
    assert body["message"] == "Application not found"


def test_dynamodb_put_item_failure_returns_500(monkeypatch):
    monkeypatch.setenv("TABLE_NAME", "ScholarshipApplications")
    monkeypatch.setenv("NOTIFICATION_TOPIC_ARN", "arn:aws:sns:us-east-1:528087308594:ScholarshipNotificationTopic")

    mock_table = MagicMock()
    mock_table.put_item.side_effect = Exception("DynamoDB failure")

    with patch.object(app, "get_table", return_value=mock_table):
        response = app.lambda_handler(build_post_event(VALID_PAYLOAD), None)

    assert response["statusCode"] == 500
    body = json.loads(response["body"])
    assert body["message"] == "Unable to submit application"


def test_sns_publish_failure_returns_500(monkeypatch):
    monkeypatch.setenv("TABLE_NAME", "ScholarshipApplications")
    monkeypatch.setenv("NOTIFICATION_TOPIC_ARN", "arn:aws:sns:us-east-1:528087308594:ScholarshipNotificationTopic")

    mock_table = MagicMock()
    mock_sns = MagicMock()
    mock_sns.publish.side_effect = Exception("SNS failure")

    with patch.object(app, "get_table", return_value=mock_table), patch.object(app, "get_sns_client", return_value=mock_sns):
        response = app.lambda_handler(build_post_event(VALID_PAYLOAD), None)

    assert response["statusCode"] == 500
    body = json.loads(response["body"])
    assert body["message"] == "Unable to submit application"


def test_unexpected_exception_returns_500(monkeypatch):
    monkeypatch.setenv("TABLE_NAME", "ScholarshipApplications")
    monkeypatch.setenv("NOTIFICATION_TOPIC_ARN", "arn:aws:sns:us-east-1:528087308594:ScholarshipNotificationTopic")

    with patch.object(app, "get_table", side_effect=Exception("Unexpected failure")):
        response = app.lambda_handler(build_post_event(VALID_PAYLOAD), None)

    assert response["statusCode"] == 500
    body = json.loads(response["body"])
    assert body["message"] == "Internal server error"
