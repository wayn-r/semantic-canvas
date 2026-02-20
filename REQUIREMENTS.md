# Semantic Canvas — Requirements

## Vision

Semantic Canvas is an AI-powered knowledge management system. The user types raw, unstructured notes into a single input — the system uses an LLM to understand intent, parse concepts, structure data into a semantic knowledge graph, and visualize everything on a spatial canvas.

The core loop: **raw input → LLM intent recognition → structured knowledge graph → spatial visualization**.

---

## Input System

### Single Adaptive Text Input
- One text input at the bottom of the screen (or similar prominent position)
- Handles all interaction: notes, commands, questions, and clarification responses
- When the system needs clarification or the user asks a question, the input area expands upward into a chat-like conversation thread
- File uploads supported via a button and drag-and-drop onto the input area
- Supported file types (future): images, PDFs, code files

### Input Types (determined by LLM)
The system does NOT have hard-coded input categories. An LLM analyzes every input to determine intent:

1. **Note** — information to parse, structure, and store in the knowledge graph
   - Example: `semantic canvas features: drawing, writing, codeblocks, markdown, text, images, pdfs. auto parse concepts, auto link ideas, multi-link ideas, sort elements dynamically.`
2. **Action/Command** — an operation to perform on existing data
   - Example: `mark all features in semantic canvas as todo`
3. **Question/Query** — a request for information from the knowledge graph
   - Example: `what features do I have completed in semantic canvas?`
4. **Ambiguous** — unclear intent; system asks clarifying questions before proceeding

---

## Processing Pipeline

### Step 1: Intent Recognition (LLM)
- Every input goes through the LLM to classify intent (note, action, question, ambiguous)
- The LLM receives relevant context via RAG — only the most semantically similar nodes are retrieved, not the entire graph
- Fuzzy matching handles typos (e.g., `semantic canvs` → `semantic canvas`) — vector similarity catches these even when string matching wouldn't

### Step 2: Concept Parsing (for notes)
The LLM parses raw text into structured concepts with inferred groupings:

**Example input:** `semantic canvas features: drawing, writing, codeblocks, markdown, text, images, pdfs. auto parse concepts, auto link ideas, multi-link ideas, sort elements dynamically.`

**Parsed output:**
- Top-level concept: `Semantic Canvas`
- Group: `Features`
  - Subgroup: `Input Methods` (inferred) — drawing, writing, codeblocks, markdown, text, images, pdfs
  - Subgroup: `Logic` (inferred) — auto parse concepts, auto link ideas, multi-link ideas, sort elements dynamically

Key: the system infers groupings and hierarchy that the user didn't explicitly state (like "Input Methods" and "Logic" being separate categories of features).

### Step 3: Knowledge Graph Integration
- Parsed concepts become nodes in the knowledge graph with semantic tags
- Every node is immediately embedded as a vector and stored in pgvector
- Tags are hierarchical: `Semantic Canvas > Features > Input Methods > drawing`
- New notes are linked to existing nodes via vector similarity (semantic closeness) in addition to explicit tag relationships
- When new information changes the understanding of existing notes, the graph restructures (affected node embeddings are regenerated)
  - Example: adding `add drawing input option semantic canvas` causes the existing `drawing` feature node to gain a `TODO` tag because the system infers it's a reminder to implement it

### Step 4: Web Search (when needed)
- When the system encounters a completely unknown concept and can't determine context, it can perform a web search to understand what the user is referring to
- Example: determining whether "semantic canvas" is an existing product or a user's project
- Search results inform how the system categorizes and structures the note

### Step 5: Conflict Resolution & Confidence
- When confidence is low, the system asks clarifying questions via the chat interface
- Goal: start with high verbosity (confirming most changes) and dial down over time as the system learns patterns
- High-confidence changes are applied automatically; the user sees the result on the canvas

---

## Knowledge Graph

### Structure
- **Nodes**: individual concepts, items, ideas, tasks, etc.
- **Tags**: hierarchical labels that define relationships and categories
  - Tags can be nested: `Projects > Semantic Canvas > Features > Input Methods`
  - A node can have multiple tags (multi-link)
- **Connections**: edges between nodes representing relationships (semantic similarity, hierarchy, user-defined)
- Conceptually similar to Obsidian's graph + tagging system, but fully automated

### Auto-Organization
- New notes automatically get tagged and connected to relevant existing nodes
- The system can create new grouping tags when patterns emerge (e.g., multiple unrelated top-level concepts might get grouped under `Projects`)
- Existing notes can be restructured when new information provides better context
- Tags can carry metadata (e.g., `TODO`, `completed`, `in-progress`)

### Example Flow
1. User inputs: `semantic canvas features: drawing, writing, codeblocks...`
   - Creates: Semantic Canvas → Features → Input Methods (drawing, writing, ...) + Logic (auto parse, auto link, ...)
