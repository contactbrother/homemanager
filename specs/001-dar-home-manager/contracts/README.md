# Contracts

**There is no wire contract in this feature, and that is deliberate.**

Spec Kit's `contracts/` directory normally holds an API surface: OpenAPI for a REST service,
a schema for GraphQL, a command grammar for a CLI. Dar has none of those. Reads are Supabase
queries issued from Server Components, and writes are Server Actions invoked directly by the
framework. Nothing crosses a network boundary that a second party could implement against, so
there is no protocol to document and no versioned interface to keep stable.

What does exist is an internal surface worth pinning down, because it is what `/speckit-tasks`
decomposes and what an implementer builds against:

| File | Holds |
|---|---|
| [server-actions.md](./server-actions.md) | Every Server Action: its signature, what it validates, what it returns, and which requirements it satisfies |
| [ui-contracts.md](./ui-contracts.md) | Every route: its primary action, its empty, loading and error states, and its guard |

These are contracts in the sense that matters here: they are the agreed shape of the thing
before it is built. They are not an API and must not be published as one.

**Rejected alternative**: writing an OpenAPI document describing Supabase's PostgREST
endpoints. Those endpoints exist, but the application does not call them as a contract; it
calls them through the Supabase client with row level security applied. Documenting them would
describe a surface nobody in this codebase programs against, and would imply a stability
promise the project does not make.
