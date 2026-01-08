---
description: Discover new thematic or linguistic connections between the Old and New Testaments.
---

# Cross-Reference Discovery Workflow

This workflow executes the `cross_ref_discovery.py` script to find semantic connections between passages.

1.  **Prepare Environment**: Ensure the Python virtual environment is active and has necessary ML libraries (e.g., `sentence-transformers` or `openai`).
    ```bash
    source venv/bin/activate
    pip install sentence-transformers # If not already installed
    ```

2.  **Run Discovery Agent**: Execute the script.
    ```bash
    // turbo
    python scripts/agents/cross_ref_discovery.py --query "suffering servant" --threshold 0.7
    ```

3.  **Review Output**: Check `data/reports/cross_references.json` for new links.

4.  **Integrate**: Use the findings to update the `cross-references` manuscript module.
