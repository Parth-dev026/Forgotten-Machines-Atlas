# Forgotten Machines Atlas
### The Machines That Made History

<p align="center">
  An interactive educational digital atlas exploring the historic NASA hardware left on the Moon and Mars — the missions behind it, the science it enabled, and the stories that should not be forgotten.
</p>

<p align="center">
  <a href="https://forgotten-machines-atlas.onrender.com/"><strong>🚀 Open the Live Website</strong></a>
  &nbsp;•&nbsp;
  <a href="https://github.com/Parth-dev026/Forgotten-Machines-Atlas">Source Code</a>
  &nbsp;•&nbsp;
  <a href="https://www.spaceappschallenge.org/">NASA Space Apps Challenge</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white">
  <img alt="Three.js" src="https://img.shields.io/badge/Three.js-3D-black?logo=threedotjs">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs&logoColor=white">
  <img alt="Deployment" src="https://img.shields.io/badge/Deployment-Render-46E3B7?logo=render&logoColor=black">
</p>

---

## 🌌 Project Overview

**Forgotten Machines Atlas** is an interactive digital museum and educational archive created for the 2026 NASA Space Apps Challenge.

Since the beginning of robotic and crewed planetary exploration, spacecraft, landers, rovers, scientific instruments, and mission hardware have been left on the surfaces of the Moon and Mars. Some completed their missions successfully; others stopped transmitting, lost power, or have uncertain present-day conditions.

These machines are more than abandoned equipment. They are evidence of engineering progress, scientific discovery, and humanity's curiosity about worlds beyond Earth.

The Atlas turns this history into an accessible, interactive learning experience. Visitors can explore equipment profiles, navigate Moon and Mars environments, inspect illustrative 3D spacecraft models, follow mission timelines, compare missions, ask an AI Space Historian questions, and test their knowledge through quizzes.

> A digital museum where every machine left behind has a story worth exploring.

## 🏆 NASA Space Apps Challenge 2026

