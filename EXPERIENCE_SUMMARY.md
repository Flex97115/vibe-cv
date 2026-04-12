# Synthèse des Expériences Professionnelles - Géry Thrasibule

Ce document synthétise les rôles, les défis techniques (Legacy vs Modern) et les réalisations marquantes de Géry Thrasibule. Il est conçu pour être transmis à tout agent IA afin qu'il comprenne instantanément son passif technique, ses compétences architecturales et managériales.

---

## 1. Kocliko
**Rôle :** VP of Engineering
**Période :** Novembre 2024 - Présent

### 🎯 Mission & Contexte
Diriger la restructuration de l’architecture data et back-end de Kocliko, et guider l'équipe vers des standards d'ingénierie plus élevés (mise en place de GitFlow, tests automatisés, CI/CD, revues de code assistées par IA).

### 🏗️ Réalisations Techniques Majeures
- **Refonte Data Pipeline (Batch -> Temps Réel & Modulaire) :**
  - *Legacy :* Architecture monolithique orchestrée par un script CRON sur Linux. L'application Django s'occupait de tout (Pull depuis les providers IoT, Calculs, Stockage) vers une base de données PostgreSQL unique. Ce process Batch prenait plus de 6h pour s'exécuter et était difficilement scalable.
  - *Moderne :* Transformation vers un pipeline asynchrone modulaire orchestré par **Apache Airflow**. Ingestion des données IoT brutes dans un MongoDB. Les gros clients ont un flux dédié via un **Broker Serverless MQTT** sur Scaleway qui alimente un **MongoDB TimeSeries** (optimisé temps réel). Une autre tâche Airflow récupère ensuite ces données pour calculer les KPIs, stocker les résultats dans le PostgreSQL et archiver les événements (Backup/Cold Storage).
  - *Résultat :* Le temps d'exécution est passé de 6 heures à seulement 40 minutes pour des millions de points par jour.
- **Migration d'Infrastructure :** Migration de l’intégralité de l’infrastructure de AWS vers **Scaleway**, en implémentant une stack Terraform/Terragrunt modulaire (alignée sur la stratégie cloud de l'entreprise).
- **Application Web (Scalabilité) :** Découplage du monolithe Django en microservices **FastAPI** séparant le traitement Front Clients (React) et Front Admins, et intégration massive d'**Assistants IA** pour le co-développement technique.
- **Fiabilité & Ops :** Détection d'erreurs en temps réel avec Sentry et monitoring réseau via Grafana.

---

## 2. MerciYanis
**Rôle :** Head of Engineering
**Période :** Mars 2024 - Octobre 2024

### 🎯 Mission & Contexte
Moderniser la stack technique de MerciYanis, identifier les goulots d'étranglement qui ralentissaient la productivité des développeurs (DX) et assurer la tolérance à la panne pour leurs solutions IoT. Collaboration étroite avec le CTO.

### 🏗️ Réalisations Techniques Majeures
- **Continuité de Service de l'Application Web :**
  - *Legacy :* Un monolithe sur serveur dédié OVH bare-metal (Docker Compose). Lors des déploiements ou des maintenances, l'application devenait indisponible (Downtime) causant la perte des payloads provenant des Webhooks IoT.
  - *Moderne :* Création d'une Event Gateway tampon (**Hookdeck**) permettant de capter et conserver les webhooks IoT, qui sont ensuite relayés de manière asynchrone vers un hébergement **PaaS** cloud. Résolution complète des pertes de données pendant les mises en production. Transition sans coupure de plus de 400 bases de données.
- **Architecture Projet de Protection des Travailleurs Isolés (PTA) :**
  - Création complète d'une infrastructure cloud native ultra-résiliente.
  - *Moderne :* Architecture **100% Serverless sur Azure**. Les dispositifs de protection communiquent via WebSocket vers des Azure Functions. Celles-ci décryptent le payload et l'orientent d'une part vers l'API centrale de MerciYanis (Stockage) et d'autre part vers le Service de Protection pour déclencher les alertes de secours en temps réel.
  - *Résultat :* L’architecture traite de manière fluide plus de 500 000 événements IoT par mois.
