---
description: Allow users to ask complex theological or textual questions using RAG.
---

# Interactive Study Assistant Workflow

This workflow executes the `study_assistant_rag.js` script to answer queries using manuscript data.

1.  **Prepare Environment**: Ensure Node.js dependencies are installed.
    ```bash
    npm install
    # or if strictly using backend deps
    cd backend && npm install
    ```

2.  **Run Study Assistant**: Execute the script with a query.
    ```bash
    // turbo
    node scripts/agents/study_assistant_rag.js --query "How does the Dead Sea Scrolls Isaiah differ from MT in ch 53?"
    ```

3.  **Review Output**: The script outputs the answer to the console and logs metadata to `data/reports/rag_session.log`.

4.  **Refine**: If the answer is insufficient, adjust the retrieval parameters in the script (e.g., top-k, chunk size).
