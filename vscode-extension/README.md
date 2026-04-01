# CodeSentinel VS Code Extension

AI-powered code reviews directly in your IDE.

## Features

- **Review Current File**: Run a full AI code review on the active file.
- **Security Analysis**: Detects OWASP Top 10 vulnerabilities and security flaws.
- **Performance Optimization**: Identifies algorithmic bottlenecks.
- **AI Suggested Fixes**: Get corrected code snippets directly in your output channel.

## Setup

1.  **Get your API Key**:
    -   Log in to the [CodeSentinel Dashboard](https://ais-dev-23dbf7rsf5fmizqmxr53o2-335762143281.asia-east1.run.app).
    -   Go to **Settings** > **API Access**.
    -   Generate and copy your API Key.
2.  **Configure VS Code**:
    -   Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
    -   Run `CodeSentinel: Set API Key`.
    -   Paste your API Key.
3.  **Run a Review**:
    -   Open any code file.
    -   Run `CodeSentinel: Review Current File` from the Command Palette.
    -   View results in the **CodeSentinel** Output Channel.

## Requirements

-   An active CodeSentinel account.
-   Internet connection to reach the CodeSentinel API.

## Extension Settings

This extension contributes the following settings:

-   `codesentinel.apiKey`: Your CodeSentinel API Key.
-   `codesentinel.apiUrl`: The URL of the CodeSentinel API (default: `https://ais-dev-23dbf7rsf5fmizqmxr53o2-335762143281.asia-east1.run.app`).

## Release Notes

### 0.0.1

Initial release of CodeSentinel VS Code extension.
