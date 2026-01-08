---
description: Assist in creating or verifying translations by checking morphology alignment.
---

# Translation Helper Workflow

This workflow executes the `translation_helper.py` script to verify translation accuracy against grammatical data.

1.  **Prepare Environment**: Ensure Python environment is active.
    ```bash
    source venv/bin/activate
    ```

2.  **Run Translation Helper**: Execute the script with source and target texts.
    ```bash
    // turbo
    python scripts/agents/translation_helper.py --source "John 1:1" --translation "In the beginning was the Word"
    ```

3.  **Review Output**: The script will flag mismatches (e.g., singular vs plural, tense issues) in the console or `data/reports/translation_check.json`.

4.  **Correction**: Use the feedback to correct the translation text files.
