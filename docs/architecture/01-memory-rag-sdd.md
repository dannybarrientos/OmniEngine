# Arquitectura Cognitiva de OmniEngine: Memoria y Grafo de Estados

Este documento detalla la arquitectura de los subsistemas cognitivos que permiten a OmniEngine operar como un sistema de QA autónomo basado en Spec-Driven Development (SDD), utilizando el caché semántico, la memoria vectorial y la toma de decisiones basada en grafos.

## 1. Visión Arquitectónica: Adaptación al Ecosistema QA

| Concepto Arquitectónico Original | Adaptación OmniEngine (QA) |
| :--- | :--- |
| **Contexto del Sistema** | **Estados del DOM / Árboles de Accesibilidad (@eN)** y **Specs EARS** (Easy Approach to Requirements Syntax). |
| **Salida Estructurada** | **Código POM (Page Object Model)** en TypeScript y scripts de **Playwright**. |
| **Protocolo de Ejecución** | **Grafo de Estados (LangGraph)** que dicta el ciclo de vida del testing (Spec -> Parse -> Interact -> Validate). |

---

## 2. Diseño de Subsistemas Cognitivos

### A. Caché Semántico (Nivel 1 - Fast Retrieval)
Su objetivo es la reducción a cero de latencia y coste de inferencia (LLM) cuando OmniEngine se encuentra con una pantalla previamente modelada.
* **Mecanismo:** Hash criptográfico (SHA-256) del DOM minificado o del Árbol de Accesibilidad (AOM).
* **Acción:** Si el hash coincide, el sistema recupera inmediatamente la clase POM y el mapeo de selectores guardados en caché (ej. Redis o un mapa en memoria rápida). Se evita por completo la llamada al modelo generativo.

### B. Memoria Vectorial / RAG (Nivel 2 - Deep Context)
Aquí reside el "conocimiento histórico" y la base de datos de comportamiento de OmniEngine. Se implementa mediante una base de datos vectorial local (ej. LanceDB o ChromaDB).
* **Indexación:** Se convierte el Árbol de Accesibilidad del DOM actual (@eN) y la intención extraída de la Spec EARS en un *embedding* denso.
* **Recuperación:** Cuando el caché semántico falla (es decir, la pantalla es nueva o mutó), buscamos en el RAG los fragmentos de DOM y métodos de Playwright históricamente similares. Esto proporciona el contexto exacto al LLM para escribir código POM coherente con los estándares y el estilo del proyecto.

### C. Grafo de Estados (LangGraph)
Define el flujo determinista y la coreografía de los agentes de la IA durante la automatización.
* **Nodos Principales:** `Ingest_Spec` -> `Extract_DOM_State` -> `Query_Memory` -> `Generate/Heal_POM` -> `Execute_Playwright` -> `Report`.
* **Bordes (Edges) y Decisiones:** Son condicionales que deciden la ruta de acción (crear un test desde cero, aplicar *Self-Healing* a un test existente, o usar un *Cache Hit* perfecto) con base en el Umbral de Indexación.

---

## 3. Umbral de Indexación y Self-Healing

La decisión de ruteo del Grafo de Estados depende de la **Distancia Coseno ($D_c$)** entre el *embedding* del DOM actual (@eN_actual) y el DOM más cercano guardado en la memoria vectorial (@eN_histórico).

* 🟢 **$D_c \ge 0.95$ (Hit Semántico Exacto):** La pantalla está intacta. Se usa el caché.
* 🟡 **$0.75 \le D_c < 0.95$ (Zona de Self-Healing):** Es la misma pantalla, pero su estructura mutó (cambio de selectores, reordenamiento). Se inyecta el POM antiguo al LLM y se regeneran únicamente los locators rotos en Playwright.
* 🔴 **$D_c < 0.75$ (Pantalla Nueva):** El contexto es completamente nuevo. Se ignora el POM histórico y se inicia una generación *Zero-Shot* o *Few-Shot* basada en la nueva Spec EARS.