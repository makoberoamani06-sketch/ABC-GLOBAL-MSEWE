from flask import Flask, request, jsonify, render_template, redirect, url_for, session, flash
import os
import sqlite3
from datetime import datetime
from functools import wraps

DB_PATH = os.path.join(os.path.dirname(__file__), 'data.db')

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'change-me-to-a-secure-key')

ADMIN_USER = os.environ.get('ADMIN_USER', 'admin')
ADMIN_PASS = os.environ.get('ADMIN_PASS', 'password123')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department TEXT,
            full_name TEXT,
            email TEXT,
            phone TEXT,
            age TEXT,
            address TEXT,
            experience TEXT,
            message TEXT,
            timestamp TEXT
        )
    ''')
    cur.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT,
            timestamp TEXT
        )
    ''')
    conn.commit()
    conn.close()


def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get('admin'):
            flash('Tafadhali ingia kwanza.', 'warning')
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return wrapper


@app.before_first_request
def _init():
    init_db()


# API endpoints
@app.route('/api/register', methods=['POST'])
def api_register():
    data = None
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()

    # required fields: fullName or full_name and phone
    full = data.get('fullName') or data.get('full_name') or data.get('fullname') or ''
    phone = data.get('phone') or ''
    department = data.get('department') or data.get('dept') or data.get('departmentName') or ''
    email = data.get('email') or ''
    age = data.get('age') or ''
    address = data.get('address') or ''
    experience = data.get('experience') or ''
    message = data.get('message') or ''

    if not full or not phone:
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400

    ts = datetime.utcnow().isoformat()
    conn = get_db()
    cur = conn.cursor()
    cur.execute('''INSERT INTO registrations (department, full_name, email, phone, age, address, experience, message, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''', (department, full, email, phone, age, address, experience, message, ts))
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return jsonify({'success': True, 'id': new_id})


@app.route('/api/contact', methods=['POST'])
def api_contact():
    data = None
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()

    name = data.get('name') or data.get('fullName') or ''
    email = data.get('email') or ''
    message = data.get('message') or ''

    if not name or not email:
        return jsonify({'success': False, 'error': 'Missing name or email'}), 400

    ts = datetime.utcnow().isoformat()
    conn = get_db()
    cur = conn.cursor()
    cur.execute('''INSERT INTO contacts (name, email, message, timestamp) VALUES (?, ?, ?, ?)''', (name, email, message, ts))
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return jsonify({'success': True, 'id': new_id})


# Pages: keep serving static files for main site, but provide admin routes
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/huduma.html')
def huduma_page():
    return app.send_static_file('huduma.html')

@app.route('/jiandikishe.html')
def jiandikishe_page():
    return app.send_static_file('jiandikishe.html')

@app.route('/matangazo.html')
def matangazo_page():
    return app.send_static_file('matangazo.html')

@app.route('/kuhusu.html')
def kuhusu_page():
    return app.send_static_file('kuhusu.html')

@app.route('/wasilliana.html')
def wasilliana_page():
    return app.send_static_file('wasilliana.html')


# Admin routes
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username == ADMIN_USER and password == ADMIN_PASS:
            session['admin'] = True
            flash('Umeingia kwa mafanikio.', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Jina au nenosiri si sahihi.', 'danger')
            return redirect(url_for('admin_login'))
    return render_template('admin_login.html')


@app.route('/admin/logout')
def admin_logout():
    session.pop('admin', None)
    flash('Umetoka kwenye admin.', 'info')
    return redirect(url_for('index'))


@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM registrations ORDER BY id DESC')
    regs = cur.fetchall()
    cur.execute('SELECT * FROM contacts ORDER BY id DESC')
    contacts = cur.fetchall()
    conn.close()
    return render_template('admin_dashboard.html', registrations=regs, contacts=contacts)


@app.route('/admin/registration/<int:reg_id>/delete', methods=['POST'])
@admin_required
def delete_registration(reg_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('DELETE FROM registrations WHERE id = ?', (reg_id,))
    conn.commit()
    conn.close()
    flash('Registration imefutwa.', 'info')
    return redirect(url_for('admin_dashboard'))


@app.route('/admin/contact/<int:c_id>/delete', methods=['POST'])
@admin_required
def delete_contact(c_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('DELETE FROM contacts WHERE id = ?', (c_id,))
    conn.commit()
    conn.close()
    flash('Ujumbe umefutwa.', 'info')
    return redirect(url_for('admin_dashboard'))


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
