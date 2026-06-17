# TechnoStore360 Django Website

TechnoStore360 is a fully functional B2B tech marketplace platform migrated from a static frontend stack into a robust Django-powered website. It retains 100% of the original aesthetics, styles, typography, and interactive components while utilizing server-side rendering, Django ORM database transactions, session procurement cart management, dynamic checkout pipelines, and a custom administrative/vendor metrics dashboard.

---

## 🚀 Features

- **SSO & User Accounts (`accounts`)**: Corporate accounts, B2B company profile edits, and multi-address book CRUD management.
- **Product Catalog (`products`)**: Catalog filtering (category select, brand list, price tiers, deployment options), details page, ratings/reviews system, and personal user wishlists.
- **Session Procurement Cart (`cart`)**: B2B tax (18% GST), transit charges, stock-level cap validations, and guest-to-member cart merging.
- **B2B Checkout & Orders (`orders`)**: Corporate address selectors, promo coupon applications with AJAX pricing simulations, sandbox wire transfer/cash/online payments, JSON shipping/billing snapshots, and dynamic invoice generation/printing.
- **Administrative Desk (`dashboard`)**: Interactive B2B metrics dashboard (revenue stats, order status indicators, low stock notifications, review approval console, coupon management, customer list control, and sales report CSV exporter).
- **Test Suite coverage**: Comprehensive unit tests covering 42 functional scenarios.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.12+, Django 6.0+
- **Database**: SQLite (Development), PostgreSQL-ready settings (Production)
- **Frontend**: Vanilla CSS (`static/css/styles.css`), JavaScript (`static/js/app.js`), Tailwind CSS plugin framework, Google Fonts, and Lucide icons.

---

## 📂 Project Structure

```text
technostore360/
├── accounts/               # Customer Registration, Logins, Profiles & Address Book
├── products/               # Categories, Brands, Products Catalog & B2B Reviews
├── orders/                 # B2B Order Generation, Coupons & Invoice Printer
├── cart/                   # Session-based B2B Procurement Cart
├── dashboard/              # Custom Admin Workspace & Operations Desk
├── core/                   # Home, Solutions, Compare Matrix & Lead requests
├── static/                 # Relocated original CSS, JS and Image assets
├── templates/              # Server-Side Rendered Django Templates (base.html, includes)
├── technostore_project/    # Main project configurations (settings.py, urls.py)
├── db.sqlite3              # Database file (populated post-seeding)
├── seed_data.py            # Custom database seeder from js/data.js
├── requirements.txt        # Project python packages
└── README.md               # This instruction file
```

---

## 💻 Setup & Installation Instructions

### 1. Prerequisite
Ensure you have Python 3.12+ installed on your system.

### 2. Set Up Virtual Environment & Install Dependencies
Run the following commands in the root of the project to create a virtual environment, activate it, and install the required libraries:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows (cmd):
# venv\Scripts\activate
# On Windows (PowerShell):
# .\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the root directory (or use the pre-configured one). It should contain the following settings:
```ini
DEBUG=True
SECRET_KEY=django-insecure-key-for-development-purposes-only
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

### 4. Apply Database Migrations
Run the base migrations to initialize the SQLite database schema:
```bash
python manage.py migrate
```

### 5. Seed the Database
TechnoStore360 includes a custom seeding script `seed_data.py` to pre-populate categories, brands, products, mock reviews, and default logins directly from the original `data.js` file:
```bash
python seed_data.py
```

---

## 🔑 Default Logins for Testing

The seeder creates three user accounts representing different roles on the B2B portal:

1. **Super Administrator**
   - **Username**: `admin`
   - **Password**: `admin`
   - **Role**: System-wide manager access to the dashboard.

2. **Product Manager**
   - **Username**: `product_mgr`
   - **Password**: `pm123`
   - **Role**: Catalog operator access to create, update, or remove listings.

3. **Corporate Buyer (Customer)**
   - **Username**: `customer`
   - **Password**: `customer123`
   - **Role**: Access to checkout, profile management, and orders tracker.

---

## 🧪 Running Unit Tests

Run the full Django test suite to verify code compliance across all modules (accounts, products, cart, orders, dashboard, and core):

```bash
python manage.py test
```

---

## 🖥️ Running Locally

Start the Django development server:
```bash
python manage.py runserver 8000
```
Visit [http://127.0.0.1:8000/](http://127.0.0.1:8000/) in your web browser.
# technostore360beta
