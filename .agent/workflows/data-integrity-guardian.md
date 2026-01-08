---
description: Ensure all dataset files are valid, consistent, and well-formed.
---

# Data Integrity Guardian Workflow

This workflow executes the `integrity_guardian.py` script to scan and validate manuscript data.

1.  **Prepare Environment**: Ensure Python environment is active.
    ```bash
    source venv/bin/activate
    ```

2.  **Run Integrity Scan**: Execute the script.
    ```bash
    // turbo
    python scripts/agents/integrity_guardian.py --directory manuscripts
    ```

3.  **Review Output**: The script will output a pass/fail summary and list any corrupt files or broken references in `data/reports/integrity_report.log`.

4.  **Auto-Fix**: (Optional) Run with `--fix` to automatically repair common syntax errors (e.g., closing tags).
    ```bash
    python scripts/agents/integrity_guardian.py --directory manuscripts --fix
    ```
