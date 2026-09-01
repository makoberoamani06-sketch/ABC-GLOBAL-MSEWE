@app.route('/admin/export/registrations')
@admin_required
def export_registrations():
    import csv
    from io import StringIO
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM registrations ORDER BY id DESC')
    rows = cur.fetchall()
    conn.close()

    si = StringIO()
    cw = csv.writer(si)
    cw.writerow(["id","department","full_name","email","phone","age","address","experience","message","timestamp"])
    for r in rows:
        cw.writerow([r['id'], r['department'], r['full_name'], r['email'], r['phone'], r['age'], r['address'], r['experience'], r['message'], r['timestamp']])
    output = si.getvalue()

    from flask import Response
    return Response(output, mimetype='text/csv', headers={"Content-Disposition":"attachment;filename=registrations.csv"})


@app.route('/admin/export/contacts')
@admin_required
def export_contacts():
    import csv
    from io import StringIO
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM contacts ORDER BY id DESC')
    rows = cur.fetchall()
    conn.close()

    si = StringIO()
    cw = csv.writer(si)
    cw.writerow(["id","name","email","message","timestamp"])
    for r in rows:
        cw.writerow([r['id'], r['name'], r['email'], r['message'], r['timestamp']])
    output = si.getvalue()

    from flask import Response
    return Response(output, mimetype='text/csv', headers={"Content-Disposition":"attachment;filename=contacts.csv"})
