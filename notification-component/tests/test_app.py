import json
from unittest.mock import MagicMock, patch

import pytest

import app


VALID_MESSAGE = {
    "email": "student@example.com",
    "subject": "Scholarship Application Received",
    "message": "Your scholarship application SCH-12345678 has been received successfully.",
}


def build_sns_event(messages):
    return {
        "Records": [
            {"Sns": {"Message": json.dumps(message)}} for message in messages
        ]
    }


def test_valid_sns_event_calls_ses(monkeypatch):
    monkeypatch.setenv("SENDER_EMAIL", "noreply@example.com")
    mock_client = MagicMock()
    with patch.object(app, "get_ses_client", return_value=mock_client):
        response = app.lambda_handler(build_sns_event([VALID_MESSAGE]), None)

    assert response["statusCode"] == 200
    assert response["body"]["processed"] == 1
    mock_client.send_email.assert_called_once_with(
        Source="noreply@example.com",
        Destination={"ToAddresses": [VALID_MESSAGE["email"]]},
        Message={
            "Subject": {"Data": VALID_MESSAGE["subject"]},
            "Body": {"Text": {"Data": VALID_MESSAGE["message"]}},
        },
    )


def test_missing_email_raises_value_error(monkeypatch):
    monkeypatch.setenv("SENDER_EMAIL", "noreply@example.com")
    bad_event = build_sns_event([
        {"subject": "Scholarship Application Received", "message": "Hello"}
    ])

    with pytest.raises(ValueError, match="email"):
        app.lambda_handler(bad_event, None)


def test_missing_subject_raises_value_error(monkeypatch):
    monkeypatch.setenv("SENDER_EMAIL", "noreply@example.com")
    bad_event = build_sns_event([
        {"email": "student@example.com", "message": "Hello"}
    ])

    with pytest.raises(ValueError, match="subject"):
        app.lambda_handler(bad_event, None)


def test_missing_message_raises_value_error(monkeypatch):
    monkeypatch.setenv("SENDER_EMAIL", "noreply@example.com")
    bad_event = build_sns_event([
        {"email": "student@example.com", "subject": "Scholarship Application Received"}
    ])

    with pytest.raises(ValueError, match="message"):
        app.lambda_handler(bad_event, None)


def test_malformed_json_raises_value_error(monkeypatch):
    monkeypatch.setenv("SENDER_EMAIL", "noreply@example.com")
    event = {"Records": [{"Sns": {"Message": "not valid json"}}]}

    with pytest.raises(ValueError, match="Invalid SNS message JSON"):
        app.lambda_handler(event, None)


def test_multiple_sns_records_processes_all(monkeypatch):
    monkeypatch.setenv("SENDER_EMAIL", "noreply@example.com")
    mock_client = MagicMock()
    with patch.object(app, "get_ses_client", return_value=mock_client):
        response = app.lambda_handler(
            build_sns_event([VALID_MESSAGE, VALID_MESSAGE]),
            None,
        )

    assert response["statusCode"] == 200
    assert response["body"]["processed"] == 2
    assert mock_client.send_email.call_count == 2


def test_ses_failure_raises_exception(monkeypatch):
    monkeypatch.setenv("SENDER_EMAIL", "noreply@example.com")
    mock_client = MagicMock()
    mock_client.send_email.side_effect = Exception("SES failure")
    with patch.object(app, "get_ses_client", return_value=mock_client):
        with pytest.raises(Exception, match="SES failure"):
            app.lambda_handler(build_sns_event([VALID_MESSAGE]), None)
