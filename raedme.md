# Alramz Middleware Documentation Website

This repository contains the official documentation website for **Alramz Middleware**, providing a centralized and easy-to-use reference for developers, technical teams, system administrators, and integration partners.

The documentation covers the middleware platform’s architecture, core components, configuration, APIs, integrations, deployment procedures, authentication, security, troubleshooting, and operational guidelines. It is designed to help teams understand the platform, integrate external and internal systems, and efficiently manage middleware services across different environments.

The website serves as a **single source of truth** for technical documentation and will be continuously updated as new features, integrations, APIs, and platform capabilities are introduced.

## Key Areas

- Middleware architecture and platform overview
- API and integration documentation
- Configuration and environment setup
- Authentication and authorization
- Deployment and operational procedures
- Integration patterns and best practices
- Troubleshooting and frequently asked questions
- Developer and administrator guides
- Release notes and platform updates

## Purpose

The project is intended to make **Alramz Middleware** easier to adopt, integrate, maintain, and operate while ensuring that technical information remains consistent and accessible to all stakeholders.

## Repository Contents

This repository may include:

- Documentation source files
- Configuration files
- Static assets
- Documentation components
- Build and deployment configuration
- Tooling required to build and publish the documentation website

## Running Locally

The site is built with [MkDocs](https://www.mkdocs.org/) (Material theme) and is gated behind a login screen. To preview it locally:

### 1. Prerequisites

- Python 3.9+

### 2. Set up a virtual environment and install dependencies

```bash
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Generate the local login credentials

The login gate compares hashed credentials that are generated at build time from the `DOCS_USERNAME` / `DOCS_PASSWORD` values (the same secrets used in production). For local testing, set your own values and generate the config file:

```bash
DOCS_USERNAME=admin DOCS_PASSWORD=admin123 python3 scripts/generate_auth_config.py
```

This writes `overrides/assets/auth/auth-config.js` (git-ignored, never committed) with the salted hashes of the values you chose. Use whatever `DOCS_USERNAME` / `DOCS_PASSWORD` you set above to log in locally.

### 4. Start the dev server

```bash
mkdocs serve
```

Open **http://127.0.0.1:8000** in your browser, log in with the credentials from step 3, and you'll be able to browse every page without logging in again until the local session expires (12 hours) or you use the sign-out button in the header. The dev server live-reloads on changes to files under `docs/`; if you edit anything under `overrides/` (the login gate/theme), restart `mkdocs serve` to pick up the change.

### 5. Build a static copy (optional)

```bash
mkdocs build --site-dir ./_site
```

Outputs the static site to `./_site`, matching what the GitHub Actions workflow (`.github/workflows/pages.yml`) publishes to GitHub Pages.