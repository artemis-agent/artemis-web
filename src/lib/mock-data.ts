export interface Job {
  id: string;
  title: string;
  companyName: string;
  companySlug: string;
  location: string;
  description: string;
  source: string;
  seniority: string;
  department: string;
  skills: string[];
  postedAgo: string;
  url: string;
  matchScore?: number;
  employmentType?: string;
  locationType?: string;
  salaryRange?: string;
  shortSummary?: string;
  visaSponsorship?: boolean;
  aboutCompany?: string;
}

export const MOCK_JOBS: Job[] = [
  {
    id: "j1",
    title: "Senior / Staff Product Engineer",
    companyName: "Linear",
    companySlug: "linear",
    location: "North America",
    description: "We're looking for a Senior/Staff Product Engineer to help build the future of project management. You'll work across the full stack on Linear's core product, shipping features used by thousands of teams daily.",
    source: "Ashby",
    seniority: "Senior",
    department: "Engineering",
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    postedAgo: "2h ago",
    url: "https://jobs.ashbyhq.com/linear/example1",
    matchScore: 94,
    employmentType: "Full-time",
    locationType: "Remote",
    aboutCompany: "Linear is a modern project management tool built for high-performance teams. Used by thousands of companies worldwide to streamline their product development workflows.",
  },
  {
    id: "j2",
    title: "Research Engineer",
    companyName: "Anthropic",
    companySlug: "anthropic",
    location: "San Francisco, US",
    description: "Join Anthropic's research team to develop safe, beneficial AI systems. Work on cutting-edge ML research and help shape the future of AI safety.",
    source: "Greenhouse",
    seniority: "Mid",
    department: "Engineering",
    skills: ["Python", "PyTorch", "ML", "Transformers"],
    postedAgo: "5h ago",
    url: "https://boards.greenhouse.io/anthropic/example2",
    matchScore: 91,
    employmentType: "Full-time",
    locationType: "On-site",
    aboutCompany: "Anthropic is an AI safety company working to build reliable, interpretable, and steerable AI systems. Founded by former members of OpenAI.",
  },
  {
    id: "j3",
    title: "Backend Engineer",
    companyName: "Stripe",
    companySlug: "stripe",
    location: "Remote",
    description: "Build the infrastructure that powers internet commerce. Work on Stripe's core payments platform, serving millions of businesses worldwide.",
    source: "Greenhouse",
    seniority: "Senior",
    department: "Engineering",
    skills: ["Ruby", "Go", "Java", "Distributed Systems"],
    postedAgo: "1d ago",
    url: "https://stripe.com/jobs/example3",
    matchScore: 88,
    employmentType: "Full-time",
    locationType: "Remote",
    aboutCompany: "Stripe builds economic infrastructure for the internet. Millions of companies use Stripe to accept payments, grow revenue, and accelerate new business opportunities.",
  },
  {
    id: "j4",
    title: "Staff Fullstack Engineer",
    companyName: "Ramp",
    companySlug: "ramp",
    location: "New York, US",
    description: "Lead full-stack development at Ramp, building the corporate card and expense management platform that saves companies money.",
    source: "Ashby",
    seniority: "Staff",
    department: "Engineering",
    skills: ["Python", "TypeScript", "React", "AWS"],
    postedAgo: "3h ago",
    url: "https://jobs.ashbyhq.com/ramp/example4",
    matchScore: 85,
    employmentType: "Full-time",
    locationType: "Hybrid",
    aboutCompany: "Ramp is a finance automation platform designed to save companies time and money. The corporate card and expense management solution trusted by thousands of businesses.",
  },
  {
    id: "j5",
    title: "Product Designer",
    companyName: "Figma",
    companySlug: "figma",
    location: "Remote",
    description: "Shape the future of design tools at Figma. Create intuitive experiences that empower millions of designers and teams to collaborate.",
    source: "Greenhouse",
    seniority: "Senior",
    department: "Design",
    skills: ["Figma", "Prototyping", "User Research", "Design Systems"],
    postedAgo: "6h ago",
    url: "https://boards.greenhouse.io/figma/example5",
    matchScore: 72,
    employmentType: "Full-time",
    locationType: "Remote",
    aboutCompany: "Figma is the leading collaborative design platform. Teams use Figma to design, prototype, and gather feedback all in one place.",
  },
  {
    id: "j6",
    title: "Product Manager, AI",
    companyName: "Notion",
    companySlug: "notion",
    location: "San Francisco, US",
    description: "Drive the AI product strategy at Notion. Define and ship AI-powered features that help millions of users organize their work and knowledge.",
    source: "Greenhouse",
    seniority: "Senior",
    department: "Product",
    skills: ["Product Strategy", "AI/ML", "Data Analysis", "Agile"],
    postedAgo: "4h ago",
    url: "https://boards.greenhouse.io/notion/example6",
    matchScore: 80,
    employmentType: "Full-time",
    locationType: "Hybrid",
    aboutCompany: "Notion is the connected workspace where better, faster work happens. It combines notes, docs, wikis, and project management into one tool.",
  },
  {
    id: "j7",
    title: "Senior Software Engineer, Platform",
    companyName: "Cloudflare",
    companySlug: "cloudflare",
    location: "Remote",
    description: "Build and scale Cloudflare's edge computing platform. Work on systems that handle millions of requests per second across 300+ cities.",
    source: "Greenhouse",
    seniority: "Senior",
    department: "Engineering",
    skills: ["Go", "Rust", "Linux", "Networking"],
    postedAgo: "8h ago",
    url: "https://boards.greenhouse.io/cloudflare/example7",
    matchScore: 90,
    employmentType: "Full-time",
    locationType: "Remote",
    aboutCompany: "Cloudflare is on a mission to help build a better Internet. Its global cloud platform delivers a broad range of network services to businesses of all sizes.",
  },
  {
    id: "j8",
    title: "Account Executive, Enterprise",
    companyName: "Linear",
    companySlug: "linear",
    location: "North America",
    description: "Drive enterprise sales at Linear. Build relationships with engineering leaders and help organizations adopt modern project management.",
    source: "Ashby",
    seniority: "Mid",
    department: "Sales",
    skills: ["Enterprise Sales", "SaaS", "CRM", "Negotiation"],
    postedAgo: "1d ago",
    url: "https://jobs.ashbyhq.com/linear/example8",
  },
  {
    id: "j9",
    title: "Developer Marketing",
    companyName: "Linear",
    companySlug: "linear",
    location: "Europe",
    description: "Own developer marketing at Linear. Create content, build community, and drive adoption among engineering teams worldwide.",
    source: "Ashby",
    seniority: "Mid",
    department: "Marketing",
    skills: ["Developer Relations", "Content Marketing", "Community", "Technical Writing"],
    postedAgo: "2d ago",
    url: "https://jobs.ashbyhq.com/linear/example9",
  },
  {
    id: "j10",
    title: "Senior Infrastructure Engineer",
    companyName: "Brex",
    companySlug: "brex",
    location: "Remote",
    description: "Design and operate Brex's cloud infrastructure. Build reliable, scalable systems that power the financial platform for growing companies.",
    source: "Greenhouse",
    seniority: "Senior",
    department: "Engineering",
    skills: ["Kubernetes", "Terraform", "AWS", "Go"],
    postedAgo: "12h ago",
    url: "https://boards.greenhouse.io/brex/example10",
    matchScore: 87,
    employmentType: "Full-time",
    locationType: "Remote",
    aboutCompany: "Brex is the AI-powered spend platform that helps companies spend with confidence. From corporate cards to expense management, Brex makes finance effortless.",
  },
  {
    id: "j11",
    title: "Frontend Engineer",
    companyName: "Deel",
    companySlug: "deel",
    location: "Remote",
    description: "Build the global payroll and compliance platform at Deel. Create seamless experiences for companies hiring internationally.",
    source: "Greenhouse",
    seniority: "Mid",
    department: "Engineering",
    skills: ["React", "TypeScript", "Next.js", "GraphQL"],
    postedAgo: "1d ago",
    url: "https://boards.greenhouse.io/deel/example11",
    matchScore: 82,
    employmentType: "Full-time",
    locationType: "Remote",
    aboutCompany: "Deel is the all-in-one payroll and HR platform for global teams. It helps companies hire anyone, anywhere, with compliant payroll and contracts.",
  },
  {
    id: "j12",
    title: "Solutions Engineer",
    companyName: "Grafana Labs",
    companySlug: "grafana-labs",
    location: "London, UK",
    description: "Help enterprise customers succeed with Grafana's observability stack. Bridge the gap between technical solutions and business needs.",
    source: "Greenhouse",
    seniority: "Mid",
    department: "Sales",
    skills: ["Prometheus", "Grafana", "Kubernetes", "Observability"],
    postedAgo: "3d ago",
    url: "https://boards.greenhouse.io/grafanalabs/example12",
  },
];

