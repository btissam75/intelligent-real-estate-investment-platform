# Intelligent Real Estate Investment Platform

Full-stack real-estate investment platform combining blockchain-based property transactions, smart contracts, a Web3 wallet, and a Retrieval-Augmented Generation (RAG) assistant.

## Project overview

The platform brings property discovery, investment workflows, digital ownership, and AI-assisted decision support into one modular application. Blockchain components provide transparent transaction logic, while the RAG assistant retrieves relevant platform knowledge before generating contextual answers for investors.

## Core features

- Browse and evaluate real-estate investment opportunities
- Blockchain-based ownership and transaction workflows
- Solidity smart contracts with Hardhat tooling
- Integrated Web3 wallet experience
- REST API and persistent application data
- RAG-powered assistant for contextual investment and platform questions
- Intent handling and knowledge-retrieval services
- Modular frontend, backend, contracts, wallet, and infrastructure

## RAG assistant

The AI layer is implemented through dedicated services in the API:

- `knowledge.ts` manages retrieval of relevant domain knowledge
- `intents.ts` identifies and routes user requests
- `llm.ts` connects retrieved context to the language-model response workflow

`User question → intent detection → knowledge retrieval → contextual prompt → generated answer`

This design helps the assistant produce answers grounded in platform knowledge instead of relying only on a language model's general knowledge.

## Architecture

```text
immo-back/
├── api/                 # REST API, authentication, data, RAG and services
│   └── src/
│       ├── contracts/
│       ├── routes/
│       ├── server/
│       └── services/    # knowledge.ts, intents.ts, llm.ts, NFT service
├── immo-contracts/      # Solidity smart contracts and Hardhat project
├── immo-wallet/         # Web3 wallet interface
├── immo-web/            # Real-estate investment frontend
└── infra/               # Infrastructure configuration
```

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Web3 integration |
| Backend | Node.js, TypeScript, REST APIs, Prisma |
| AI | RAG workflow, knowledge retrieval, intent routing, LLM integration |
| Blockchain | Solidity, Hardhat, smart contracts, NFT services |
| Infrastructure | Environment-based configuration and modular services |

## Investment workflow

1. A user explores available property opportunities.
2. The platform presents investment information and transaction options.
3. The RAG assistant answers contextual questions using retrieved platform knowledge.
4. The wallet connects the investor to Web3 functionality.
5. Smart contracts execute and record supported blockchain operations.

## Local setup

### Requirements

- Node.js LTS
- npm
- Git
- Environment variables required by each service

### Installation

```bash
git clone https://github.com/btissam75/intelligent-real-estate-investment-platform.git
cd intelligent-real-estate-investment-platform/immo-back
npm install
```

Each application folder may require its own dependency installation and environment configuration. Never commit private keys, wallet seed phrases, API keys, or production secrets.

## Current status

This repository is an evolving prototype. Before production deployment, the smart contracts, authentication, RAG outputs, transaction flows, and security controls require dedicated testing and review.

## Skills demonstrated

Full-stack development · TypeScript · React · Node.js · REST APIs · RAG · LLM integration · Blockchain · Solidity · Hardhat · Web3 · Smart contracts · Prisma

## Author

Btissam Arehal — [arehalbtissam@email.com](mailto:arehalbtissam@email.com)
