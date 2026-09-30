export const TECH_FILTERS = [
  { id: 'react', label: 'React', color: '#61dafb' },
  { id: 'javascript', label: 'JavaScript', color: '#f7df1e' },
  { id: 'css', label: 'CSS', color: '#a259ff' },
  { id: 'node', label: 'Node', color: '#5fa04e' },
  { id: 'python', label: 'Python', color: '#3572a5' },
  { id: 'uiux', label: 'UI/UX', color: '#ff7b72' },
  { id: 'mobile', label: 'Mobile', color: '#3ddc84' },
  { id: 'ai', label: 'AI', color: '#ffb454' },
]

const TECH_LABELS = new Map(
  TECH_FILTERS.map((tech) => [tech.id, tech.label]),
)

const EXTRA_TECH_LABELS = {
  typescript: 'TypeScript',
  nextjs: 'Next.js',
  vite: 'Vite',
  tailwind: 'Tailwind',
  framer: 'Framer Motion',
  postgres: 'PostgreSQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
  graphql: 'GraphQL',
  prisma: 'Prisma',
  docker: 'Docker',
  aws: 'AWS',
  express: 'Express',
  tensorflow: 'TensorFlow',
  pytorch: 'PyTorch',
  openai: 'OpenAI',
  langchain: 'LangChain',
  flutter: 'Flutter',
  reactnative: 'React Native',
  swift: 'Swift',
  kotlin: 'Kotlin',
  figma: 'Figma',
  gsap: 'GSAP',
  d3: 'D3.js',
  three: 'Three.js',
  webgl: 'WebGL',
  svelte: 'Svelte',
  vue: 'Vue',
  supabase: 'Supabase',
  firebase: 'Firebase',
  jest: 'Jest',
  vitest: 'Vitest',
  webpack: 'Webpack',
  pwa: 'PWA',
  rust: 'Rust',
  go: 'Go',
  kafka: 'Kafka',
  kubernetes: 'Kubernetes',
  spark: 'Spark',
  dbt: 'dbt',
  html: 'HTML',
  wordpress: 'WordPress',
  php: 'PHP',
}

export function techLabel(id) {
  return TECH_LABELS.get(id) ?? EXTRA_TECH_LABELS[id] ?? id
}

export function isKnownFilter(id) {
  return TECH_LABELS.has(id)
}

export function techColor(id) {
  const filter = TECH_FILTERS.find((tech) => tech.id === id)
  if (filter) return filter.color
  return '#8b949e'
}