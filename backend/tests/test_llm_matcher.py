import pytest
from unittest.mock import patch, MagicMock
from app.services.llm_matcher import compute_match

@patch("app.services.llm_matcher.genai.Client")
def test_compute_match(mock_client_cls, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test_key")
    
    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.text = '{"score": 8, "justification": "Good fit."}'
    mock_client.models.generate_content.return_value = mock_response
    
    candidate = {"skills": ["Python"], "experience": [], "education": [], "summary": ""}
    job_desc = "Looking for a Python dev."
    
    result = compute_match(candidate, job_desc)
    
    assert result["score"] == 8
    assert result["justification"] == "Good fit."