| Detail | Information |
|---|---|
| Challenge | **Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars** |
| Event | NASA Space Apps Challenge 2026 |
| Team | ALPHA Explorers |
| Project | Forgotten Machines Atlas |
| Primary theme | Planetary exploration, space history, science education |
| Live project | [forgotten-machines-atlas.onrender.com](https://forgotten-machines-atlas.onrender.com/) |
| Repository | [Parth-dev026/Forgotten-Machines-Atlas](https://github.com/Parth-dev026/Forgotten-Machines-Atlas) |

### The challenge we address

The challenge asks teams to tell the stories of NASA hardware left on the Moon, Mars, and beyond, introducing school-age space enthusiasts to the equipment and the science it made possible.

Our response is an interactive archive focused on selected lunar and Martian equipment. Rather than presenting mission facts as a long list, the Atlas connects each machine to its purpose, mission, discoveries, historical events, and known or uncertain final status.

### How the project responds

- **Storytelling:** Equipment profiles explain why each machine was sent, what it did, and what remains.
- **Exploration:** Dedicated Moon and Mars sections organize the archive by destination.
- **Visual learning:** Interactive 3D models and planetary environments help visitors understand the hardware.
- **Historical context:** A chronological timeline connects equipment to important mission events.
- **Active learning:** The Historian, comparison tool, glossary, and quizzes encourage visitors to investigate rather than only read.

---

## 🪐 Explore the Atlas

### 1. Mission Control — Homepage

The main entry point to the digital museum.

- Project introduction and featured equipment.
- Overview statistics generated from the equipment catalogue.
- Navigation to Moon, Mars, timeline, and interactive lab sections.
- Context-aware museum presentation and ambient sound.

### 2. Moon Explorer

Explore selected equipment left at lunar landing and experiment sites.

Current catalogue:
- Apollo Lunar Module descent stages
- Lunar Roving Vehicles (LRV-1, LRV-2, and LRV-3)
- Apollo Lunar Surface Experiments Packages (ALSEP)
- Surveyor 1 lander
- Surveyor 3 lander

Visitors can explore equipment profiles and filter the catalogue by available categories and surface-status classifications.

### 3. Mars Explorer

Explore selected robotic missions and landers that helped investigate the Martian surface.

Current catalogue:
- Viking 1 lander
- Viking 2 lander
- Sojourner rover
- Spirit rover (MER-A)
- Opportunity rover (MER-B)

Each profile connects the equipment to its mission, landing site, scientific purpose, discoveries, and mission outcome.

### 4. Equipment Profiles

Each equipment profile is designed as an educational mission dossier.

Depending on the equipment record, it includes:
- Equipment and mission identification
- Destination and landing site
- Launch and landing information
- Mission duration
- Historical background
- Scientific purpose
- Important discoveries
- What remains on the planetary surface
- Mission-ending or current-status information
- Scientific uncertainties
- Links to relevant NASA references

The catalogue distinguishes between equipment intentionally left behind, equipment that stopped operating, and equipment whose physical condition remains uncertain.

### 5. Interactive 3D Equipment Explorer

A Three.js-based environment for inspecting illustrative models of the selected spacecraft and equipment.

Features include:
- Interactive Moon and Mars environments
- Rotatable and zoomable models
- Camera controls
- Equipment selection
- Interactive component hotspots on supported models
- Model-specific geometry and procedural materials
- 3D and static viewing modes
- Software-rendering and WebGL capability checks

The models are constructed in code. They are educational visualizations, not official NASA CAD models or exact engineering-scale digital twins.

### 6. Mission Timeline

A chronological view of important events from the selected mission archive.

- 15 structured historical events.
- Events spanning 1966–2019.
- Moon, Mars, and combined destination filters.
- Ascending and descending chronological sorting.
- Links from timeline events to their associated equipment profiles.

### 7. Search Atlas

A searchable equipment catalogue.

Visitors can narrow results using:
- Search terms
- Destination: Moon or Mars
- Equipment category
- Surface status

The search uses the structured catalogue stored in the project.

### 8. AI Space Historian

Ask educational questions about the equipment and missions in the Atlas.

The Historian:
- Accepts natural-language questions.
- Uses the equipment catalogue and mission timeline as its knowledge base.
- Can focus on a selected equipment profile.
- Supports recent conversation context.
- Returns related equipment profiles.
- Provides verified NASA source links from the catalogue.
- Preserves uncertainty instead of inventing missing scientific facts.

**Accuracy approach:** The server instructs the model to answer from the project's structured archive, avoid inventing specifications or present-day conditions, and identify facts that are unknown or outside the catalogue.

### 9. AI Mission Comparison

Select two different equipment profiles and compare their missions.

The generated comparison covers:
- Mission objectives
- Launch and landing dates
- Operational duration
- Scientific contributions
- Mission outcomes
- Important differences
- Scientific uncertainties

NASA source links associated with both equipment profiles are included in the response.

### 10. AI Knowledge Quiz

An interactive learning and assessment feature.

- Three difficulty levels: Beginner, Intermediate, and Advanced.
- Planetary focus: All, Moon, or Mars.
- Five-question quiz format.
- Answer feedback and explanations.
- NASA source links for questions.
- Final score and session accuracy.
- Option to inspect the equipment connected to a question.

### 11. Space Glossary

A searchable educational reference for space exploration terminology.

The current dataset contains 19 terms, with definitions, context within the Atlas, related equipment, and source references.

### 12. Context-Aware Museum Audio

The Atlas includes a custom ambient audio engine built with the browser's Web Audio API.

- Different sound presets for Mission Control, Moon, Mars, timeline, equipment, and history sections.
- Audio context changes as visitors navigate between sections and scroll through themed content.
- Volume adjustment, mute, pause, and track switching.
- Smooth transitions between audio contexts.
- No external audio-file request is required by the ambient audio engine.

The soundscape is synthesized in the browser from programmed audio oscillators and audio-processing nodes. It is not a NASA mission recording.

### 13. Museum Themes and Viewing Controls

- Multiple visual palettes.
- 3D and static viewing modes.
- Section-aware visual themes.
- Responsive navigation.
- Persistent museum audio controls.

---

## 📊 Project at a Glance

These figures describe the current repository datasets and model specifications, not the total number of objects ever left in space.

| Project component | Current implementation |
|---|---:|
| Equipment profiles | 10 |
| Moon equipment profiles | 5 |
| Mars equipment profiles | 5 |
| Mission timeline events | 15 |
| Space glossary terms | 19 |
| Equipment 3D model specifications | 10 |
| AI-powered tools | 3 |
| Main planetary destinations | 2 |

---

## 🛰️ NASA Data and Resource Usage

NASA's public mission records are the historical and scientific reference foundation of the Atlas.

The project uses NASA resources to research and structure equipment information. The resulting records are stored in local JSON datasets and used by the website and its AI features.

### Primary NASA resource: NSSDCA

The **NASA Space Science Data Coordinated Archive (NSSDCA)** is used as a primary reference for spacecraft and mission catalogue information.

- [NASA NSSDCA — Main archive](https://nssdc.gsfc.nasa.gov/)
- [NASA Science](https://science.nasa.gov/)
- [NASA.gov](https://www.nasa.gov/)

The equipment catalogue includes NSSDCA record links and relevant NASA Science mission pages for each of its ten equipment profiles.

### NASA references represented in the current equipment catalogue

| Equipment | NASA reference |
|---|---|
| Apollo Lunar Module descent stages | [NSSDCA — Apollo 11 Lunar Module](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C) |
| Lunar Roving Vehicles | [NSSDCA — Apollo 15 Lunar Module and LRV-1](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C) · [Apollo 16 LRV-2](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1972-031C) |
| ALSEP scientific packages | [NASA NSSDCA — Apollo ALSEP archive](https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_alsep.html) |
| Surveyor 1 | [NSSDCA — Surveyor 1](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1966-045A) |
| Surveyor 3 | [NSSDCA — Surveyor 3](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A) |
| Viking 1 | [NSSDCA — Viking 1](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C) |
| Viking 2 | [NSSDCA — Viking 2](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-083C) |
| Sojourner | [NSSDCA — Sojourner / Pathfinder rover](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=MESURPR) · [Pathfinder lander](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-068A) |
| Spirit | [NSSDCA — Mars Exploration Rover Spirit](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-027A) |
| Opportunity | [NSSDCA — Mars Exploration Rover Opportunity](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A) |

Additional NASA Science mission pages are linked directly in the individual equipment records. For example, the archive includes Apollo, Surveyor, Viking, Mars Pathfinder, Spirit, and Opportunity mission pages.

### How NASA information enters the project

The data workflow is:

1. **Research:** Consult the NASA NSSDCA catalogue and relevant NASA Science mission pages.
2. **Fact selection:** Identify mission identity, destination, purpose, historical events, discoveries, and available status information.
3. **Structured documentation:** Organize the selected information into equipment and timeline records.
4. **Local datasets:** Store the structured records in JSON files in the repository.
5. **Application:** The React frontend loads those JSON datasets and displays the information.
6. **AI grounding:** The Node/Express backend loads the same catalogue and timeline, builds a compact knowledge base, and supplies it to the Gemini-powered tools.
7. **Source verification:** AI responses are restricted to NASA URLs already present in the relevant catalogue records.

### Data flow diagram

~~~mermaid
flowchart TD
    A["NASA NSSDCA records"] --> D["Research and fact selection"]
    B["NASA Science mission pages"] --> D
    C["NASA.gov references"] --> D
    D --> E["Structured equipment and timeline records"]
    E --> F["equipment-catalog.json"]
    E --> G["mission-timeline.json"]
    H["space-glossary.json"] --> I["React + TypeScript frontend"]
    F --> I
    G --> I
    F --> J["Node.js + Express backend"]
    G --> J
    J --> K["Grounded knowledge base"]
    K --> L["Google Gemini API"]
    L --> M["Historian"]
    L --> N["Mission Comparison"]
    L --> O["Knowledge Quiz"]
    I --> P["Interactive educational experience"]
    M --> P
    N --> P
    O --> P
~~~

### Important data-provenance clarification

The current implementation is a **curated, locally stored archive**, not a live NASA telemetry dashboard or an automatic NASA API synchronization system.

NASA references are linked from the equipment profiles. The facts used by the application are maintained in the repository's JSON datasets. The AI tools use those local records as their knowledge base; they do not independently retrieve live NASA mission telemetry for every question.

The catalogue's <code>lastVerified</code> field currently records **2026-11-13**. Future updates should include source rechecking and an updated verification date.

### Challenge resources not yet represented in the current catalogue

The wider NASA resource list also references Phoenix, InSight, Dawn, NEAR Shoemaker, Pioneer 10 and 11, Ingenuity, and Kepler, among other missions.

These are valuable candidates for future catalogue expansion. They should not be interpreted as already implemented equipment profiles in the current ten-record dataset.

---

## 🧠 AI and Super Intelligence (SI) Transparency

AI is used as an assisting technology for development, visual creation, and interactive educational features. The historical subject and project direction are presented as the team's challenge solution; AI is used to help implement and communicate that solution.

### AI-assisted development

- **Google AI Studio:** Used as the development environment to build and refine the application.
- **Gemini:** Used through the Google GenAI SDK for the interactive Historian, Comparison, and Quiz features.
- **ChatGPT:** Used to help prepare development prompts, project planning, and documentation.

### Runtime AI architecture

The backend currently defines the Gemini model identifier <code>gemini-4-hydrogen</code> in <code>server.ts</code>.

The AI requests follow this path:

~~~mermaid
sequenceDiagram
    participant U as Visitor
    participant F as React frontend
    participant S as Express server
    participant D as Local NASA-based JSON
    participant G as Gemini API

    U->>F: Ask, compare, or generate quiz
    F->>S: POST /api/ai/...
    S->>D: Load relevant catalogue records
    D-->>S: Structured mission knowledge
    S->>G: Prompt with grounded context
    G-->>S: Structured AI response
    S->>S: Validate related IDs and NASA source URLs
    S-->>F: Answer, comparison, or quiz
    F-->>U: Display interactive result
~~~

### AI endpoints implemented in the source code

| Method | Endpoint | Purpose |
|---|---|---|
| GET | <code>/api/health</code> | Server and dataset health information |
| POST | <code>/api/ai/historian</code> | Grounded educational Q&A |
| POST | <code>/api/ai/compare</code> | Compare two equipment records |
| POST | <code>/api/ai/quiz</code> | Generate a knowledge quiz |

The health endpoint is defined in the repository's server code. Its deployed availability should be checked separately from the successful operation of the individual application features.

### Scientific accuracy safeguards

The AI backend is designed to:
- Use the supplied equipment catalogue and mission timeline as its authoritative knowledge base.
- Avoid inventing dates, coordinates, distances, specifications, or modern physical conditions.
- Identify information that is absent from the archive.
- Preserve uncertainties in historical and physical-status records.
- Validate equipment IDs returned by the model.
- Match returned source URLs against NASA references already stored in the catalogue.

AI-generated answers should still be treated as educational summaries and checked against their linked NASA references when precision matters.

---

## 🎨 Visual Assets and 3D Model Provenance

It is important to distinguish between NASA historical information and the visual representations created for this application.

### Static equipment illustrations

The deployed project contains 11 locally stored JPEG illustrations in <code>public/images/</code>, including:
- Homepage hero illustration
- Apollo descent stage
- Lunar rover
- ALSEP station
- Surveyor landers
- Viking landers
- Sojourner rover
- Spirit rover
- Opportunity rover

These images were generated with an AI image-generation tool during development. They are **illustrative visual assets, not NASA archival photographs and not images downloaded from NASA's servers**.

They are stored locally and served by the application. The NASA sources are used for historical research and verification, not as the source of these generated illustrations.

### 3D environments and spacecraft

The Moon and Mars environments and the ten equipment models are procedurally constructed in code using Three.js.

The implementation uses:
- Three.js geometry
- Canvas-generated textures
- Procedural terrain and surface details
- Programmed spacecraft components
- Interactive model hotspots

No external NASA image textures are required for these procedural 3D scenes at runtime.

**Visual accuracy note:** These are educational reconstructions. They should not be interpreted as official NASA engineering models, exact-scale CAD assets, or scientific terrain products.

### Ambient audio

The ambient museum soundscape is synthesized using the Web Audio API. It does not stream NASA recordings or depend on external audio files.

### AI/SI disclosure and NASA branding

The NASA Space Apps Challenge Project Submission Guide requires transparent disclosure of SI-assisted elements. It specifies visible SI-generation indicators for generated images and videos, and descriptive acknowledgement for generated audio, code, and data.

Accordingly:
- AI-generated illustrations must be visibly identified as AI-generated in the project presentation/assets.
- AI-assisted code and development must be disclosed.
- Any AI-generated audio, if added in a future version, must be identified appropriately.
- Generated content must not use, contain, or modify NASA branding or design elements.

The README disclosure is useful provenance documentation; it does not replace any required visible watermark on generated images or videos.

---

## 🧰 Technology Stack

| Technology | Role in the project |
|---|---|
| React 19 | Component-based frontend and interactive user interface |
| TypeScript | Typed application logic and data structures |
| Vite 8 | Frontend development and production build tooling |
| Tailwind CSS 4 | Styling and responsive layouts |
| Three.js | 3D rendering, geometry, materials, and textures |
| React Three Fiber | React integration for Three.js scenes |
| React Three Drei | 3D scene helpers and controls |
| Node.js | Backend JavaScript runtime |
| Express 4 | HTTP server and AI API routes |
| Google GenAI SDK (<code>@google/genai</code>) | Gemini API integration |
| Web Audio API | Procedural ambient audio |
| Motion | UI animation |
| Lucide React | Interface icons |
| Git and GitHub | Version control and source-code hosting |
| Google AI Studio | AI-assisted development environment |
| Render | Live web service hosting |

### Main development tools

- Google AI Studio
- GitHub
- Render
- Node.js
- npm or Bun-compatible tooling
- Visual Studio Code or another TypeScript editor
- Modern browser with WebGL support for 3D exploration

---

## 🏗️ Application Architecture

The project uses a React frontend and an Express backend in the same repository.

~~~mermaid
flowchart TB
    subgraph Client["Frontend — React + TypeScript"]
        A["Mission Control"]
        B["Moon / Mars Explorers"]
        C["Equipment Profiles"]
        D["Timeline and Search"]
        E["3D & AI Lab"]
        F["Glossary and Museum Controls"]
        G["Three.js / React Three Fiber"]
    end

    subgraph Data["Local structured datasets"]
        H["equipment-catalog.json"]
        I["mission-timeline.json"]
        J["space-glossary.json"]
    end

    subgraph Server["Backend — Node.js + Express"]
        K["Express API"]
        L["Knowledge-base builder"]
        M["NASA source validation"]
    end

    N["Google Gemini API"]

    H --> A
    H --> B
    H --> C
    I --> D
    J --> F
    G --> E
    H --> L
    I --> L
    E --> K
    K --> L
    L --> N
    N --> M
    M --> E
~~~

### Main data files

| File | Responsibility |
|---|---|
| <code>public/data/equipment-catalog.json</code> | Ten structured equipment profiles and NASA references |
| <code>public/data/mission-timeline.json</code> | Fifteen historical mission events |
| <code>public/data/space-glossary.json</code> | Nineteen educational glossary terms |
| <code>src/data/equipment3dSpecs.ts</code> | Equipment-specific 3D model specifications |
| <code>src/services/atlasService.ts</code> | Frontend dataset loading, filtering, and statistics |
| <code>src/services/aiService.ts</code> | Frontend requests to the AI API |
| <code>server.ts</code> | Express server, knowledge-base construction, and Gemini API routes |
| <code>src/services/ambientAudioEngine.ts</code> | Procedural ambient audio engine |

---

## 📁 Repository Structure

~~~text
Forgotten-Machines-Atlas/
│
├── public/
│   ├── data/
│   │   ├── equipment-catalog.json
│   │   ├── mission-timeline.json
│   │   └── space-glossary.json
│   │
│   └── images/
│       ├── hero_atlas_horizon.jpg
│       ├── moon_*.jpg
│       └── mars_*.jpg
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── three/
│   │   ├── AboutView.tsx
│   │   ├── AiComparisonView.tsx
│   │   ├── AiHistorianView.tsx
│   │   ├── AiQuizView.tsx
│   │   ├── Equipment3DExplorer.tsx
│   │   ├── EquipmentDetailView.tsx
│   │   ├── InteractiveLabView.tsx
│   │   ├── MissionStoryReader.tsx
│   │   ├── Navbar.tsx
│   │   ├── PlanetaryExplorerView.tsx
│   │   ├── SearchCatalogView.tsx
│   │   └── TimelineView.tsx
│   │
│   ├── context/
│   ├── data/
│   ├── services/
│   │   ├── aiService.ts
│   │   ├── ambientAudioEngine.ts
│   │   └── atlasService.ts
│   │
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
~~~

---

## ⚙️ Run the Project Locally

### Prerequisites

- Node.js installed
- npm installed
- Git installed
- A Google Gemini API key for the AI-powered features
- A modern browser; WebGL support is recommended for 3D features

### 1. Clone the repository

~~~bash
git clone https://github.com/Parth-dev026/Forgotten-Machines-Atlas.git
cd Forgotten-Machines-Atlas
~~~

### 2. Install dependencies

~~~bash
npm install
~~~

### 3. Configure environment variables

Create a <code>.env</code> file in the project root using <code>.env.example</code> as a reference.

~~~env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
~~~

Keep API keys private. Do not commit <code>.env</code> or expose a secret key in frontend code.

### 4. Start the development server

~~~bash
npm run dev
~~~

The repository's development script starts the TypeScript Express server through <code>tsx</code>. Open the local address printed in the terminal.

### 5. Build the frontend

~~~bash
npm run build
~~~

### 6. Start the server

~~~bash
npm start
~~~

The production start script is defined in <code>package.json</code>. Use a Node.js runtime compatible with the repository's TypeScript server setup.

---

## ☁️ Deployment

The live project is hosted on **Render**.

- Live URL: https://forgotten-machines-atlas.onrender.com/
- Source repository: https://github.com/Parth-dev026/Forgotten-Machines-Atlas

The application is deployed as a Node web service so the Express API and frontend can be served from the same application.

### Deployment configuration

When configuring a new deployment, use the repository's actual package scripts and keep the frontend build and backend start commands consistent with the service configuration.

Required runtime secret:
- <code>GEMINI_API_KEY</code> — used by the server to authenticate Gemini API requests.

Never place the Gemini API key in a public repository or frontend environment variable.

Render's free service may spin down after inactivity, which can make the first request slower.

---

## 🚀 Future Scope

The current version establishes the archive, interactive learning experience, and AI-assisted exploration. The following improvements are proposed for future development; they are not claims about features already completed.

### 1. Expand the equipment archive

Add more NASA hardware and mission records, including:
- Phoenix and InSight landers
- Ingenuity helicopter
- Dawn spacecraft
- NEAR Shoemaker
- Pioneer 10 and 11
- Kepler Space Telescope
- Additional lunar surface experiments and robotic missions

Each new record should include primary NASA references, source-backed facts, mission status, and explicit uncertainty notes.

### 2. Stronger source and data provenance

- Add source-level citations for individual facts.
- Record source access and verification dates.
- Add a structured data update workflow.
- Track corrections and historical status changes.
- Explore suitable NASA APIs or downloadable datasets where they add real value.

### 3. More precise planetary mapping

- Add verified landing-site coordinates where supported by NASA sources.
- Introduce map-based equipment exploration.
- Distinguish verified coordinates from approximate or illustrative locations.
- Explore NASA planetary basemaps and elevation products with appropriate attribution.

### 4. Richer 3D educational experiences

- Improve model details and component annotations.
- Add guided model tours.
- Connect 3D hotspots to the relevant scientific and historical facts.
- Explore photogrammetry, official engineering references, or suitable public 3D resources where licensing permits.

### 5. Expanded learning tools

- Add more quiz topics and question sets.
- Provide classroom and teacher-friendly learning activities.
- Add guided mission storytelling.
- Introduce accessible learning modes for younger audiences.
- Support additional languages.

### 6. Accessibility and performance

- Improve keyboard navigation and screen-reader descriptions.
- Add reduced-motion and low-performance modes.
- Optimize image sizes and 3D model loading.
- Improve mobile and tablet experiences.
- Make the educational archive more resilient on slower connections.

### 7. Research and archive collaboration

- Allow contributors to propose new equipment records.
- Add a review process before new scientific information is published.
- Maintain a transparent source and change history.
- Encourage students and space enthusiasts to contribute verified research.

---

## 🔬 Limitations and Responsible Interpretation

To keep the project scientifically transparent:

1. The current catalogue covers ten selected Moon and Mars equipment profiles, not every object NASA has left in space.
2. The JSON datasets are curated project records, not a live NASA database connection.
3. The 3D models and planetary environments are illustrative procedural reconstructions, not official NASA engineering models or precise terrain datasets.
4. The AI tools are grounded in the local catalogue and timeline. They can still make mistakes, so important facts should be checked against linked NASA references.
5. A missing or uncertain physical-status record must not be interpreted as proof of a machine's exact present-day condition.
6. The project does not claim NASA endorsement, partnership, certification, or official affiliation.

---

## 📚 References and Credits

### NASA resources

- [NASA Space Science Data Coordinated Archive (NSSDCA)](https://nssdc.gsfc.nasa.gov/)
- [NASA Science](https://science.nasa.gov/)
- [NASA official website](https://www.nasa.gov/)
- [NASA Space Apps Challenge](https://www.spaceappschallenge.org/)
- [2026 Project Submission Guide](https://www.spaceappschallenge.org/resources/project-submission-guide/)

### Software and libraries

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Three.js](https://threejs.org/)
- [React Three Fiber](https://r3f.docs.pmnd.rs/)
- [React Three Drei](https://github.com/pmndrs/drei)
- [Express](https://expressjs.com/)
- [Google GenAI SDK](https://github.com/googleapis/js-genai)
- [Google AI Studio](https://aistudio.google.com/)
- [Render](https://render.com/)
- [Lucide](https://lucide.dev/)

### NASA disclaimer

NASA does not endorse any non-U.S. Government entity and is not responsible for information contained on non-U.S. Government websites. NASA names and mission references are used for educational and historical identification. This project is an independent student-created entry and is not an official NASA product.

AI-generated illustrations are not NASA photographs. NASA references are provided separately for historical and scientific verification.

---

## 👨‍🚀 Team and Project

**Team:** ALPHA Explorers  
**Project:** Forgotten Machines Atlas  
**Challenge:** Abandoned but not Forgotten  
**Repository maintainer:** [Parth Pal — GitHub](https://github.com/Parth-dev026)

Built as an educational project for the 2026 NASA Space Apps Challenge and continued as a learning and portfolio project.

If you find an issue, a source correction, or an opportunity to improve the archive, please open a GitHub Issue.

---

<p align="center">
  <strong>Machines may stop moving. Their discoveries keep moving humanity forward.</strong>
  <br>
  <a href="https://forgotten-machines-atlas.onrender.com/">Explore Forgotten Machines Atlas →</a>
</p>
