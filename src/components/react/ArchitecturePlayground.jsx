import React, { useState, useEffect } from 'react';
import { ReactFlow, Controls, Background, MarkerType, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Database, Server, Cloud, Cpu, Activity, HardDrive, Network, Layers, ShieldCheck, 
  MonitorPlay, BrainCircuit, Clock, Code2, Users
} from 'lucide-react';

const iconMap = {
  db: <Database size={20} strokeWidth={1.5} />,
  server: <Server size={20} strokeWidth={1.5} />,
  cloud: <Cloud size={20} strokeWidth={1.5} />,
  cpu: <Cpu size={20} strokeWidth={1.5} />,
  activity: <Activity size={20} strokeWidth={1.5} />,
  storage: <HardDrive size={20} strokeWidth={1.5} />,
  network: <Network size={20} strokeWidth={1.5} />,
  layers: <Layers size={20} strokeWidth={1.5} />,
  shield: <ShieldCheck size={20} strokeWidth={1.5} />,
  monitor: <MonitorPlay size={20} strokeWidth={1.5} />,
  ai: <BrainCircuit size={20} strokeWidth={1.5} />,
  clock: <Clock size={20} strokeWidth={1.5} />,
  code: <Code2 size={20} strokeWidth={1.5} />,
  users: <Users size={20} strokeWidth={1.5} />
};

// --- Custom Node ---
const BlockNode = ({ data, selected }) => {
  const label = data.label?.[data.lang] || data.label || '';
  const sublabel = data.sublabel?.[data.lang] || data.sublabel || '';

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: 'var(--color-card-bg)',
        border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: '8px',
        minWidth: '150px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: selected ? '0 0 15px rgba(56, 189, 248, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        color: 'var(--color-text)',
        transition: 'all 0.2s ease',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: 'var(--color-primary)', border: 'none' }} />
      <Handle type="target" position={Position.Top} id="top" style={{ background: 'var(--color-primary)', border: 'none' }} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={{ background: 'var(--color-primary)', border: 'none' }} />
      
      <div style={{ color: 'var(--color-primary)', display: 'flex' }}>
        {iconMap[data.icon] || <Server size={20} />}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: '14px', fontFamily: 'var(--font-sans)' }}>{label}</div>
        {sublabel && (
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', fontFamily: 'var(--font-sans)' }}>
            {sublabel}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} style={{ background: 'var(--color-primary)', border: 'none' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: 'var(--color-primary)', border: 'none' }} />
      <Handle type="source" position={Position.Top} id="top-source" style={{ background: 'var(--color-primary)', border: 'none' }} />
    </div>
  );
};

const nodeTypes = {
  block: BlockNode,
};