- **Monitoring & CI/CD :** Implémentation de New Relic, Sentry, workflows CI/CD avec environnement de test simulé pour soulager les équipes.

---

## 3. Le Comptoir Des Pharmacies (LCDP)
**Rôle :** CTO (Late Founder) & Board Member
**Période :** Janvier 2016 - Janvier 2024 (Reste Board Member à ce jour)

### 🎯 Mission & Contexte
En tant que CTO très orienté technique ("hands-on"), j'ai créé et dirigé le développement de la plateforme de ses tout premiers jours jusqu'à la propulser comme leader incontournable du marché (réunissant plus de la moitié des pharmacies françaises en 8 ans).

### 🏗️ Réalisations Techniques Majeures
- **Refonte SOA (Service-Oriented Architecture) :**
  - *Legacy :* Un monolithe Java (Play Framework) hébergé sur Heroku. Extrêmement lourd à maintenir et très instable en cas de grosse montée en charge (crachait face à l'afflux d'utilisateurs).
  - *Moderne :* Séparation nette et création d'un **Design System** pour alimenter deux interfaces React indépendantes (Clients et Admins). Le Back-end a été re-découpé en **Microservices AWS**. Pour garder le tout synchrone, mise en place d'un système de **Change Data Capture (Kafka)** qui intercepte les modifications réseau pour les synchroniser dans la base transactionnelle PostgreSQL centrale.
  - *Résultat :* Une scalabilité multipliée par 10.
- **Projet Data & BI (+ Algorithmes de Recommandation) :**
  - *Legacy :* L'application ou les outils analytiques venaient faire des requêtes lourdes directement sur la DB Opérationnelle, bloquant ainsi l'application en production. Inexistant au niveau de l'intelligence artificielle.
  - *Moderne :* Création d'une complète *Feedback Loop* de la donnée. Extraction des données SaaS et DB via **Stitch**. Stockage brut dans un nouveau **Data Warehouse** (PostgreSQL Data). Traitement et modélisation de la donnée via **DBT** pour servir d'aide à la décision sur **Metabase**. 
  - *Intelligence Artificielle :* Orchestration de calculs de recommandations via des algorithmes de Machine Learning dans **Airflow ML**. Airflow ML vient lire le Data Warehouse, calcule, puis vient exposer ces données à un **Microservice (Service Data)** AWS qui l'affiche en live aux pharmaciens via l'App React; la donnée prédictive est aussi stockée et archivée côté DB Opérationnelle.
  - *Résultat :* Véritable levier économique amenant à une augmentation significative : **+15 % de marge/chiffre d'affaires** grâce au pipeline Data et aux algorithmes de recommandation client.
- **Culture Produit & Management :** Implémentation des méthodologies Scrum, du développement "API First" (OpenAPI) et de la Clean Architecture. Direction d'une équipe technique pionnière de 7 personnes dotée d'excellents processus internes, lesquels ont ensuite été modélisés et propagés avec succès à l'échelle des autres équipes de l'entreprise pour faire grimper la productivité globale.

---

## Outils & Stack Technologique Globale
- **Cloud & Ops:** AWS, Azure, Scaleway, Terraform, Terragrunt, Docker, Kubernetes, CI/CD, DevOps.
- **Langages & Back-end:** Python, Java, NodeJS, FastAPI, Django, API REST, Kafka/MQTT, WebSocket.
- **Front-end:** ReactJS, Design Systems.
- **Data & DataOps:** PostgreSQL, MongoDB (Core & TimeSeries), Apache Airflow, Apache Parquet, DBT, Stitch, Metabase.
- **Monitoring & Observabilité:** Sentry, Datadog, New Relic, Grafana.
- **Pratiques:** IA Assistée au Dev (Co-Développement), Scrum, Clean Architecture, Serverless, Async Messaging.
