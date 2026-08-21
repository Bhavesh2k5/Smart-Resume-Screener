import os
import json
from google import genai
from google.genai import types
from .llm_extractor import log_llm_call

def compute_match(candidate_json: dict, job_description: str) -> dict:
    prompt_template = """Compare the following candidate profile with this job description
and rate fit on a scale of 1 to 10. Return ONLY valid JSON, no
commentary, no markdown code fences:

{
  "score": number (1-10),
  "justification": string (2-3 sentences explaining strengths and gaps)
}

Candidate profile:
<<<{structured_candidate_json}>>>

Job description:
<<<{job_description}>>>"""
    
    prompt = prompt_template.replace(
        "{structured_candidate_json}", json.dumps(candidate_json, indent=2)
    ).replace(
        "{job_description}", job_description
    )
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set")
    
    client = genai.Client(api_key=api_key)
    
    def _clean_json(text: str) -> str:
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()
        
    def _parse_and_clamp(text: str) -> dict:
        data = json.loads(_clean_json(text))
        score = data.get("score", 1)
        if not isinstance(score, (int, float)):
            score = 1
        score = int(score)
        score = max(1, min(10, score))
        data["score"] = score
        if "justification" not in data:
            data["justification"] = "No justification provided."
        return data

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )
        response_text = response.text
        log_llm_call("compute_match", prompt, response_text)
        
        return _parse_and_clamp(response_text)
    except json.JSONDecodeError:
        retry_prompt = prompt + '\n\nYour previous response was not valid JSON. Return ONLY the JSON object, nothing else.'
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=retry_prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )
        response_text = response.text
        log_llm_call("compute_match_retry", retry_prompt, response_text)
        
        try:
            return _parse_and_clamp(response_text)
        except json.JSONDecodeError:
            return {
                "score": 1,
                "justification": "Failed to parse LLM response for match."
            }
    except Exception as e:
        raise RuntimeError(f"LLM match computation failed: {str(e)}")
