# Security Policy

## Supported versions

Only the latest commit on `main` is supported. There are no tagged releases yet.

## Reporting a vulnerability

Please report it **privately** through GitHub: open the **Security** tab of this repository and choose
**Report a vulnerability** (GitHub's private vulnerability reporting). Please do not open a public issue
for a security problem.

Useful details: what you found, how to reproduce it, and which build it affects (browser, Android or Windows).

This is a small, non-commercial hobby project maintained by one person. You can expect an acknowledgement
within about a week, and a fix or a clear answer as soon as is practical. Reports are credited unless you
prefer not to be named.

## What is in scope

- The app code in this repository (`src/`, `scripts/`, the native wrappers and the CI workflows).
- How the app handles the API key you enter for Live AI mode (it is kept only in the device's local storage
  and sent only to the provider you chose).
- The crisis-message handling: a message that looks like a crisis must never be sent to an AI provider.

## What is out of scope

- Third-party AI providers and their services.
- Content of the quotations and terms (report errors as ordinary issues, with a source).
