from flask import Flask, render_template, request, redirect, url_for, session, flash
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-me-to-a-secure-key")

# Simple hardcoded admin credentials (replace with DB in production)
ADMIN_USER = os.environ.get("ADMIN_USER", "admin")
ADMIN_PASS = os.environ.get("ADMIN_PASS", "password123")

@app.route("/")
def home():
    return render_template("home.html", active="home")

@app.route("/kuhusu")
def kuhusu():
    return render_template("kuhusu.html", active="kuhusu")

@app.route("/services")
def services():
    return render_template("services.html", active="services")

@app.route("/contact")
def contact():
    return render_template("contact.html", active="contact")

# Admin routes
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if username == ADMIN_USER and password == ADMIN_PASS:
            session["admin"] = True
            flash("Umeingia kwa mafanikio.", "success")
            return redirect(url_for("admin_dashboard"))
        else:
            flash("Jina au nenosiri si sahihi.", "danger")
            return redirect(url_for("admin_login"))
    return render_template("admin/login.html")

def admin_required(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*a, **kw):
        if not session.get("admin"):
            flash("Tafadhali ingia kwanza.", "warning")
            return redirect(url_for("admin_login"))
        return fn(*a, **kw)
    return wrapper

@app.route("/admin/dashboard")
@admin_required
def admin_dashboard():
    return render_template("admin/dashboard.html")

@app.route("/admin/logout")
def admin_logout():
    session.pop("admin", None)
    flash("Umetoka kwenye admin.", "info")
    return redirect(url_for("home"))

if __name__ == "__main__":
    app.run(debug=True)
