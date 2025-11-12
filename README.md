# RepublicMCP - Italian Parliament Data MCP Server

> MCP (Model Context Protocol) server for querying Italian Parliament open data (Camera dei Deputati and Senato della Repubblica) via SPARQL endpoints.

## Overview

RepublicMCP provides a comprehensive MCP server implementation that enables AI assistants (like Claude) to query Italian Parliament data through 30+ specialized tools. The server integrates with both parliamentary chambers using their official SPARQL endpoints and ontologies.

### Key Features

- **30+ MCP Tools** across both institutions
- **SPARQL-based** queries with type-safe TypeScript implementations
- **Dual Institution Support**: Camera dei Deputati and Senato della Repubblica
- **Modular Architecture** for easy extension
- **Rich Type System** based on official ontologies (OCD and OSR)
- **Production Ready** with comprehensive documentation

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Claude Desktop (for MCP integration)

### Installation

```bash
# Clone and install dependencies
npm install

# Build the project
npm run build
```

### Configuration with Claude Desktop

Add to your `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "republican": {
      "command": "node",
      "args": ["/absolute/path/to/republicMCP/dist/index.js"]
    }
  }
}
```

See [INSTALLATION.md](./INSTALLATION.md) for detailed setup instructions.

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

### Senato della Repubblica (10+ tools)

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
   - Camera module with 19+ tools
   - Senato module with 10+ tools
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

RepublicMCP is designed as a standalone MCP server module within the larger OPEN-PARLAMENT project:

- **republicMCP** (this module): MCP server for parliamentary data access
- **backend** (separate): Handles authentication, memory, and model management (Ollama/Gemini/Anthropic)
- **frontend** (separate): User interface

This isolation ensures clean separation of concerns and modular development.

## Technology Stack

- **TypeScript** - Type-safe implementation
- **Model Context Protocol** - AI integration standard
- **SPARQL** - Semantic web query language
- **Node.js** - Runtime environment

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

**Maintained by**: [Your Name/Organization]
**Last Updated**: 2025-11-12
**Version**: 2.0.0
