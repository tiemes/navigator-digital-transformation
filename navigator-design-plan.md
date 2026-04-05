# Navigator Digitaler Wandel — Design Plan

Research-informed design decisions for the Navigator tool. Builds on the literature review (21 Consensus searches, 45+ papers), question-research mapping, and design insights.

---

## Core Design Philosophy

The Navigator is **not SELFIE**. SELFIE measures digital capacity via Likert scales. The Navigator provokes thinking through reflection questions. This distinction drives every design choice:

- No scores, no benchmarks, no traffic lights
- Questions that create cognitive dissonance, not questions that confirm what people already know
- The output is awareness and conversation, not a report card

---

## Approach: Connection-Based Navigation

### How It Works

The user doesn't walk through topics 1–35 in sequence. Instead:

1. **Entry point**: User chooses a starting topic — either freely from the visual compass, or based on a "quick pulse" that suggests where to start
2. **Reflection**: 2–4 questions per topic, drawn from the full question pool based on user role (teacher, school leader, team) and mode (quick pulse, deep dive, barrier lens)
3. **Connection prompt**: After reflecting on a topic, the Navigator suggests 1–2 connected topics based on:
   - The cross-links defined in `topics.json` (35 topics × ~4 links each = network graph)
   - Relevance signals from the user's responses (e.g., if they mention infrastructure problems while reflecting on teaching, nudge toward infrastructure topics)
4. **User choice**: The user always picks where to go next. The Navigator suggests, never forces.

### Why This Works (Research Basis)

- **Timotheou et al. (2022, 544 cit.)**: Digital capacity is a system — infrastructure, policy, leadership, and competence interact. Linear walkthroughs miss these interdependencies.
- **Self-Determination Theory (Chiu et al., 2024)**: Autonomy (choice) increases engagement. Letting users choose their path respects autonomy.
- **SELFIE collective reflection (Kampylis et al., 2023)**: The most powerful insights come from comparing perspectives across stakeholders. Connection-based navigation naturally surfaces these tensions.

### Navigation Graph

The existing cross-links form a rich network. Key structural observations:

- **Hub topics** (most connections): Vision (16), Leadership (20), Concept (18), Support (19), Learning Culture (8) — these are the topics most likely to be suggested as "next"
- **Bridge topics** (connect different dimensions): Mindsets (6) bridges People ↔ Organisation; Cooperation (24) bridges Team ↔ Teaching; Software/Services (31) bridges Infrastructure ↔ Teaching
- **Cluster density**: Dimension 3 (Organisation) is the most internally connected; Dimension 5 (Infrastructure) is the most self-contained

### Visual Design Idea

The compass/network visualization serves as:
- A map showing where the user has been (visited topics light up)
- A guide showing suggested next steps (connected topics pulse or glow)
- An overview showing which dimensions have been explored and which haven't

---

## Quick Pulse Mode (Cachia-Inspired)

### Concept

Cachia et al. (2023) showed that 8 items from SELFIE can capture nearly the same signal as the full 50+ item instrument. Apply the same principle: a 5–10 minute "quick pulse" that gives a meaningful starting point for deeper reflection.

### Design

- **5 questions, one per dimension** — each question is the most thought-provoking one from that dimension, selected to maximize cross-topic relevance
- **Result**: Not a score, but a **suggested starting topic** — "Based on your responses, you might find it most useful to start with [Topic X]"
- **Team variant**: Each team member does the quick pulse individually. The Navigator shows where the team's responses diverge most — that divergence IS the starting point for collective reflection

### Candidate Quick Pulse Questions (1 per dimension)

**People & Skills**: "Wie offen/neugierig/flexibel sind wir gegenüber dem digitalen Wandel? Wie nutzen wir diese Haltungen für unsere Entwicklung?" (from Mindsets — touches on the most fundamental individual-level factor)

**Teaching & Learning**: "Wie können wir die Unterrichtsqualität ständig verbessern? Welchen Beitrag können digitale Medien zur Verbesserung der Unterrichtsqualität leisten?" (from Learning Culture — connects pedagogy to technology purpose)

**Organisation & Structures**: "Wie stellen wir uns unsere Schule im Jahr 2030 vor? Wohin wollen wir?" (from Vision — surfaces whether a shared vision exists)

**Cooperation & Team**: "Wie hoch ist die Bereitschaft/Energie im Team, sich auf den Veränderungsprozess einzulassen?" (from Dynamics & Emotions — directly measures change readiness)

**Infrastructure**: "Wie zufrieden sind wir mit der bisherigen Infrastruktur?" (from Working Devices — simple but revealing, especially when compared across roles)

---

## User Choice Architecture

Users should always have meaningful choices. Three levels:

### Level 1: Mode Selection

