{\rtf1\ansi\ansicpg1252\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\froman\fcharset0 Times-Bold;\f1\froman\fcharset0 Times-Roman;\f2\fmodern\fcharset0 Courier;
}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;}
{\*\listtable{\list\listtemplateid1\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat0\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid1\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid1}
{\list\listtemplateid2\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat0\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid101\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid2}
{\list\listtemplateid3\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat0\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid201\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid3}
{\list\listtemplateid4\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat0\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid301\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid4}}
{\*\listoverridetable{\listoverride\listid1\listoverridecount0\ls1}{\listoverride\listid2\listoverridecount0\ls2}{\listoverride\listid3\listoverridecount0\ls3}{\listoverride\listid4\listoverridecount0\ls4}}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\sa280\partightenfactor0

\f0\b\fs28 \cf0 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 MINTECH ERP: AGENT DIRECTIVES\
\pard\pardeftab720\sa240\partightenfactor0

\fs24 \cf0 1. THE NORTH STAR (CORE MISSION)
\f1\b0  The primary metric for all generated code is human readability and maintainability. Output must reflect the work of a pragmatic, senior engineer. Code must be logically separated and straightforward to decipher and modify.\

\f0\b 2. THE "NEVER" LIST (STRICT BANS)
\f1\b0  Do not execute the following patterns UNLESS the user prompt explicitly includes the exact phrase "AUTHORIZATION OVERRULE".\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls1\ilvl0
\f0\b \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No dangerouslySetInnerHTML:
\f1\b0  Never use this to render object data or user-derived strings. Use standard JSX interpolation to prevent XSS.\
\ls1\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No Inline Style Attributes:
\f1\b0  All layout, grids, and typography must be handled by Tailwind CSS v4 utility classes. Only mutate the 
\f2\fs26 style
\f1\fs24  prop for highly dynamic, mathematically calculated values (e.g., coordinates for 
\f2\fs26 @use-gesture/react
\f1\fs24  bottom sheets).\
\ls1\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No "God Objects":
\f1\b0  Never consolidate IndexedDB logic, Zustand stores, and dense UI rendering into a single component. Enforce the Single Responsibility Principle.\
\ls1\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No Cryptic Naming:
\f1\b0  Never use magic numbers, hardcoded configuration strings hidden in logic, or unsemantic abbreviations.\
\ls1\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No Silent Failures:
\f1\b0  Never write empty catch blocks. Errors in asynchronous Promise chains must be handled or logged explicitly to prevent DOM crashes.\
\pard\pardeftab720\sa240\partightenfactor0

\f0\b \cf0 3. THE ARCHITECTURE PARADIGM (LOCAL-FIRST REACT 19 SPA)
\f1\b0 \
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls2\ilvl0
\f0\b \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Local-First Default:
\f1\b0  Mintech is a Vite-compiled Single Page Application without a standard backend. All data reads and mutations must route through IndexedDB using the Dexie.js 
\f2\fs26 MintechDB_v8
\f1\fs24  schema. Do not write external REST/GraphQL requests.\
\ls2\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Asynchronous Data Flow:
\f1\b0  Manage the asynchronous flow of local data exclusively through React Query (TanStack Query). Rely on its stale-time invalidations to automatically refresh UI lists when Dexie.js updates occur.\
\ls2\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Forms & Integrity:
\f1\b0  Handle heavy data modules (like invoicing) strictly with React Hook Form, operating uncontrolled to maintain the 45ms INP target. All data must pass through Zod runtime validation against TypeScript interfaces prior to database insertion.\
\ls2\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 State Management:
\f1\b0  Use Zustand for global UI state logic. Avoid deep prop-drilling or overusing React Context for broad domain logic.\
\ls2\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Component UI:
\f1\b0  Build interfaces utilizing Shadcn UI and Radix UI primitives to ensure correct ARIA roles. Use Class Variance Authority (CVA) to manage visual states and prevent Tailwind utility collisions.\
\pard\pardeftab720\sa240\partightenfactor0

\f0\b \cf0 4. THE "PRAGMATIC" LIST (ONLY WHEN NECESSARY)
\f1\b0  Execute these patterns only if the alternative creates excessive boilerplate, degrades performance, or is technically unfeasible.\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls3\ilvl0
\f0\b \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Immutability vs. Performance:
\f1\b0  Default to immutable state updates. If manipulating massive data arrays (like bulk invoice generation) causes severe UI stutter, localized mutations are permitted. If mutating, leave a brief comment explaining the performance justification.\
\ls3\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Verbosity over Cleverness:
\f1\b0  If a complex one-liner saves lines but destroys human readability, write the longer, explicit conditional block. Readability always wins.\
\pard\pardeftab720\sa240\partightenfactor0

\f0\b \cf0 5. COMMENTARY & ARTIFACT SUPPRESSION
\f1\b0 \
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls4\ilvl0
\f0\b \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No Prompt Echoing:
\f1\b0  Never reference these directives or user instructions within the codebase or file headers.\
\ls4\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No Meta-Commentary:
\f1\b0  Do not write comments justifying standard syntax choices, such as explaining why React Query or a specific Tailwind class was used.\
\ls4\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No Source Artifacts:
\f1\b0  Never reference screenshots, mockups, or specific wiki files in the code.\
\ls4\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Purpose-Driven Documentation:
\f1\b0  Limit comments strictly to explaining complex calculation logic (e.g., VAT parsing or PDF generation via 
\f2\fs26 @react-pdf/renderer
\f1\fs24 ). Let the code self-document through precise naming.\
}