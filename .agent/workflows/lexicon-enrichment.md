---
description: Expand the strongs-lexicon or lexicon data with context-aware definitions.
---

# Lexicon Enrichment Workflow

This workflow executes the `lexicon_enricher.py` script to analyze word usage and generate richer definitions.

1.  **Prepare Environment**: Ensure Python environment is active.
    ```bash
    source venv/bin/activate
    ```

2.  **Run Enrichment Agent**: Execute the script for a specific Strong's number or word.
    ```bash
    // turbo
    python scripts/agents/lexicon_enricher.py --target "G26" --context-window 5
    ```

3.  **Review Output**: Check `data/reports/lexicon_update.json`.

4.  **Update Lexicon**: If verified, the script (or a follow-up step) can merge these new definitions into the main `strongs-lexicon` data.