// --- Data Scenarios Structure ---
const companies = {
  kocliko: {
    label: "Kocliko",
    projects: {
      data: {
        title: { fr: "Data Pipeline", en: "Data Pipeline" },
        metrics: {
          legacy: { fr: "Monolithique | Exécution: 6h", en: "Monolith | Execution: 6h" },
          modern: { fr: "Modulaire & Temps Réel | Exécution: 40min", en: "Modular & Realtime | Execution: 40min" }
        },
        legacy: {
          nodes: [
            { id: 'iot', type: 'block', position: { x: 50, y: 150 }, data: { label: { fr: 'Providers IoT', en: 'IoT Providers' }, icon: 'network' } },
            { id: 'cron', type: 'block', position: { x: 300, y: 30 }, data: { label: { fr: 'Cronjob Linux', en: 'Linux Cronjob' }, sublabel: { fr: 'Orchestration', en: 'Orchestration' }, icon: 'clock' } },
            { id: 'django', type: 'block', position: { x: 300, y: 150 }, data: { label: { fr: 'App Django', en: 'Django App' }, sublabel: { fr: 'Pull, Calc & Store', en: 'Pull, Calc & Store' }, icon: 'server' } },
            { id: 'pg', type: 'block', position: { x: 580, y: 150 }, data: { label: { fr: 'PostgreSQL', en: 'PostgreSQL' }, sublabel: { fr: 'Data & Résultats', en: 'Data & Results' }, icon: 'db' } },
          ],
          edges: [
            { id: 'e1', source: 'cron', target: 'django', sourceHandle: 'bottom', targetHandle: 'top', animated: true, style: { stroke: 'var(--color-accent)' } },
            { id: 'e2', source: 'iot', target: 'django', animated: true, style: { stroke: 'var(--color-border)' } },
            { id: 'e3', source: 'django', target: 'pg', animated: true, style: { stroke: 'var(--color-border)' } }
          ]
        },
        modern: {
          nodes: [
            { id: 'iot_p', type: 'block', position: { x: 20, y: 50 }, data: { label: { fr: 'IoT Providers', en: 'IoT Providers' }, icon: 'network' } },
            { id: 'air_pull', type: 'block', position: { x: 220, y: 50 }, data: { label: { fr: 'Airflow Pull', en: 'Airflow Pull' }, sublabel: { fr: "Tasks d'ingestion", en: 'Ingestion Tasks' }, icon: 'cpu' } },
            { id: 'mongo_p', type: 'block', position: { x: 450, y: 50 }, data: { label: { fr: 'Mongo DB', en: 'Mongo DB' }, sublabel: { fr: 'Stockage brut', en: 'Raw Storage' }, icon: 'db' } },
            
            // Client MQTT
            { id: 'iot_m', type: 'block', position: { x: 20, y: 250 }, data: { label: { fr: 'IoT (Gros Client)', en: 'IoT (Main Client)' }, icon: 'network' } },
            { id: 'mqtt', type: 'block', position: { x: 220, y: 250 }, data: { label: { fr: 'Scaleway MQTT', en: 'Scaleway MQTT' }, sublabel: { fr: 'Serverless + Queue', en: 'Serverless + Queue' }, icon: 'cloud' } },
            { id: 'mongo_t', type: 'block', position: { x: 450, y: 250 }, data: { label: { fr: 'Mongo TimeSeries', en: 'Mongo TimeSeries' }, sublabel: { fr: 'Optimisé temps réel', en: 'Real-time Optimized' }, icon: 'storage' } },
            
            // Central Data
            { id: 'air_calc', type: 'block', position: { x: 700, y: 150 }, data: { label: { fr: 'Airflow Calc', en: 'Airflow Calc' }, sublabel: { fr: 'Calcul des KPIs', en: 'KPIs Calculation' }, icon: 'cpu' } },
            { id: 'backup', type: 'block', position: { x: 450, y: 150 }, data: { label: { fr: 'Backups', en: 'Backups' }, sublabel: { fr: 'Hot & Cold Storage', en: 'Hot & Cold Storage' }, icon: 'shield' } },
            { id: 'pg', type: 'block', position: { x: 920, y: 150 }, data: { label: { fr: 'PostgreSQL', en: 'PostgreSQL' }, sublabel: { fr: 'Résultats', en: 'Results' }, icon: 'db' } },
          ],
          edges: [
            { id: 'e1', source: 'iot_p', target: 'air_pull', animated: true, style: { stroke: 'var(--color-primary)' } },
            { id: 'e2', source: 'air_pull', target: 'mongo_p', animated: true, style: { stroke: 'var(--color-primary)' } },
            
            { id: 'e3', source: 'iot_m', target: 'mqtt', animated: true, style: { stroke: 'var(--color-secondary)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-secondary)' } },
            { id: 'e4', source: 'mqtt', target: 'mongo_t', animated: true, style: { stroke: 'var(--color-secondary)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-secondary)' } },
            
            { id: 'e5', source: 'mongo_p', target: 'air_calc', sourceHandle: 'right', targetHandle: 'top', animated: true, style: { stroke: 'var(--color-primary)' } },
            { id: 'e6', source: 'mongo_t', target: 'air_calc', sourceHandle: 'right', targetHandle: 'bottom-target', animated: true, style: { stroke: 'var(--color-secondary)' } },
            
            { id: 'e7', source: 'mongo_p', target: 'backup', sourceHandle: 'bottom', targetHandle: 'top', animated: false, style: { stroke: 'var(--color-border)', strokeDasharray: '5 5' } },
            { id: 'e8', source: 'mongo_t', target: 'backup', sourceHandle: 'top-source', targetHandle: 'bottom-target', animated: false, style: { stroke: 'var(--color-border)', strokeDasharray: '5 5' } },

            { id: 'e9', source: 'air_calc', target: 'pg', animated: true, style: { stroke: 'var(--color-primary)' } },
          ]
        }
      },
      web: {
        title: { fr: "Application Web", en: "Web Application" },
        metrics: {
          legacy: { fr: "Lenteurs | Maintenance Complexe", en: "Slow UX | Complex Maintenance" },
          modern: { fr: "Temps < 1s | Modulaire | Scalable", en: "Response < 1s | Modular | Scalable" }
        },
        legacy: {
          nodes: [
            { id: 'users', type: 'block', position: { x: 50, y: 150 }, data: { label: { fr: 'Utilisateurs', en: 'Users' }, icon: 'users' } },
            { id: 'django', type: 'block', position: { x: 300, y: 150 }, data: { label: { fr: 'Monolithe Django', en: 'Django Monolith' }, sublabel: { fr: 'Toutes les features', en: 'All features' }, icon: 'server' } },
            { id: 'pg', type: 'block', position: { x: 580, y: 150 }, data: { label: { fr: 'PostgreSQL', en: 'PostgreSQL' }, icon: 'db' } },
          ],
          edges: [
            { id: 'e1', source: 'users', target: 'django', animated: false, style: { stroke: '#ef4444', strokeWidth: 2 } }, // Red for slowness
            { id: 'e2', source: 'django', target: 'pg', animated: false, style: { stroke: 'var(--color-border)' } }
          ]
        },
        modern: {
          nodes: [
            { id: 'cli_react', type: 'block', position: { x: 50, y: 50 }, data: { label: { fr: 'Front Clients', en: 'Clients Front' }, sublabel: { fr: 'React', en: 'React' }, icon: 'monitor' } },
            { id: 'adm_react', type: 'block', position: { x: 50, y: 250 }, data: { label: { fr: 'Front Admins', en: 'Admins Front' }, sublabel: { fr: 'React', en: 'React' }, icon: 'monitor' } },
            
            { id: 'cli_fast', type: 'block', position: { x: 320, y: 50 }, data: { label: { fr: 'FastAPI Clients', en: 'Clients FastAPI' }, sublabel: { fr: 'Microservice', en: 'Microservice' }, icon: 'code' } },
            { id: 'adm_fast', type: 'block', position: { x: 320, y: 250 }, data: { label: { fr: 'FastAPI Admins', en: 'Admins FastAPI' }, sublabel: { fr: 'Microservice', en: 'Microservice' }, icon: 'code' } },
            
            { id: 'ai', type: 'block', position: { x: 320, y: 150 }, data: { label: { fr: 'Assistant IA', en: 'AI Assistant' }, sublabel: { fr: 'Co-Développement', en: 'Co-Development' }, icon: 'ai' } },
            { id: 'pg', type: 'block', position: { x: 600, y: 150 }, data: { label: { fr: 'PostgreSQL', en: 'PostgreSQL' }, icon: 'db' } },
            { id: 'monitor', type: 'block', position: { x: 600, y: 250 }, data: { label: { fr: 'Monitoring', en: 'Monitoring' }, sublabel: { fr: 'Sentry / Metrics', en: 'Sentry / Metrics' }, icon: 'activity' } },
          ],
          edges: [
            { id: 'e1', source: 'cli_react', target: 'cli_fast', animated: true, style: { stroke: 'var(--color-primary)' } },
            { id: 'e2', source: 'adm_react', target: 'adm_fast', animated: true, style: { stroke: 'var(--color-secondary)' } },
            
            { id: 'e3', source: 'cli_fast', target: 'pg', sourceHandle: 'right', targetHandle: 'top', animated: true, style: { stroke: 'var(--color-border)' } },
            { id: 'e4', source: 'adm_fast', target: 'pg', sourceHandle: 'right', targetHandle: 'bottom-target', animated: true, style: { stroke: 'var(--color-border)' } },
            
            { id: 'e5', source: 'adm_fast', target: 'monitor', sourceHandle: 'right', targetHandle: 'left', animated: false, style: { stroke: 'var(--color-border)', strokeDasharray: '3 3' } },
            { id: 'e6', source: 'cli_fast', target: 'monitor', sourceHandle: 'right', targetHandle: 'top', animated: false, style: { stroke: 'var(--color-border)', strokeDasharray: '3 3' } },

            { id: 'e7', source: 'ai', target: 'cli_fast', sourceHandle: 'top-source', targetHandle: 'bottom-target', animated: true, style: { stroke: 'var(--color-accent)' } },
            { id: 'e8', source: 'ai', target: 'adm_fast', sourceHandle: 'bottom', targetHandle: 'top', animated: true, style: { stroke: 'var(--color-accent)' } },
          ]
        }
      }
    }
  },
  merciyanis: {
    label: "MerciYanis",
    projects: {
      webapp: {
        title: { fr: "Application Web & Gateway", en: "Web Application & Gateway" },
        metrics: {
          legacy: { fr: "Perte de temps en déploiements (OVH)", en: "Downtime during deployments (OVH)" },
          modern: { fr: "Continuité de service via Hookdeck & PaaS", en: "Data continuity via Hookdeck & PaaS" }
        },
        legacy: {
          nodes: [
            { id: 'iot', type: 'block', position: { x: 50, y: 150 }, data: { label: { fr: 'Webhooks IoT', en: 'IoT Webhooks' }, icon: 'network' } },
            { id: 'ovh', type: 'block', position: { x: 350, y: 150 }, data: { label: { fr: 'Serveur OVH', en: 'OVH Server' }, sublabel: { fr: 'Docker Monolithe', en: 'Docker Monolith' }, icon: 'server' } },
            { id: 'down', type: 'block', position: { x: 650, y: 150 }, data: { label: { fr: 'Downtime', en: 'Downtime' }, sublabel: { fr: 'Perte de données', en: 'Data Loss' }, icon: 'activity' } },
          ],
          edges: [
            { id: 'e1', source: 'iot', target: 'ovh', animated: false, style: { stroke: '#ef4444', strokeWidth: 2 } },
            { id: 'e2', source: 'ovh', target: 'down', animated: false, style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5 5' } }
          ]
        },
        modern: {
          nodes: [
            { id: 'iot', type: 'block', position: { x: 50, y: 150 }, data: { label: { fr: 'Webhooks IoT', en: 'IoT Webhooks' }, icon: 'network' } },
            { id: 'hookdeck', type: 'block', position: { x: 350, y: 150 }, data: { label: { fr: 'Hookdeck', en: 'Hookdeck' }, sublabel: { fr: 'Event Gateway / Buffer', en: 'Event Gateway / Buffer' }, icon: 'layers' } },
            { id: 'paas', type: 'block', position: { x: 650, y: 150 }, data: { label: { fr: 'PaaS', en: 'PaaS' }, sublabel: { fr: 'Hébergement App', en: 'App Hosting' }, icon: 'cloud' } },
          ],
          edges: [
            { id: 'e1', source: 'iot', target: 'hookdeck', animated: true, style: { stroke: 'var(--color-primary)' } },
            { id: 'e2', source: 'hookdeck', target: 'paas', animated: true, style: { stroke: 'var(--color-secondary)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-secondary)' } }
          ]
        }
      },
      pta: {
        title: { fr: "Projet PTA (Protection Travailleurs)", en: "PTA Project (Worker Protection)" },
        metrics: {
          legacy: { fr: "Nouveau Projet (N/A)", en: "New Project (N/A)" },
          modern: { fr: "500k évènements/mois (Azure Serverless)", en: "500k events/month (Azure Serverless)" }
        },
        legacy: {
          nodes: [
            { id: 'na', type: 'block', position: { x: 350, y: 150 }, data: { label: { fr: 'Infrastructure', en: 'Infrastructure' }, sublabel: { fr: 'Projet inexistant avant', en: 'Nonexistent project before' }, icon: 'cloud' } },
          ],
          edges: []
        },
        modern: {
          nodes: [
            { id: 'ws', type: 'block', position: { x: 50, y: 150 }, data: { label: { fr: 'Appareils PTA', en: 'PTA Devices' }, sublabel: { fr: 'WebSocket', en: 'WebSocket' }, icon: 'network' } },
            { id: 'azure', type: 'block', position: { x: 350, y: 150 }, data: { label: { fr: 'Azure Functions', en: 'Azure Functions' }, sublabel: { fr: 'Décryptage & Serverless', en: 'Decrypt & Serverless' }, icon: 'cpu' } },
            { id: 'api', type: 'block', position: { x: 650, y: 50 }, data: { label: { fr: 'API MerciYanis', en: 'MerciYanis API' }, sublabel: { fr: 'Stockage central', en: 'Central Storage' }, icon: 'server' } },
            { id: 'protect', type: 'block', position: { x: 650, y: 250 }, data: { label: { fr: 'Service Protection', en: 'Protection Service' }, sublabel: { fr: 'Alertes Secours', en: 'Emergency Alerts' }, icon: 'shield' } },
          ],
          edges: [
            { id: 'e1', source: 'ws', target: 'azure', animated: true, style: { stroke: 'var(--color-primary)' } },
            { id: 'e2', source: 'azure', target: 'api', sourceHandle: 'right', targetHandle: 'left', animated: true, style: { stroke: 'var(--color-primary)' } },
            { id: 'e3', source: 'azure', target: 'protect', sourceHandle: 'right', targetHandle: 'left', animated: true, style: { stroke: '#ef4444' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } }
          ]
        }
      }
    }
  },
  lcp: {
    label: "Le Comptoir Des Pharmacies",
    projects: {
      soa: {
        title: { fr: "Refonte App: Serveur vers SOA", en: "App Redesign: Server to SOA" },
        metrics: {
          legacy: { fr: "Lenteurs | Maintenance Complexe (Java Play)", en: "Slow UX | Complex Maintenance (Java Play)" },
          modern: { fr: "Microservices AWS | React | +10x Scalabilité", en: "AWS Microservices | React | +10x Scalability" }
        },
        legacy: {
          nodes: [
            { id: 'usr', type: 'block', position: { x: 50, y: 150 }, data: { label: { fr: 'Utilisateurs', en: 'Users' }, icon: 'users' } },
            { id: 'he', type: 'block', position: { x: 350, y: 150 }, data: { label: { fr: 'Heroku (Play Framework)', en: 'Heroku (Play Framework)' }, sublabel: { fr: 'Monolithe Java', en: 'Java Monolith' }, icon: 'server' } },
            { id: 'crash', type: 'block', position: { x: 650, y: 150 }, data: { label: { fr: 'Instabilité', en: 'Instability' }, sublabel: { fr: 'Charge non tenue', en: 'Overloaded' }, icon: 'activity' } },
          ],
          edges: [
            { id: 'e1', source: 'usr', target: 'he', animated: false, style: { stroke: '#ef4444' } },
            { id: 'e2', source: 'he', target: 'crash', animated: false, style: { stroke: '#ef4444', strokeDasharray: '5 5' } }
          ]
        },
        modern: {
          nodes: [
            { id: 'ds', type: 'block', position: { x: 50, y: 50 }, data: { label: { fr: 'Design System', en: 'Design System' }, sublabel: { fr: 'Composants UI', en: 'UI Components' }, icon: 'layers' } },
            { id: 'f_cli', type: 'block', position: { x: 50, y: 150 }, data: { label: { fr: 'Front Clients', en: 'Clients Front' }, sublabel: { fr: 'React', en: 'React' }, icon: 'monitor' } },
            { id: 'f_adm', type: 'block', position: { x: 50, y: 250 }, data: { label: { fr: 'Front Admins', en: 'Admins Front' }, sublabel: { fr: 'React', en: 'React' }, icon: 'monitor' } },
            
            { id: 'aws', type: 'block', position: { x: 350, y: 150 }, data: { label: { fr: 'Services Back-end', en: 'Backend Services' }, sublabel: { fr: 'Microservices AWS', en: 'AWS Microservices' }, icon: 'cloud' } },
            
            { id: 'cdc', type: 'block', position: { x: 650, y: 50 }, data: { label: { fr: 'Kafka', en: 'Kafka' }, sublabel: { fr: 'Change Data Capture', en: 'Change Data Capture' }, icon: 'layers' } },
            { id: 'pg', type: 'block', position: { x: 650, y: 250 }, data: { label: { fr: 'PostgreSQL', en: 'PostgreSQL' }, sublabel: { fr: 'Transactionnel', en: 'Transactional' }, icon: 'db' } },
          ],
          edges: [
            { id: 'e1', source: 'ds', target: 'f_cli', animated: false, style: { stroke: 'var(--color-border)', strokeDasharray: '5 5' } },
            { id: 'e2', source: 'ds', target: 'f_adm', animated: false, style: { stroke: 'var(--color-border)', strokeDasharray: '5 5' } },
            { id: 'e3', source: 'f_cli', target: 'aws', animated: true, style: { stroke: 'var(--color-primary)' } },
            { id: 'e4', source: 'f_adm', target: 'aws', animated: true, style: { stroke: 'var(--color-secondary)' } },
            { id: 'e5', source: 'aws', target: 'cdc', sourceHandle: 'right', targetHandle: 'left', animated: true, style: { stroke: 'var(--color-accent)' } },
            { id: 'e6', source: 'cdc', target: 'pg', animated: true, style: { stroke: 'var(--color-border)' } },
            { id: 'e7', source: 'aws', target: 'pg', animated: true, style: { stroke: 'var(--color-border)' } }
          ]
        }
      },
      data: {
        title: { fr: "Projet Data & BI", en: "Data & BI Project" },
        metrics: {
          legacy: { fr: "Nouveau Projet (N/A)", en: "New Project (N/A)" },
          modern: { fr: "CA +15% | Data Warehouse + IA", en: "Revenue +15% | Data Warehouse + AI" }
        },
        legacy: {
          nodes: [
            { id: 'na', type: 'block', position: { x: 350, y: 150 }, data: { label: { fr: 'Infrastructure', en: 'Infrastructure' }, sublabel: { fr: 'Projet inexistant avant', en: 'Nonexistent project before' }, icon: 'cloud' } },
          ],
          edges: []
        },
        modern: {
          nodes: [
            { id: 'front', type: 'block', position: { x: 50, y: 50 }, data: { label: { fr: 'Front-end Client', en: 'Client Front-end' }, sublabel: { fr: 'App React', en: 'React App' }, icon: 'monitor' } },
            { id: 'svc_data', type: 'block', position: { x: 300, y: 50 }, data: { label: { fr: 'Service Data', en: 'Data Service' }, sublabel: { fr: 'API Recommandations', en: 'Recommendations API' }, icon: 'code' } },
            { id: 'pg_ops', type: 'block', position: { x: 300, y: 150 }, data: { label: { fr: 'DB Opérationnelle', en: 'Operational DB' }, sublabel: { fr: 'PostgreSQL', en: 'PostgreSQL' }, icon: 'db' } },
            { id: 'prov', type: 'block', position: { x: 300, y: 250 }, data: { label: { fr: 'Providers', en: 'Providers' }, sublabel: { fr: 'Mailchimp, Sheets', en: 'Mailchimp, Sheets' }, icon: 'cloud' } },
            
            { id: 'stitch', type: 'block', position: { x: 550, y: 200 }, data: { label: { fr: 'Stitch Data', en: 'Stitch Data' }, sublabel: { fr: 'ETL / Duplication', en: 'ETL / Duplication' }, icon: 'network' } },
            
            { id: 'airflow', type: 'block', position: { x: 800, y: 50 }, data: { label: { fr: 'Airflow ML', en: 'Airflow ML' }, sublabel: { fr: 'Algorithmes Reco', en: 'Reco Algorithms' }, icon: 'ai' } },
            { id: 'dwh', type: 'block', position: { x: 800, y: 200 }, data: { label: { fr: 'Data Warehouse', en: 'Data Warehouse' }, sublabel: { fr: 'PostgreSQL Data', en: 'PostgreSQL Data' }, icon: 'storage' } },
            { id: 'dbt', type: 'block', position: { x: 800, y: 320 }, data: { label: { fr: 'DBT', en: 'DBT' }, sublabel: { fr: 'Transformations', en: 'Transformations' }, icon: 'code' } },
            
            { id: 'metabase', type: 'block', position: { x: 1050, y: 200 }, data: { label: { fr: 'Metabase', en: 'Metabase' }, sublabel: { fr: 'Aide à la décision', en: 'Decision Support' }, icon: 'activity' } },
          ],
          edges: [
            { id: 'e1', source: 'pg_ops', target: 'stitch', animated: true, style: { stroke: 'var(--color-primary)' }, sourceHandle: 'right', targetHandle: 'top' },
            { id: 'e2', source: 'prov', target: 'stitch', animated: true, style: { stroke: 'var(--color-secondary)' }, sourceHandle: 'right', targetHandle: 'bottom-target' },
            { id: 'e3', source: 'stitch', target: 'dwh', animated: true, style: { stroke: 'var(--color-accent)' }, sourceHandle: 'right', targetHandle: 'left' },
            { id: 'e4', source: 'dbt', target: 'dwh', animated: true, style: { stroke: 'var(--color-text-muted)' }, markerEnd: { type: MarkerType.ArrowClosed } },
            { id: 'e5', source: 'dwh', target: 'dbt', animated: true, style: { stroke: 'var(--color-text-muted)' } },
            { id: 'e6', source: 'dwh', target: 'metabase', animated: true, style: { stroke: 'var(--color-primary)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-primary)'} },
            { id: 'e7', source: 'dwh', target: 'airflow', animated: true, style: { stroke: 'var(--color-accent)' }, sourceHandle: 'top-source', targetHandle: 'bottom-target' },
            { id: 'e8', source: 'airflow', target: 'svc_data', animated: true, style: { stroke: 'var(--color-accent)' }, sourceHandle: 'left', targetHandle: 'right' },
            { id: 'e9', source: 'svc_data', target: 'front', animated: true, style: { stroke: 'var(--color-primary)' }, sourceHandle: 'left', targetHandle: 'right' },
            { id: 'e10', source: 'airflow', target: 'pg_ops', animated: true, style: { stroke: 'var(--color-border)', strokeDasharray: '3 3' }, sourceHandle: 'bottom', targetHandle: 'top' }
          ]
        }
      }
    }
  }
};

export default function ArchitecturePlayground({ lang = 'fr' }) {
  const [activeCompany, setActiveCompany] = useState('kocliko');
  const [activeProject, setActiveProject] = useState('data');
  const [isModern, setIsModern] = useState(false);
  
  // Reset project if switching company doesn't have it
  useEffect(() => {
    const defaultProj = Object.keys(companies[activeCompany].projects)[0];
    if (!companies[activeCompany].projects[activeProject]) {
      setActiveProject(defaultProj);
    }
  }, [activeCompany]);

  const safeProjectKey = companies[activeCompany].projects[activeProject] ? activeProject : Object.keys(companies[activeCompany].projects)[0];
  const currentProject = companies[activeCompany].projects[safeProjectKey];
  const currentGraphInfo = currentProject[isModern ? 'modern' : 'legacy'];

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    const rawNodes = currentProject[isModern ? 'modern' : 'legacy'].nodes;
    const translatedNodes = rawNodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        lang
      }
    }));
    setNodes(translatedNodes);
    setEdges(currentProject[isModern ? 'modern' : 'legacy'].edges);
  }, [activeCompany, safeProjectKey, isModern, lang]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Level 1: Companies */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
        {Object.keys(companies).map(key => (
          <button
            key={key}
            onClick={() => setActiveCompany(key)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: activeCompany === key ? 'var(--color-card-bg)' : 'transparent',
              color: activeCompany === key ? 'var(--color-primary)' : 'var(--color-text-muted)',
              border: `1px solid ${activeCompany === key ? 'var(--color-border)' : 'transparent'}`,
              borderBottom: activeCompany === key ? '2px solid var(--color-primary)' : '1px solid transparent',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {companies[key].label}
          </button>
        ))}
      </div>

      {/* Level 2: Projects & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Projects Subtabs */}
        <div style={{ display: 'flex', gap: '8px', opacity: Object.keys(companies[activeCompany].projects).length > 1 ? 1 : 0.5 }}>
          {Object.keys(companies[activeCompany].projects).map(key => (
            <button
              key={key}
              onClick={() => setActiveProject(key)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: safeProjectKey === key ? 'var(--color-primary)' : 'var(--color-card-bg)',
                color: safeProjectKey === key ? '#000' : 'var(--color-text)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              {companies[activeCompany].projects[key].title[lang]}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsModern(!isModern)}
          style={{
            padding: '8px 24px',
            borderRadius: '99px',
            background: isModern ? 'var(--color-secondary)' : 'var(--color-card-bg)',
            color: isModern ? '#fff' : 'var(--color-text)',
            border: `1px solid ${isModern ? 'var(--color-secondary)' : 'var(--color-border)'}`,
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {isModern ? (lang === 'fr' ? "Voir Avant (Legacy)" : "View Before (Legacy)") : (lang === 'fr' ? "Voir Modernisation" : "View Modernization")}
        </button>
      </div>

      {/* Title & Metrics Card */}
      <div style={{ padding: '16px', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--color-text)', fontSize: '18px' }}>{currentProject.title[lang]}</h3>
          <p style={{ margin: '8px 0 0 0', color: isModern ? 'var(--color-primary)' : '#ef4444', fontWeight: 500 }}>
            {currentProject.metrics[isModern ? 'modern' : 'legacy'][lang]}
          </p>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div style={{ height: '550px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-offset)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.5}
          maxZoom={1.5}
          nodesConnectable={false}
          nodesDraggable={true}
          elementsSelectable={false}
          animated={true}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="var(--color-border)" gap={20} size={1} />
          <Controls 
            style={{
               display: 'flex', 
               flexDirection: 'column', 
               backgroundColor: 'var(--color-card-bg)',
               border: '1px solid var(--color-border)',
               borderRadius: '8px',
               overflow: 'hidden'
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
