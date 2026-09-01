ABC GLOBAL MSEWE - Local Development

1. Setup (local)
- Create a virtualenv:
  python3 -m venv venv
  source venv/bin/activate

- Install dependencies:
  pip install -r requirements.txt

- (Optional) Set environment variables:
  export FLASK_APP=app.py
  export FLASK_ENV=development
  export SECRET_KEY="set-a-strong-secret"
  export ADMIN_USER="admin"
  export ADMIN_PASS="strong-password"

- Run:
  python app.py
  Open http://127.0.0.1:5000

2. Notes
- Replace hardcoded admin credentials with a proper user store before production.
- For deployment use a WSGI server (gunicorn) behind a reverse proxy.
- Customize text, images and assets as needed.
