import os
import json
from datetime import datetime
from google import genai
from google.genai import types

def log_llm_call(prompt_type: str, prompt: str, response: str):
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "prompt_type": prompt_type,
        "prompt": prompt,
        "response": response
    }
    os.makedirs("logs", exist_ok=True)
    with open("logs/llm_calls.jsonl", "a") as f:
        f.write(json.dumps(log_entry) + "\n")

def extract_resume_data(resume_text: str) -> dict:
    prompt_template = """You are a resume parser. Extract the following from this resume text
and return ONLY valid JSON, no commentary, no markdown code fences:

{
  "name": string or null,
  "skills": [string],
  "experience": [{ "role": string, "company": string, "years": number }],
  "education": [{ "degree": string, "institution": string }],
  "summary": string (maximum 2 sentences)
}

Resume text:
<<<{resume_text}>>>"""
    
    prompt = prompt_template.replace("{resume_text}", resume_text)
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
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=1024,
            ),
        )
        response_text = response.text
        log_llm_call("extract_resume_data", prompt, response_text)
        
        return json.loads(_clean_json(response_text))
    except json.JSONDecodeError:
        retry_prompt = prompt + '\n\nYour previous response was not valid JSON. Return ONLY the JSON object, nothing else.'
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=retry_prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=1024,
            ),
        )
        response_text = response.text
        log_llm_call("extract_resume_data_retry", retry_prompt, response_text)
        
        try:
            return json.loads(_clean_json(response_text))
        except json.JSONDecodeError:
            return {
                "name": None,
                "skills": [],
                "experience": [],
                "education": [],
                "summary": None
            }
    except Exception as e:
        raise RuntimeError(f"LLM extraction failed: {str(e)}")
