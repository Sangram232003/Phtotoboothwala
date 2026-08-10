# 📸 PHOTO BOOTH WALA — Web Application & Admin Portal

Full-stack website and single-page admin portal for Photo Booth Wala (Photo booth rentals for weddings, birthdays, corporate events, and celebrations across Bihar).

---

## 🛠️ Technology Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (`better-sqlite3`)
- **Authentication**: JWT stored in `httpOnly` secure cookies with `bcryptjs` password hashing
- **Email Service**: Nodemailer (SMTP integration)

---

## 📧 Booking Email Configuration

When a customer submits a booking request through the website, the system automatically:
1. Validates all inputs (Customer Name, Email, Phone, Event Date, Event Type, City/Location, Package, Duration, Notes).
2. Saves the booking into the SQLite database first and generates a unique Booking Reference ID (e.g. `PBW-2026-000123`).
3. Sends a branded HTML confirmation email to the customer's email address.
4. Sends a new booking notification email to the admin (`ADMIN_EMAIL`).
5. Updates `email_status` (`sent` or `failed`) in the database.

### Development / Test Mode Configuration

During development or testing, you can enable safe dry-run mode without real email sending by setting:

```env
EMAIL_MODE=test
EMAIL_DRY_RUN=true
```

In test mode, Nodemailer will render full HTML confirmation templates for customers and admins, validate all fields, and log dry-run results without making network connections or exposing credentials.

### Production SMTP Configuration

To enable real email delivery in production, set `EMAIL_DRY_RUN=false` and configure SMTP credentials in `.env`:

```env
EMAIL_MODE=production
EMAIL_DRY_RUN=false

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_business_email@gmail.com
SMTP_PASSWORD=your_16_character_app_password
MAIL_FROM="Photo Booth Wala <your_business_email@gmail.com>"
ADMIN_EMAIL=admin@photoboothwala.com
```

### How to Generate a Gmail App Password:
1. Log into your Google Account for `your_business_email@gmail.com`.
2. Go to **Security** → **2-Step Verification** (Ensure 2-Step Verification is turned ON).
3. Scroll to **App passwords**.
4. Generate a new App Password for **Mail** / **Other (Custom name)**.
5. Copy the generated 16-character password and paste it into `SMTP_PASSWORD` in `.env`.

---

## 🔐 Admin Dashboard Credentials

- **URL**: `http://localhost:3000/admin`
- **Email**: `admin@photoboothwala.com`
- **Password**: `Admin@PBW2024!`

### Features in Admin Dashboard:
- **Bookings Manager**: Displays Booking ID, Customer, Email, Phone, Event Date, Event Type, Package, Status, and Email Status (`✓ Confirmation Sent`, `⚠ Email Failed`, `Pending`).
- **Resend Confirmation**: Click `✉️ Resend` next to any booking to manually trigger the confirmation email.
- **Availability Block/Unblock**: Block dates for maintenance or manual bookings.
- **Leads & Customers**: Lead pipeline with 1-click lead-to-booking conversion.
- **Package Manager**: Modify package cards, pricing, and features.
- **Gallery Manager**: Upload new gallery photos.
