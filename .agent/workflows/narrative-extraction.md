---
description: Scans manuscripts to extract stories, plot lines, and subjects for content generation.
---

# Narrative Extraction Workflow

This workflow executes the `narrative_extractor.py` script to identify potential content opportunities from the text.

1.  **Prepare Environment**: Ensure Python environment is active.
    ```bash
    source venv/bin/activate
    ```

2.  **Run Extractor**: Execute the script on a specific manuscript or the entire collection.
    ```bash
    // turbo
    python scripts/agents/narrative_extractor.py --source "english/WEB.txt" --format "text"
    ```
    *Note: Point `--source` to the actual file path of the manuscript you want to mine.*

3.  **Review Output**: The script generates a JSON file (default: `content_opportunities.json`) containing:
    - **Stories**: Identifiable narrative blocks.
    - **Themes**: extracted subjects (e.g., "Faith", "War").
    - **Characters**: Key entities involved.

4.  **Generate Content**: Use these structured outputs to feed into an LLM or content calendar for creating posts, sermons, or articles.
