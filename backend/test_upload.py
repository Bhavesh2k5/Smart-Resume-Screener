import requests

with open('sample_frontend_dev.pdf', 'rb') as f:
    files = {'file': ('sample_frontend_dev.pdf', f, 'application/pdf')}
    r = requests.post('http://localhost:8000/api/resumes/upload', files=files)
    print(r.status_code)
    print(r.text)
