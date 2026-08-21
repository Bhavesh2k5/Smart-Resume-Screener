from reportlab.pdfgen import canvas
import os

def create_resume(filename, name, skills, exp):
    c = canvas.Canvas(filename)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 800, name)
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 770, "Skills")
    c.setFont("Helvetica", 10)
    c.drawString(50, 750, skills)
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 720, "Experience")
    c.setFont("Helvetica", 10)
    
    y = 700
    for e in exp:
        c.drawString(50, y, e)
        y -= 20
        
    c.save()

def main():
    create_resume(
        "sample_frontend_dev.pdf",
        "Alice Smith",
        "React, TypeScript, Tailwind CSS, Vite, JavaScript, HTML, CSS",
        [
            "Senior Frontend Engineer @ TechCorp (2020 - Present)",
            "- Built scalable React applications using TypeScript and Tailwind.",
            "Frontend Developer @ WebSolutions (2017 - 2020)",
            "- Developed responsive web interfaces."
        ]
    )

    create_resume(
        "sample_backend_dev.pdf",
        "Bob Johnson",
        "Python, FastAPI, PostgreSQL, Docker, AWS, SQLAlchemy",
        [
            "Backend Engineer @ DataInc (2019 - Present)",
            "- Designed REST APIs using FastAPI and PostgreSQL.",
            "Software Developer @ CodeFactory (2016 - 2019)",
            "- Maintained legacy Python microservices."
        ]
    )
    print("Created sample_frontend_dev.pdf and sample_backend_dev.pdf")

if __name__ == "__main__":
    main()
