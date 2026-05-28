/* Sample resume data extracted from CV_MiloradTrifunovic_SeniorSoftwareEngineer.pdf.
   Used by the Designer page to preview the styled template against the
   original CV's look. Bullets use **markdown bold** for inline emphasis. */
window.RT = window.RT || {};

RT.SAMPLE_RESUME = {
  name: "Milorad Trifunovic",
  headline: "Senior AI Product Engineer (LLMs, RAG, AI Agents)",
  contact: {
    email: "mtrifunovic435@gmail.com",
    phone: "",
    location: "Belgrade, Serbia",
    linkedin: "https://www.linkedin.com/in/milorad-trifunovi%C4%87-5a16b63b5/",
    website: "",
  },
  summary:
    "Senior AI & Full-Stack Engineer with a background across product engineering, backend systems, and applied AI. I build end-to-end software products that combine Python-based AI systems with modern web applications using React, Next.js, TypeScript, and Node.js. My work spans LLM features, RAG pipelines, agent workflows, APIs, orchestration layers, dashboards, and human-in-the-loop product interfaces. I'm strongest in roles where AI needs to ship inside real products, work reliably in production, and integrate cleanly with frontend, backend, and cloud infrastructure.",
  skills: [
    {
      category: "AI Systems & Machine Learning",
      items: [
        "Python", "PyTorch", "TensorFlow", "scikit-learn", "LLMs", "RAG",
        "Generative AI", "AI Agents", "NLP", "Prompt Engineering",
        "Model Evaluation", "Fine-Tuning", "LangGraph", "LangChain",
      ],
    },
    {
      category: "Frontend & Product Engineering",
      items: [
        "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Express.js",
        "HTML5", "CSS3", "Tailwind CSS", "Product UI Development",
        "Dashboard Development", "SSR/CSR",
      ],
    },
    {
      category: "Backend, APIs & Data Systems",
      items: [
        "FastAPI", "Flask", "Django", "REST APIs", "Microservices",
        "Model Serving", "Data Pipelines", "ETL", "Workflow Automation",
        "PostgreSQL", "MongoDB", "Pinecone", "Weaviate", "FAISS", "Redis",
        "BullMQ", "Celery", "Webhooks",
      ],
    },
    {
      category: "Cloud & Infrastructure",
      items: [
        "AWS (ECS, S3, CloudWatch, Lambda)", "Docker", "GitHub Actions",
        "Vercel", "Redis", "API Gateway", "SQS",
      ],
    },
  ],
  experience: [
    {
      company: "Netguru",
      title: "Senior AI Product Engineer",
      location: "Remote",
      start: "01/2024",
      end: "Present",
      description:
        "Digital product consultancy delivering software engineering, design, and AI solutions for startups and enterprises.",
      bullets: [
        "Led delivery of end-to-end AI product workflows that combined **Python**-based **LLM** services with **React** and **TypeScript** interfaces, turning unstructured inputs into structured outputs for real business workflows.",
        "Built Python-based **RAG pipelines** integrating curated knowledge sources, retrieval, and prompt-grounding logic, improving factual accuracy and reducing unsupported or hallucinated responses by **~30%**.",
        "Designed multi-step **agent workflows** for task routing, retries, tool usage, and exception handling across AI-assisted product flows.",
        "Designed and exposed **model-backed APIs** enabling real-time AI capabilities across internal and customer-facing products, achieving **sub-300ms median latency** and supporting high-throughput usage scenarios.",
        "Implemented full-stack AI product features using **React and TypeScript**, including workflow dashboards and review interfaces, reducing manual review time by **25%** and improving user adoption across internal teams.",
        "Integrated frontend, backend, and AI inference layers into **cohesive production systems**, enabling seamless AI-driven user experiences and reducing system friction across workflows.",
        "Introduced evaluation pipelines for retrieval quality, grounding accuracy, and response reliability, reducing model iteration and validation cycles by **30-35%**.",
        "Deployed and scaled containerized AI services on **AWS**, using **ECS**, **S3**, and **CI/CD** pipelines to improve reliability and streamline releases.",
      ],
    },
    {
      company: "Rossum",
      title: "AI Engineer",
      location: "Remote",
      start: "07/2022",
      end: "12/2023",
      description:
        "Cloud-native AI document automation company building end-to-end workflow automation for transactional business processes.",
      bullets: [
        "Built **Python** services for AI-driven document and transaction processing workflows, reducing manual handling across high-volume operations.",
        "Developed **AI agent-style orchestration logic** to coordinate document ingestion, validation, and exception handling workflows, enabling adaptive decision-making across automated processing pipelines.",
        "Applied **PyTorch** and **scikit-learn** to improve document classification, field extraction, anomaly detection, and exception routing within automated workflow pipelines.",
        "Designed and implemented **workflow orchestration logic** for validation, approval, and post-processing flows, improving end-to-end workflow completion speed by **30%** and reducing manual intervention in document processing.",
        "Delivered model-backed capabilities through **REST APIs** and internal service endpoints, allowing workflow engines and external systems to consume predictions in near real time.",
        "Deployed production-grade ML inference services using **Docker and AWS (ECS, S3)**, enabling scalable model serving and reducing deployment time by **50%** through automated CI/CD workflows.",
        "Designed workflow automation using **n8n** to orchestrate AI-powered document processing pipelines, integrating model outputs with downstream systems through APIs and webhooks.",
      ],
    },
    {
      company: "DeepL",
      title: "Machine Learning Engineer",
      location: "Remote",
      start: "03/2021",
      end: "06/2022",
      description:
        "Language AI company building machine-learning-powered translation, writing, and communication products.",
      bullets: [
        "Engineered **Python**-based NLP pipelines for language processing tasks, improving the quality and consistency of text understanding workflows used in production translation services.",
        "Trained and fine-tuned neural models with **PyTorch** and **TensorFlow** for machine translation quality estimation, language detection, and text classification, improving offline model performance by **15%**.",
        "Applied **scikit-learn** to prototype baseline models, feature extraction workflows, and offline evaluation utilities that accelerated experimentation across NLP projects.",
        "Orchestrated data preparation and feature generation jobs for large multilingual corpora, increasing dataset reliability and reducing preprocessing failures by **25%**.",
        "Operationalized inference services with containerized deployment workflows, helping move ML functionality from experimentation into stable internal and customer-facing systems.",
        "Refined model evaluation and error analysis processes for multilingual outputs, raising confidence in production releases and shortening iteration cycles for new model versions.",
      ],
    },
    {
      company: "SAP",
      title: "Software Engineer",
      location: "Belgrade, Serbia",
      start: "01/2020",
      end: "12/2020",
      description:
        "Global enterprise software company building data, analytics, and intelligent business platforms.",
      bullets: [
        "Developed a full-stack enterprise application using **React, TypeScript, and Node.js**, delivering scalable features for data-driven business workflows.",
        "Built reusable UI components and dashboards to support **analytics and intelligent automation scenarios**, improving usability and feature delivery speed.",
        "Implemented backend services and **RESTful APIs** to process and expose structured business data across distributed systems.",
        "Integrated frontend applications with backend and data services to enable **near real-time data visualization and operational insights**.",
        "Contributed to features aligned with **automation and machine learning-assisted workflows**, enhancing system capabilities for intelligent decision support.",
        "Applied **TypeScript, OOP principles, and modular architecture** to improve code maintainability and scalability across shared components.",
        "Collaborated with cross-functional teams in an agile environment to deliver end-to-end functionality across UI, API, and data layers.",
        "Enhanced application performance by optimizing API response handling and frontend rendering efficiency, reducing page load times by **23%**.",
      ],
    },
    {
      company: "Nordeus",
      title: "Software Engineer I",
      location: "Belgrade, Serbia",
      start: "08/2018",
      end: "12/2019",
      description:
        "A leading game development company building large-scale, real-time mobile gaming platforms.",
      bullets: [
        "Developed gameplay systems and backend services using **Java (Spring Boot)** with strong **object-oriented programming (OOP)** principles, improving modularity and maintainability of game logic.",
        "Designed and implemented scalable services for **player data, game events, and session management**, supporting high-concurrency gameplay environments.",
        "Built internal tools and dashboards using **JavaScript (React)** for game configuration, monitoring, and analytics, reducing manual setup and configuration effort by **30%** and improving visibility into live game operations.",
        "Modeled game mechanics and event systems using **OOP design patterns**, enabling flexible feature extensions and shortening new feature rollout cycles by **20%**.",
        "Integrated **RESTful APIs and messaging systems** to support real-time game interactions and event-driven architecture, improving system responsiveness and ensuring stable handling of high-concurrency player activity.",
        "Optimized performance of backend services by improving data access patterns and reducing response latency.",
        "Investigated and resolved production issues, delivering timely hotfixes that reduced recurring live-service incidents by **30%** and improved system stability during peak usage periods.",
      ],
    },
  ],
  education: [
    {
      school: "University of Belgrade",
      degree: "B.Sc. in Computer Science",
      location: "",
      start: "10/2014",
      end: "08/2018",
      details: "",
    },
  ],
};
