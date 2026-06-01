---
layout: main
title: OpenMFE and Agentic Development
priority: 18
summary: Agentic development is reliable to the degree that the work is contained and its result can be checked. An OpenMFE microfrontend provides both, across the methods now in use and when several agents build at once.
---

The reliability of agentic development depends on whether the work is contained and whether its result can be checked. A capable model still drifts from what was asked and reaches further into the code than intended, filling unstated gaps with assumptions it does not surface. Whether those tendencies are caught depends less on the prompt than on the structure of the work itself, on how far a mistake can travel and on whether the intended result is written down in a form a machine can verify. Because that is a matter of architecture rather than tooling, it is also what OpenMFE was designed around: a microfrontend is a bounded unit behind a machine-readable contract, so a change to it stops at the component, and its interface is fixed in a document that can be checked. The sections that follow take the methods of agentic development in turn and show where that containment and that contract do the work.

## Methods of agentic development

Agents are directed along a spectrum. At one end is exploratory iteration, the “vibe coding” Andrej Karpathy named in 2025: prompt, run, inspect, repeat, with the solution found through feedback rather than a plan. Used carelessly it accepts whatever the model returns without review, which earned the term its poor reputation, whereas used with care it is a sound way to explore an unfamiliar problem, the agentic counterpart of a spike. At the other end is spec-driven development, where the intent is written down first and the agent implements against it, a discipline that lifecycle frameworks such as Amazon’s [AI-Driven Development Lifecycle](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/) formalise as a “zone of intent”. Most work moves between the two ends.

Along the whole spectrum the division of labour and its weakness stay the same, in that a person sets the intent, the agent produces the code, and the code drifts from the intent unless something catches the difference. Whichever method is in use, the unresolved problem is verification, which needs two things the method does not itself supply, namely a result small enough to review and a statement of intent precise enough to check against. Both are properties of the unit the agent works on rather than of the prompt.

## The unit of work

A model reasons over the code it can hold in context, and its reliability falls as that context fills, with the [middle of a long context attended to less reliably than the ends](https://arxiv.org/abs/2307.03172). A frontend monolith holds far more than a model can take in, so an agent changing one part works from a fraction of the code and cannot see what else the change touches. The same scale appears in any structural edit, since a rename or a move propagates along call sites, imports and configuration, and the further that graph extends, the more of it the agent has to get right at once.

An OpenMFE microfrontend is bounded the other way, since it is a self-contained unit, frontend and backend together, scoped to a single business concern, and the rest of the system reaches it only through its manifest. The code an agent must hold is the code of one component, and the graph a change propagates through ends at the contract. A mistake is contained for the same reason, because nothing outside the component depends on anything but its declared interface, so the worst case stops at that interface. None of this is needed for a small, coherent application, where one codebase is the better choice, and it begins to matter only once a frontend is large enough to split across units, and across the people or agents that build them.

## A machine-checkable specification

The other half of verification is the statement of intent. Intent usually lives in a prompt or a prose requirement, which is a weak artifact for the purpose, because the same sentence carries more than one reading and leaves regions of behaviour unsaid, while an agent fills those gaps with assumptions it does not disclose. The result compiles and the tests pass while the behaviour diverges from what was meant.

An OpenMFE microfrontend states the part of its intent that other code depends on in a form that avoids this weakness. The manifest declares the element’s tag, the attributes it takes with their types and constraints as JSON Schema, the events it emits with their payload schemas, and the functions it exposes. That interface is fixed before the implementation exists, and the implementation can be examined against it, in that the validator confirms the manifest is well-formed and the contract-history check reports whether a change has altered the interface in a way that breaks an existing consumer. Behaviour is still described in prose and still needs review, but the interface, the part the rest of the system relies on, is unambiguous and machine-checkable.

The same check yields a second property. Every change is meant to alter some behaviour while preserving the rest, and at the interface the contract-history check makes that division explicit, because it records what the interface previously was, so that a change meant to stay internal but nonetheless altering the contract is reported rather than absorbed. The boundary between what may change and what must be preserved is therefore not re-derived from the agent’s reading of the task each time, but held in the contract and checked against it.

## Exploratory work without the usual risk

Exploratory iteration is uncomfortable in a shared codebase because the agent changes code whose effects reach past what anyone is watching, and that discomfort follows from an unbounded unit. A microfrontend’s isolation removes it, since its markup and styles live in the Shadow DOM, it holds no global state, it does not reach into the host page, and it communicates with the rest of the system only through its contract. An agent can therefore rework the inside of one microfrontend as freely as exploration demands, and the furthest a mistake reaches is that component. Once the exploration settles, the result is pinned in the manifest, the checks are run, and an experiment becomes a unit that can be integrated.

## Working with multiple agents

The same boundary that lets one agent work in isolation also lets several work at once, which is the argument microfrontends have always made for teams: independent ownership, with a declared interface as the only point of integration and no shared state behind it. Agents inherit this arrangement directly, in that an agent assigned one microfrontend needs its own component and the manifests of the ones it interacts with, but not their source. What passes between agents is therefore a set of contracts rather than a shared and growing context, and because those contracts are explicit and small, little is lost as the work moves from one agent to the next.

The contract also settles whether the parallel work fits together. When an agent changes its component’s interface in a way that would break a consumer, the contract-history check reports it before integration, while the runtime conformance check measures a finished component against the contract it claims to satisfy, which an agent cannot fake by adjusting its own tests. In an orchestrated setup the manifest is the brief a coordinating agent hands to a sub-agent and the criterion it applies when the work returns. OpenMFE does not address how the agents are scheduled or who is assigned what; it contributes the contract that keeps independently produced parts from colliding.

## Grounding

An agent works from the context it is given, and a microfrontend is described by material an agent can read. The authoritative account is the specification and this documentation, with the manifest schema as its machine-readable form. The conventions that have grown up around agents, such as the `AGENTS.md` file in the [`seed`](https://github.com/openmfe/seed) project, are pointers to that material rather than substitutes for it.

The effect is larger than it first appears, because an agent falls back on the patterns it saw most in training whenever the interface in front of it is unfamiliar or underdescribed, and it does so without announcing it. A precise description of the actual interface keeps it from improvising against an assumption, and a microfrontend’s contract is exactly that, narrow enough to state in full.

## What the approach provides

While OpenMFE neither makes an agent write good code nor removes the need for review, it provides a unit small enough that a mistake is cheap and that the agent can hold it in context, behind a contract precise enough that the result can be checked and a breaking change cannot pass unseen. This combination holds whichever method produced the code, and whether one agent wrote it or several. Why native web components are a steadier target for a model than a fast-moving framework is taken up on the [Why and When](/architecture/why-and-when-openmfe/) page.