export const COMPANIES = [
  "Cloudflare", "Anthropic", "Stripe", "Linear", "Ramp",
  "Figma", "Brex", "Notion", "Deel", "Grafana Labs",
  "OpenAI", "Cohere", "CoreWeave", "Snowflake", "Netflix",
];

export function getJobsByCompany(slug: string): Job[] {
  return MOCK_JOBS.filter((j) => j.companySlug === slug);
}

export function getJobById(id: string): Job | undefined {
  return MOCK_JOBS.find((j) => j.id === id);
}

export function searchJobs(query: string): Job[] {
  const q = query.toLowerCase();
  return MOCK_JOBS.filter(
    (j) =>
      j.title.toLowerCase().includes(q) ||
      j.companyName.toLowerCase().includes(q) ||
      j.skills.some((s) => s.toLowerCase().includes(q)) ||
      j.department.toLowerCase().includes(q)
  );
}

export function getTopPicks(): Job[] {
  return MOCK_JOBS.filter((j) => j.matchScore && j.matchScore >= 80)
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
}

export function getLandingJobs(): Job[] {
  // One per company, 5 max
  const seen = new Set<string>();
  return MOCK_JOBS.filter((j) => {
    if (seen.has(j.companySlug)) return false;
    seen.add(j.companySlug);
    return true;
  }).slice(0, 5);
}
