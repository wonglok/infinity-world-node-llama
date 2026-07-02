# idea

i want to build a new kind of facebook that uses Agent to do discoveries for me so that i dont miss out on news and i dont have to doom scroll and i can let AI do the scrolling for me hahha. i want to make a JSON publising endpoint for each user. so that other poeple can use their hermes and claude code to find others and communicate at my hagnout 3d space. each person will have at least 1 AI avatar agent and a 1 free json publishing endpoint.

# validation

What is the end-to-end, logical framework for building a high-demand, professional app in the era of AI and 'vibe coding'? Specifically, what critical validation questions must I answer before writing any code to prevent building a flawed or unwanted product? Finally, how do I scope a Minimum Viable Product (MVP) that balances essential functional completeness with built-in mechanics for virality and market adoption?

# evaluation

## The Core Idea

A social platform where AI agents curate your feed (no doom-scrolling), users publish via JSON endpoints, and people discover/connect through AI tooling + a 3D hangout space.

## What Works

- **Anti-doom-scroll positioning** is timely. People are exhausted by algorithmic feeds and there's growing appetite for agent-mediated information consumption.
- **JSON-first publishing** is technically interesting — it's essentially an API-per-user model, which aligns with the agentic web direction (AIs calling AIs).
- **AI avatar per user** is a differentiator. Most platforms are bolting AI onto existing UX; starting with AI-native identity could be genuinely novel.

## The Hard Problems

| Problem                                               | Why it matters                                                                                                                                                               |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cold start**                                        | A social platform with no users has no feeds for agents to curate. JSON endpoints with zero readers won't retain publishers.                                                 |
| **Why JSON instead of ActivityPub/AT Protocol?**      | Mastodon and Bluesky already have open protocols for decentralized publishing. Competing standards rarely win; building on an existing one gives you an ecosystem for free.  |
| **3D hangout space is a massive scope risk**          | This alone could be a separate startup. It adds WebGL/WebGPU complexity, bandwidth costs, avatar systems, spatial audio — all before you've validated the core feed concept. |
| **"Let AI scroll for me" is a summarization problem** | This is already being solved by ChatGPT, Perplexity, Arc Browse, etc. Your angle needs to be much sharper than "AI reads your feed."                                         |
| **Agent discovery is an unsolved research problem**   | How does my AI agent find your AI agent? Agent-to-agent communication is an active research area with no settled standards (MCP, A2A are early-stage).                       |

## Critical Validation Questions

Before writing code, answer these:

1. **Who is the first 100-user community?** "Everyone" is not an answer. A social product needs a specific seed community with high posting frequency. Name them.

2. **What does the JSON endpoint publish that Twitter/Bluesky don't?** If it's just text + metadata, you have no moat. What's the unique data shape?

3. **What one thing does your AI agent do that I can't get from Gemini/ChatGPT summarizing my existing feeds?** The answer needs to be 10x better.

4. **Why would someone install Claude Code (developer tool) to discover friends on a social network?** These personas don't overlap.

5. **How do you moderate agent-generated content at scale?** An AI agent publishing on my behalf creates liability and spam risks.

## Suggested MVP Scope

Strip to the one thing that could be viral:

**A single-page web app where you connect once, your AI agent learns your interests, and produces a daily digest + one original post draft.** No 3D space. No JSON endpoints. No agent-to-agent discovery. Just: "Your AI reads the internet so you don't have to, and writes what you would have posted."

If that core loop doesn't retain users after 7 days, nothing else in the vision matters. If it does, layer on the publisher endpoint next, then agent discovery, and only then the 3D space.

## Verdict

The idea has a kernel (agent-mediated social) that's directionally right, but the scope is 3-4 startups bundled into one. The 3D hangout space and custom protocol are premature. Validate the feed curation loop with the smallest possible surface area first.

---

# idea: one big JSON blob of all businesses that the world syncs

Is it a good idea to build a blob of JSONs of all services and businesses and then let the whole world sync it?

No, bluntly. Here's why:

**The blob itself is the easy part.** A JSON file of businesses is just a database dump. Yelp, Google Maps, OpenStreetMap, and every chamber of commerce already have this data. The hard problems aren't the format — they're everything around it:

1. **Who populates and maintains it?** Businesses open, close, change hours, move. Without an incentive to self-report or an army of validators, the data rots within weeks. Google spends billions keeping Maps accurate.

2. **Sync is the wrong primitive.** Nobody wants to download a blob of "all businesses." They want "Italian restaurants open now near me." A sync-everything model is a worse user experience than a query API. It's technically clever and practically useless.

3. **The chicken-egg problem kills it.** No users → no businesses bother publishing → stale data → no users. OpenStreetMap took 20 years and a fanatical volunteer community to get decent coverage, and it still has gaps.

4. **Spam and trust.** An open JSON endpoint for any business becomes a SEO spam vector within hours. Without a trust/reputation layer, you're hosting a phonebook of scams. Moderating this is the real product, not the blob.

The idea you keep circling around — **decentralized, agent-accessible publishing** — is genuinely interesting. But "one big JSON blob everyone syncs" is the wrong shape. What works: lightweight, queryable endpoints with built-in trust signals, small enough to be useful, open enough to be composable. Think RSS feeds for structured data, not a world database dump.