- **Quick Pulse** (5–10 min): 5 questions, get a starting point
- **Free Exploration** (open-ended): Browse the compass, pick any topic, reflect at your own pace
- **Guided Reflection** (30–45 min): The Navigator leads you through a curated path of 6–8 topics
- **Barrier Lens** (20–30 min): Instead of "where do you stand?", explore "what's getting in the way?" — uses Gkrimpizi's three-level barrier framework mapped to Kompass topics

### Level 2: Role Selection

- **Individual teacher**: Focus on classroom-level questions (TPACK-aligned)
- **School leader**: Focus on organizational and leadership questions
- **Team/group**: Collective reflection mode — perspective comparison
- **Whole school**: All perspectives combined, with divergence analysis

### Level 3: Depth Selection (per topic)

- **Quick** (2 questions): Most thought-provoking questions only
- **Standard** (4–5 questions): Balanced selection
- **Deep dive** (all questions): Full set including sharpened additions

---

## AI as a New Topic (Topic 36)

### Decision: Full Topic, Not Sub-Topic

AI deserves its own card because:
- It cuts across all 5 dimensions (competence, teaching, organisation, cooperation, infrastructure)
- Teachers need a dedicated space to make sense of AI — burying it under other topics implies it's "just another tool"
- Research (Ng et al. 2023, Tenberga et al. 2024) shows AI competencies are becoming a distinct category

### Placement

**Dimension 1: People & Skills** — new Topic 36 (or renumber as appropriate), positioned after Mindsets (6).

Rationale: AI is fundamentally a competency and mindset issue right now. As it matures, it may shift toward infrastructure, but today the barrier is understanding and attitudes, not technology availability.

### Card Content

**Name (DE):** Künstliche Intelligenz
**Name (EN):** Artificial Intelligence
**Illustration concept:** Human and AI working together — complementary strengths (empathy/creativity on human side, pattern recognition/speed on AI side), with an open question mark in the middle representing ongoing negotiation.

**Cross-links:** mindsets, media-didactics, application-skills-teachers, interdisciplinary-skills, assessment, media-education-rules, software-services, security, professional-skills-media-cs

**Reflection Questions (DE):**

1. "Welches Verständnis haben wir von künstlicher Intelligenz? Was können KI-Systeme, was nicht? Welche Chancen und Grenzen sehen wir?"
2. "Wie sollen Schüler:innen über KI lernen (Funktionsweise, Stärken, Schwächen, Ethik), um informierte Nutzer:innen und kritische Denker:innen zu werden?"
3. "Welche KI-Tools nutzen oder könnten wir nutzen? Für welche pädagogischen Zwecke? Welche Vorbehalte haben wir?"
4. "Wie gehen wir damit um, dass Schüler:innen KI-Tools bei Aufgaben nutzen können? Wo liegt die Grenze zwischen Unterstützung und Betrug? Wie müssen wir unsere Beurteilung anpassen?"
5. "Wie transparent und ethisch gehen wir mit KI-Systemen um? Wie adressieren wir Datenschutz, Bias und Urheberrecht bei KI-generierten Inhalten?"
6. "Welche KI-Kompetenzen brauchen Lehrpersonen? Wo sehen wir Qualifizierungsbedarf? Wie unterstützen wir Lehrpersonen, die unsicher sind?"
7. "Wie verändert KI die Rolle von Lehrpersonen und Schüler:innen? Welche Aspekte der menschlichen Beziehung werden unverzichtbar?"

### Research basis
- Ng et al. (2023, 345 cit.): DigCompEdu extension for AI
- Chiu et al. (2024): AI literacy + competency framework with self-reflection component
- Tenberga et al. (2024): AI self-assessment tools for teachers
- Pietsch (2024): Digital mindset as key factor
- Mikeladze et al. (2024): Critical review of AI competence frameworks for educators

---

## Research-Backed Additions to Existing Questions

Beyond AI, the question-research mapping identified several gaps. Priority additions:

### Gap 1: Data Literacy / Learning Analytics
**Add to Topic 10 (Assessment):**
- "Welche Daten über das Lernen unserer Schüler:innen sammeln digitale Tools? Wie nutzen wir diese Daten, um den Unterricht zu verbessern?"
- "Wie stellen wir sicher, dass Daten verantwortungsvoll genutzt werden und nicht zu einer Überwachungskultur führen?"

### Gap 2: Digital Well-Being
**Add to Topic 14 (Media Education & Rules):**
- "Wie fördern wir einen gesunden Umgang mit digitalen Medien — bei Schüler:innen UND bei uns selbst als Lehrpersonen?"
- "Wie erkennen und adressieren wir digitalen Stress, Erschöpfung oder Überforderung im Team?"

