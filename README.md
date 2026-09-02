# RepublicMCP — Italian Parliament Data MCP Server

[![npm version](https://img.shields.io/npm/v/republic-mcp)](https://www.npmjs.com/package/republic-mcp)
[![License: MIT](https://img.shields.io/npm/l/republic-mcp)](./LICENSE)
[![Listed in italia-mcp-servers](https://img.shields.io/badge/listed%20in-italia--mcp--servers-blue)](https://github.com/bsab/italia-mcp-servers)

> MCP (Model Context Protocol) server for Italian Parliament open data — **Camera dei Deputati** and **Senato della Repubblica** via their official SPARQL endpoints, plus curated **OpenPolis** data. 37 tools, hand-mapped ontologies, gotchas documented so you don't have to rediscover them.

## Overview

RepublicMCP lets AI assistants (Claude, or any MCP client) query Italian Parliament data — deputies, senators, bills, votes, groups, commissions, governments, floor speeches — through 37 specialized tools, built directly on the official SPARQL endpoints and ontologies of both chambers.

### Key Features

- **37 MCP tools** across Camera (19), Senato (11), and OpenPolis (7)
- **SPARQL-based**, type-safe TypeScript implementations
- **Dual institution support** — Camera dei Deputati and Senato della Repubblica, each with its own query builder because [the two ontologies disagree in ways that will break your queries](./docs/senato/03-differenze-camera-senato.md) if you assume they're compatible
- **Rich type system** based on the official ontologies (OCD for Camera, OSR for Senato)
- **Published on npm** as [`republic-mcp`](https://www.npmjs.com/package/republic-mcp)

## Why RepublicMCP exists (and what makes it different)

Camera and Senato publish their data as two *separate, independently modeled* SPARQL ontologies (OCD and OSR) that look similar on the surface and diverge in ways that are easy to get wrong. Mapping both by hand — and documenting exactly where they diverge — is most of the actual work behind this project:

| | Camera (OCD) | Senato (OSR) |
|---|---|---|
| Surname property | `foaf:surname` | `foaf:lastName` |
| Legislature | full URI | plain integer |
| Mandate start/end | `ocd:startDate` / `ocd:endDate` | `osr:inizio` / `osr:fine` |
| Active-mandate pattern | `MINUS { ?m ocd:endDate ?e }` | `FILTER(!bound(?fine))` |
| Parliamentary groups | `ocd:gruppoParlamentare` | reuses Camera's class, but with OSR properties |

This is a small sample — the full comparison (with query-by-query examples) is in [`docs/senato/03-differenze-camera-senato.md`](./docs/senato/03-differenze-camera-senato.md), and the TypeScript type diagrams for each ontology are in [`docs/camera/ontology-diagram.md`](./docs/camera/ontology-diagram.md) and [`docs/senato/ontology-diagram.md`](./docs/senato/ontology-diagram.md). If you're building anything else against these endpoints, that document will likely save you the hours it took to work out the hard way.

### Known limitations

- Data isn't real-time — the SPARQL endpoints lag behind official publication.
- Many older votes only have aggregate counts, not individual `favorevole`/`contrario`/`astenuto` per member.
- Full act/bill text isn't in the SPARQL endpoint (only metadata + iter) — for full text see [`documenti.camera.it`](https://documenti.camera.it) / the Senato equivalent.
- No local caching yet — every query hits the live endpoint.

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Claude Desktop (for MCP integration) or any other MCP-compatible client

### Installation

```bash
npm install -g republic-mcp
# or, from source:
npm install && npm run build
```

### Configuration with Claude Desktop

Add to your `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "republican": {
      "command": "npx",
      "args": ["-y", "republic-mcp"]
    }
  }
}
```

See [INSTALLATION.md](./INSTALLATION.md) for detailed setup instructions, including running from a local clone.

### Example: what you can actually ask it

- *"Cerca Giorgia Meloni tra i deputati e dammi il suo indice di forza"* → `search_deputati` + `openpolis_indice_di_forza`
- *"Che iter ha fatto il DDL sull'autonomia differenziata al Senato?"* → `get_ddl_con_iter`
- *"Chi ha votato contro l'ultimo decreto-legge sulla giustizia?"* → `get_votazioni` + `get_espressioni_voto`
- *"Quali sono i decreti-legge in scadenza di conversione?"* → `openpolis_decreti_legge`

## Available MCP Tools

### Camera dei Deputati (19 tools)

**Deputies & Members**
- `search_deputati` - Search deputies by name/group
- `get_deputato_info` - Detailed deputy information
- `get_deputato_mandati` - Deputy mandates and history

**Parliamentary Acts**
- `search_atti` - Search parliamentary acts
- `get_atto_info` - Detailed act information
- `get_atti_deputato` - Acts by deputy (signer/co-signer)
- `get_atti_con_fasi` - Acts with full iter phases

**Voting**
- `get_votazioni` - Recent/filtered votations
- `get_espressioni_voto` - Detailed vote expressions
- `get_statistiche_voto_deputato` - Deputy voting statistics

**Organizations**
- `get_gruppi_parlamentari` - Parliamentary groups
- `get_commissioni` - Commissions
- `get_incarichi_gruppi` - Group leadership roles
- `get_incarichi_organi` - Commission roles

**Government**
- `get_governi` - Governments information
- `get_governo_membri` - Government members
- `get_incarichi_governo` - Ministerial positions

**Debates**
- `search_interventi` - Search speeches by topic
- `get_interventi_per_argomento` - Interventions filtered by argument

### Senato della Repubblica (11 tools)

**Senators**
- `search_senatori` - Search senators by name/legislature
- `get_senatore_dettagli` - Detailed senator information
- `get_senatori_a_vita` - Life senators

**Bills (DDL)**
- `get_ddl_senato` - Search bills
- `get_ddl_senatore` - Bills by specific senator
- `get_ddl_con_iter` - Bills with full legislative iter

**Voting**
- `get_votazioni_senato` - Recent/filtered votes
- `get_votazioni_per_senatore` - Votes by senator
- `get_statistiche_voti_senato` - Voting statistics

**Organizations**
- `get_commissioni_senato` - Senate commissions
- `get_gruppi_senato` - Parliamentary groups

### OpenPolis · Openparlamento (7 tools)

> Curated, enriched data via the OpenPolis OPDM REST API (not SPARQL). Adds metrics the raw chamber endpoints lack: **indice di forza** (power ranking), attendance stats, voting cohesion, decree-law conversion status. Anonymous access (10k req/day); set `OPENPOLIS_TOKEN` (JWT) to lift the limit. **License: CC-BY-NC — attribute "Fonte: Openpolis".**

- `openpolis_cerca_parlamentari` - Search deputies/senators (by name/role), ranked by power index
- `openpolis_indice_di_forza` - Power-index (pp) ranking of parliamentarians
- `openpolis_profilo_parlamentare` - Member profile: group, constituency, attendance stats
- `openpolis_cerca_votazioni` - Votes by topic, with outcome, confidence/key votes, cohesion
- `openpolis_decreti_legge` - Decree-laws with conversion status + Normattiva link
- `openpolis_attivita_legislativa` - Bills/acts with type, iter phase, signers and rapporteurs
- `openpolis_organi_parlamentari` - Groups (with power weights), presidency, commissions

## Project Structure

```
republicMCP/
├── src/
│   ├── core/                    # Shared infrastructure
│   │   ├── mcp/                 # MCP tool registry
│   │   ├── sparql/              # SPARQL client & query builder
│   │   ├── types/               # Common types
│   │   └── index.ts
│   ├── institutions/            # Institution-specific modules
│   │   ├── camera/              # Camera dei Deputati
│   │   │   ├── ontology/        # OCD types & prefixes
│   │   │   ├── queries/         # SPARQL query builders
│   │   │   ├── tools/           # MCP tools
│   │   │   ├── client.ts        # Camera SPARQL client
│   │   │   └── index.ts
│   │   └── senato/              # Senato della Repubblica
│   │       ├── ontology/        # OSR types & prefixes
│   │       ├── queries/         # SPARQL query builders
│   │       ├── tools/           # MCP tools
│   │       ├── client.ts        # Senato SPARQL client
│   │       └── index.ts
│   ├── config/                  # Configuration
│   └── index.ts                 # Main MCP server
├── docs/                        # Documentation
│   ├── camera/                  # Camera documentation
│   │   ├── README.md            # Full Camera workflow guide
│   │   ├── ontology-diagram.md  # TypeScript type diagram
│   │   └── *.md                 # Ontology & query docs
│   └── senato/                  # Senato documentation
│       ├── README.md            # Full Senato workflow guide
│       ├── ontology-diagram.md  # TypeScript type diagram
│       ├── 03-differenze-camera-senato.md  # Camera ↔ Senato ontology diff
│       └── *.md                 # Ontology & query docs
├── README.md                    # This file
├── INSTALLATION.md              # Setup guide
└── CHANGELOG.md                 # Version history
```

## Ontologies & Endpoints

### Camera dei Deputati

- **SPARQL Endpoint**: https://dati.camera.it/sparql
- **Ontology**: OCD (Ontologia Camera dei Deputati)
- **Documentation**: https://dati.camera.it/ocd-rappresentazione-semantica-e-documentazione
- **Key Features**:
  - Uses `foaf:surname` (not lastName)
  - Legislature as full URI
  - Date format: YYYYMMDD

[Full Camera Documentation →](./docs/camera/README.md)

### Senato della Repubblica

- **SPARQL Endpoint**: https://dati.senato.it/sparql
- **Ontology**: OSR (Ontologia Senato Repubblica)
- **Documentation**: https://dati.senato.it/DatiSenato/browse/21
- **Key Features**:
  - Uses `foaf:lastName` (not surname)
  - Legislature as integer
  - Shares OCD parliamentary group classes

[Full Senato Documentation →](./docs/senato/README.md)

## Documentation

- **[Camera dei Deputati Guide](./docs/camera/README.md)** - Complete workflow, examples, and ontology
- **[Senato della Repubblica Guide](./docs/senato/README.md)** - Complete workflow, examples, and ontology
- **[Camera ↔ Senato differences](./docs/senato/03-differenze-camera-senato.md)** - Full ontology diff with query-by-query examples
- **[Installation Guide](./INSTALLATION.md)** - Setup and configuration
- **[Changelog](./CHANGELOG.md)** - Version history and updates

### Key Documentation Sections

Each institution guide includes:
- 📚 Ontology overview and TypeScript type diagram
- 🚀 Quick start with example queries
- 🔍 Real-world examples (Meloni, Salvini case studies)
- 🛠️ SPARQL patterns and best practices
- ⚠️ Institution-specific features and gotchas
- 🧪 Testing guide
- 🐛 Troubleshooting

## Architecture

RepublicMCP uses a modular architecture:

1. **Core Layer** (`src/core/`)
   - Shared SPARQL client and query builder
   - MCP tool registry system
   - Common TypeScript types

2. **Institution Layer** (`src/institutions/`)
   - Camera module with 19 tools
   - Senato module with 11 tools
   - Each with dedicated ontology types, query builders, and tools

3. **Configuration** (`src/config/`)
   - Centralized endpoint management
   - Query limits and pagination
   - Current legislature tracking

This design enables:
- Easy addition of new institutions
- Consistent query patterns
- Reusable SPARQL components
- Type-safe data handling

## Integration Context

RepublicMCP is developed as part of **[Open Parlament](https://open-parlament.xyz)**, an agent that answers questions about the Italian state by joining the **law** (Constitution, codes, EU legislation, verbatim citations) with **public data** (budgets, procurement, statistics) — RepublicMCP is the connector that supplies the parliamentary side of that data (acts, votes, deputies, senators, groups) to the agent.

It also works entirely standalone as a general-purpose MCP server for Camera/Senato data, independent of Open Parlament:

- **republicMCP** (this module): MCP server for parliamentary data access
- **backend** (separate, part of Open Parlament): Authentication, memory, model management
- **frontend** (separate, part of Open Parlament): User interface

## Technology Stack

- **TypeScript** - Type-safe implementation
- **Model Context Protocol** - AI integration standard
- **SPARQL** - Semantic web query language
- **Node.js** - Runtime environment

## Related projects

Part of a growing ecosystem of Italian open-data MCP servers (see the [italia-mcp-servers catalog](https://github.com/bsab/italia-mcp-servers)). A few worth knowing about if you're working in this space:

- [Italian Parliament MCP](https://github.com/aborruso/italianparliament-mcp) — another MCP over the same Camera/Senato SPARQL endpoints, with a different tool surface (career/Wikidata cross-referencing, historical data back to 1848).
- [DoveVannoINostriSoldi](https://github.com/Italian-Builders-Org/DoveVannoINostriSoldi) — public spending/budget data (SIOPE, ANAC, OpenBDAP), including Camera's own administrative budget — complements RepublicMCP's institutional data.
- [mcp-legal-it](https://github.com/capazme/mcp-legal-it) / [BetterCallClaude Italia](https://github.com/fedec65/bettercallclaude_italia) — Normattiva, EU law, and case-law citation tools for the legislative side.

## Contributing

Contributions are welcome! Areas for contribution:
- Additional MCP tools for specific use cases
- Query optimization
- Enhanced type definitions
- Documentation improvements
- Bug fixes and testing

## License

MIT

## Resources

### Official Data Sources
- [Camera dei Deputati - Open Data](https://dati.camera.it/)
- [Senato della Repubblica - Open Data](https://dati.senato.it/)
- [Italian Parliament](https://www.parlamento.it/)

### Standards & Specifications
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)
- [FOAF Vocabulary](http://xmlns.com/foaf/spec/)
- [Dublin Core Metadata](http://purl.org/dc/elements/1.1/)

---

**Maintained by**: [Giulio Garofalo](https://github.com/giuliogarofalo) — part of [Open Parlament](https://open-parlament.xyz)
**Version**: 0.3.0 (see [CHANGELOG.md](./CHANGELOG.md))
