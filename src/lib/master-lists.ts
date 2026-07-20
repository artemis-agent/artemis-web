export const MASTER_SKILLS = [
  "Python", "JavaScript", "TypeScript", "Go", "Java", "C++", "C#", "Rust", "Ruby", "Swift",
  "React", "Next.js", "Vue.js", "Angular", "Node.js", "Django", "FastAPI", "Spring Boot",
  "PostgreSQL", "MongoDB", "Redis", "MySQL", "Elasticsearch",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
  "GraphQL", "REST APIs", "gRPC", "Kafka", "RabbitMQ",
  "PyTorch", "TensorFlow", "LangChain", "OpenAI", "ML/AI",
  "Git", "CI/CD", "Linux", "Observability", "Prometheus", "Grafana",
  "Figma", "CSS", "Tailwind CSS", "HTML",
  "Product Strategy", "Agile", "Scrum", "Data Analysis",
  "System Design", "Distributed Systems", "Microservices",
];

export const MASTER_ROLES = [
  "Frontend Engineer", "Backend Engineer", "Full Stack Engineer",
  "DevOps Engineer", "SRE", "Platform Engineer",
  "Data Engineer", "Data Scientist", "ML Engineer", "AI Engineer",
  "Mobile Developer (iOS)", "Mobile Developer (Android)", "React Native Developer",
  "Product Manager", "Technical Product Manager",
  "Engineering Manager", "Tech Lead", "Staff Engineer",
  "Designer", "UX Designer", "Product Designer",
  "Solutions Architect", "Cloud Architect",
  "Security Engineer", "QA Engineer", "Embedded Engineer",
  "Blockchain Developer", "Game Developer",
];

export function fuzzyMatch(items: string[], query: string): string[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items
    .filter((item) => item.toLowerCase().includes(q))
    .sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts;
    });
}
