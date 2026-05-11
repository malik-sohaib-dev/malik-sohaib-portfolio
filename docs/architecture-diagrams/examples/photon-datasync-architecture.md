# Photon datasync — Express / SSE → Elixir / Channels

Architecture before and after carving **room + file metadata sync** out of **Express** into a dedicated **Elixir** service. Styling follows [`STYLE_GUIDE.md`](../STYLE_GUIDE.md).

**Bundled in the site:** [`photon-elixir-phoenix.mmd`](../../../src/data/architecture/photon-elixir-phoenix.mmd) contains the **flowchart only**; the case study applies **dark or light** Mermaid styling from [`mermaidThemedDefinition.ts`](../../../src/data/architecture/mermaidThemedDefinition.ts) to match the site theme. The fence below is a **dark reference** for GitHub / markdown previews—update the `flowchart TB …` portion alongside the `.mmd` file when the graph changes.

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "background": "#010409",
    "primaryColor": "#0a101f",
    "primaryTextColor": "#e2e8f0",
    "primaryBorderColor": "#2dd4bf",
    "lineColor": "#94a3b8",
    "secondaryColor": "#060b16",
    "tertiaryColor": "#060b16"
  }
}}%%
flowchart TB
  subgraph before["Before — datasync on Express"]
    direction TB
    B1["Clients — portal / rooms / room detail"]
    E["Express (Node)<br/>Photon JS SDK + in-memory snapshots<br/>~20–30 MB JSON typical"]
    B1 -->|"SSE: inactive vs active room lists<br/>+ SSE per room for files"| E
    E <-->|Realtime SDK| PH1[("Photon")]
  end

  subgraph after["After — split + dedicated datasync"]
    direction TB
    B2["Clients — portal / rooms / room detail"]
    DS["Elixir datasync<br/>Photon client · Channels · ETS (inactive / active / files)<br/>MongoDB"]
    EX["Express<br/>non-sync HTTP APIs"]
    B2 -->|"Phoenix Channels"| DS
    B2 -->|"HTTP"| EX
    DS <-->|Photon protocol| PH2[("Photon")]
    DS --> DB[("MongoDB")]
    DS --> AD["Adapter layer<br/>AWS · GCP (5 env) · Docker Compose"]
  end

  classDef client fill:#060b16,stroke:#2dd4bf,color:#e2e8f0
  classDef service fill:#0a101f,stroke:#2dd4bf,color:#e2e8f0
  classDef vendor fill:#060b16,stroke:#a78bfa,color:#e2e8f0
  classDef store fill:#0a101f,stroke:#94a3b8,color:#e2e8f0

  class B1,B2 client
  class E,EX,DS,AD service
  class PH1,PH2 vendor
  class DB store
```

### Reading notes

- **Before:** Multiple long-lived **SSE** connections per user (list streams plus per-room file streams) shared the **same Express** process as unrelated APIs, with Photon accessed via the **JavaScript SDK** and large snapshots held in **Node memory**.
- **After:** Browsers subscribe via **Phoenix Channels**; Photon is spoken from **Elixir** with a **custom client** (JS SDK as reference). **MongoDB** and **cloud adapters** support multi-region deployment; **Express** remains for the rest of the HTTP surface.
