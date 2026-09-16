# DOH Abu Dhabi — Primary Care KPI Dashboard

A **local-only** web application for tracking DOH Abu Dhabi JAWDA Primary Care KPIs.
No internet connection required. All data is stored on this PC.

---

## ▶️ How to Start

**Double-click `start.bat`**, or open a terminal in this folder and run:

```
npm start
```

Then open your browser and go to:
```
http://localhost:3000
```

Press `Ctrl+C` in the terminal to stop the server.

---

## 📊 KPIs Covered (7 JAWDA Indicators)

| Code | KPI | Target |
|------|-----|--------|
| PC-01 | HbA1c Control (Diabetes) | ≥ 70% |
| PC-02 | Blood Pressure Control (Hypertension) | ≥ 70% |
| PC-03 | Asthma Medication Ratio | ≥ 0.50 |
| PC-04 | Weight Assessment & BMI Counseling | ≥ 85% |
| PC-05 | Appropriate Antibiotic Prescribing (URTI) | ≥ 80% |
| PC-06 | Average Patient Wait Time | ≤ 30 min |
| PC-07 | Patient Satisfaction Score | ≥ 80% |

---

## 📁 Data Storage

- Database: `database/kpi_data.db` (SQLite, auto-created on first run)
- **Backup**: Copy the `database/kpi_data.db` file to back up all your data

---

## 🔗 Official DOH JAWDA Resources

- Portal: https://www.doh.gov.ae/en/jawda
- Email: jawda@doh.gov.ae
