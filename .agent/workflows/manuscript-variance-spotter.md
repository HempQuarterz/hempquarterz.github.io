---
description: Automatically identify and classify textual variants between different manuscripts.
---

# Manuscript Variance Spotter Workflow

This workflow executes the `variance_spotter.py` script to analyze manuscript data and generate a Critical Apparatus report.

1.  **Prepare Environment**: Ensure the Python virtual environment is active.
    ```bash
    source venv/bin/activate
    ```

2.  **Run Variance Spotter**: Execute the script. You can specify a target book or chapter if needed (defaults to scanning all).
    ```bash
    # Run a full scan (dry-run mode recommended first)
    // turbo
    python scripts/agents/variance_spotter.py --dry-run
    ```

3.  **Review Output**: Check the generated report in `data/reports/critical_apparatus.json` (or similar output path defined in the script).

4.  **Analyze Results**: Use the report to identifying significant deviations between the base text (e.g., TR) and comparison texts (e.g., Sinaiticus).
