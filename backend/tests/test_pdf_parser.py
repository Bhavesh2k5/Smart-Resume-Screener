import pytest
from unittest.mock import patch, MagicMock
from app.services.pdf_parser import parse_pdf

@patch("app.services.pdf_parser.pdfplumber.open")
def test_parse_pdf(mock_open):
    mock_pdf = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Hello World"
    mock_pdf.pages = [mock_page]
    
    # Mock context manager
    mock_open.return_value.__enter__.return_value = mock_pdf
    
    text = parse_pdf(b"fake pdf bytes")
    assert text == "Hello World"