2. User inputs: `update freelancer role permissions in vethub`
   - Creates: Vethub → TODO → update freelancer role permissions
   - System may infer a `Projects` grouping tag linking Semantic Canvas and Vethub
3. User inputs: `add drawing input option semantic canvs`
   - Fuzzy-matches to `Semantic Canvas`, links to existing `drawing` under Input Methods
   - Infers this is a TODO, updates the `drawing` node with a `TODO` tag
4. User inputs: `mark all features in semantic canvas as todo`
   - Recognized as an action/command, not a note
   - Applies `TODO` tag to all feature nodes under Semantic Canvas
5. User inputs: `what features do I have completed in semantic canvas?`
   - Recognized as a question
   - Queries the knowledge graph and responds in the chat interface

---

## Vector Layer & RAG

Every piece of data in the knowledge graph is vectorized to enable three core benefits: **reliability** (LLM gets precise, relevant context instead of noise), **speed** (smaller prompts = faster responses), and **reduced token usage** (only relevant nodes are sent to the LLM).

### Embedding Strategy
- Every node, tag, and connection label is embedded as a vector on creation and stored in pgvector
- Embeddings are regenerated when a node's content or tags change meaningfully
- Compound embeddings: a node's vector represents not just its text but its semantic context (parent tags, related nodes) for richer similarity matching

### RAG Pipeline
- On every user input, the raw text is embedded and used to query pgvector for the most relevant existing nodes
- This retrieved context is what gets sent to the LLM — not the full graph
- The retrieval scope adapts to the input:
  - A note about "semantic canvas features" retrieves nodes tagged under Semantic Canvas
  - A broad command like "mark all features as todo" retrieves all feature-tagged nodes across the relevant scope
  - A question like "what projects do I have?" retrieves top-level grouping nodes
- Retrieval uses cosine similarity with configurable thresholds

### Semantic Node Linking
- Vector similarity is the primary mechanism for discovering relationships between nodes
- When a new node is created, its embedding is compared against all existing nodes to find semantic neighbors
- This catches relationships that tag hierarchy alone would miss (e.g., a TODO in Vethub about "permissions" linking to a Semantic Canvas note about "role-based access" if both exist)
- Similarity scores are stored on connections to enable weighted graph traversal and relevance ranking

---

## Canvas Visualization

### Spatial Canvas
- Infinite pannable/zoomable canvas (will eventually support drawing/whiteboard features)
- Knowledge graph nodes rendered spatially on the canvas
- Connections rendered as edges between nodes

### Layout & Representation
- On initial load, the canvas displays the knowledge graph with meaningful spatial arrangement
- Representation style is not finalized — options to explore:
  - **Graph view**: nodes connected by edges (similar to NotebookLM mindmaps)
  - **Outline/document view**: hierarchical markdown-like rendering with headings, bullets, and formatting
  - **Card-based**: grouped cards showing related concepts
  - **Hybrid**: combination depending on the data type or user preference
- Layout may be configurable or determined automatically by the type of notes
- Force-directed or hierarchical layout algorithms for auto-positioning

### Future: Drawing & Whiteboard
- Freehand drawing input (Excalidraw-style) — not for initial implementation
- Handwriting recognition as an input method
- Whiteboard features for spatial brainstorming
- To be implemented after the core note → knowledge graph → visualization pipeline is working

---

## Agent/System Capabilities

The LLM acts as the system's brain. It has tools to:
- **Parse** raw text into structured concepts
- **Query** the knowledge graph (search, filter, traverse)
- **Mutate** the knowledge graph (create nodes, add/remove tags, create/remove connections, restructure)
- **Search the web** for context when dealing with unknown concepts
- **Ask clarifying questions** when confidence is low
- **Answer user questions** about the contents of the knowledge graph

### Autonomy Settings
- Default: high verbosity (confirm most changes)
- Goal: low verbosity (only ask when confidence is low)
- Configurable threshold for when the system asks vs. acts

---

## Technical Architecture

### Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express + PostgreSQL + pgvector
- **LLM**: OpenAI / OpenRouter API for intent recognition, parsing, and graph management
- **Embeddings + RAG**: OpenAI embeddings + pgvector for vectorizing all knowledge graph data; RAG retrieval provides targeted context to every LLM call
- **Database**: PostgreSQL with pgvector extension (Docker) — stores both relational graph data and vector embeddings

### Two-Package Structure
- Root: frontend (ES modules)
- `backend/`: backend API (ES modules)

### Service Ports
| Service    | Port |
|------------|------|
| Frontend   | 5173 |
| Backend    | 3001 |
| PostgreSQL | 5433 |

---

## Out of Scope (for now)
- Drawing/whiteboard input (future phase)
- Handwriting recognition (future phase)
- Keyboard shortcuts
- Mobile-specific UI