### Gap 3: Digital Equity (Three-Level Divide)
**Add to Topic 7 (Parent Participation):**
- "Welche Unterschiede gibt es beim Zugang zu Geräten, Kompetenzen und Nutzungsmöglichkeiten zwischen den Familien? Wie begegnen wir diesen Unterschieden?"

**Add to Topic 8 (Learning Culture):**
- "Wie stellen wir sicher, dass digitale Medien die Chancengerechtigkeit fördern und nicht bestehende Ungleichheiten verstärken?"

### Gap 4: Professional Learning Communities
**Add to Topic 24 (Cooperation):**
- "Funktionieren bei uns professionelle Lerngemeinschaften? Welche Rahmenbedingungen brauchen sie, um wirksam zu sein?"
- "Wie pflegen wir das Netzwerk mit Lehrpersonen anderer Schulen, die ähnliche Herausforderungen haben?"

### Gap 5: Sustainability of Transformation
**Add to Topic 22 (Innovation):**
- "Wie stellen wir sicher, dass Innovationen nachhaltig verankert werden und nicht versanden, wenn die Projektzeit vorbei ist?"

---

## Barrier Lens Mode (Gkrimpizi-Inspired)

Alternative navigation mode that reverses the question: instead of "let's explore your school's digital transformation," it asks "what's blocking you?"

### Three Barrier Levels (from Gkrimpizi et al., 2023)

**Teacher-level barriers** → maps to Dimension 1 (People & Skills)
- Skills gaps, low confidence, resistance to change, lack of time, negative attitudes
- Entry question: "Was hält einzelne Lehrpersonen davon ab, digitale Medien sinnvoll einzusetzen?"

**School-level barriers** → maps to Dimensions 2–4 (Teaching, Organisation, Cooperation)
- Lack of vision, weak leadership, no support structures, poor collaboration, no shared concept
- Entry question: "Welche schulinternen Strukturen oder Kulturen bremsen unsere digitale Entwicklung?"

**System-level barriers** → maps to Dimension 5 (Infrastructure) + external factors
- Insufficient infrastructure, funding constraints, legal uncertainty, inadequate external support
- Entry question: "Welche Rahmenbedingungen ausserhalb unserer Schule erschweren den digitalen Wandel?"

After identifying barriers, the Navigator suggests specific topics and questions that address those barriers — creating a targeted reflection path rather than a comprehensive walkthrough.

---

## Implementation Priorities

### Phase 1: Data Layer (now)
- [x] 35 topics with questions in DE/EN (`data/` completed)
- [ ] Add Topic 36 (AI) to `topics.json` and `i18n/de/topics.json` + `en/topics.json`
- [ ] Add gap-filling questions to existing topics
- [ ] Create `data/literature/references.json` linking papers to topics
- [ ] Add barrier-topic mappings to `topics.json`

### Phase 2: Navigation Engine
- [ ] Build connection graph from cross-links
- [ ] Implement quick pulse logic (5 questions → starting topic suggestion)
- [ ] Implement connection-based "next topic" suggestions
- [ ] Role-based question filtering (teacher, leader, team)
- [ ] Depth selection per topic (quick/standard/deep)

### Phase 3: Interaction Modes
- [ ] Free exploration with visual compass
- [ ] Guided reflection with curated paths
- [ ] Barrier lens mode
- [ ] Team mode with perspective comparison

### Phase 4: Intelligence Layer
- [ ] LLM-powered follow-up questions based on user responses
- [ ] Anonymized cross-school comparison ("Schools like yours tend to...")
- [ ] Adaptive question selection based on prior responses

---

## Key Research References

| Concept | Paper | How It Informs Design |
|---------|-------|----------------------|
| Connection graph | Timotheou et al. (2022) | Factor interconnection model validates cross-links |
| Quick pulse | Cachia et al. (2023) | Mini-SELFIE proves short instruments work |
| User choice / autonomy | Chiu et al. (2024) | Self-determination theory: autonomy drives engagement |
| Perspective gaps | Kampylis et al. (2023) | Multi-stakeholder divergence is the insight |
| Barrier taxonomy | Gkrimpizi et al. (2023) | Three-level framework for barrier lens mode |
| AI topic | Ng et al. (2023) | DigCompEdu extension for AI competencies |
| Swiss context | Schmitz et al. (2023), Rauseo et al. (2022), Harder et al. (2025) | Leadership, perception gaps, school profiles |
| Digital equity | Warschauer (2004), van de Werfhorst (2022) | Three-level digital divide for equity questions |
| Assessment validity | Costa et al. (2021) | SELFIE psychometrics as quality benchmark |
| Matthew effect | Castano-Munoz et al. (2022) | Tool adoption can reinforce inequality — design must counter this |

---

**Document prepared:** April 2026
**Status:** Design plan ready for review. Next step: decide technology stack and build Phase 1 data layer additions.
