// Initial bilingual content, based on the GitHub profile README and repos of sakda1306 (2026-10-19).

type Doc = { type: "doc"; content: unknown[] };

const p = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] });
const li = (text: string) => ({ type: "listItem", content: [p(text)] });
const doc = (intro: string, items: string[]): Doc => ({
  type: "doc",
  content: [p(intro), { type: "bulletList", content: items.map(li) }],
});

export const profile = {
  full_name_th: "ศักดา เบ้าคำ",
  full_name_en: "Sakda Baokham",
  headline_th: "นักศึกษาวิศวกรรมคอมพิวเตอร์ | RAG, Agentic AI และ FastAPI",
  headline_en: "Computer Engineering student | RAG, Agentic AI and FastAPI",
  university_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี (มทร.ธัญบุรี)",
  university_en: "Rajamangala University of Technology Thanyaburi (RMUTT)",
  location_th: "ประเทศไทย",
  location_en: "Thailand",
  avatar_path: "https://avatars.githubusercontent.com/u/127590935?v=4",
  github_username: "sakda1306",
  links: [{ label: "GitHub", url: "https://github.com/sakda1306", icon: "github" }],
  bio_th: doc("นักศึกษาวิศวกรรมคอมพิวเตอร์ที่สนใจงาน AI และงานหลังบ้าน", [
    "ทำ RAG และ Agentic AI",
    "ดูแล FastAPI backend ในงานกลุ่ม ทั้ง gateway, auth, Docker Compose และการรวมโมดูล",
    "ทำงานด้าน Computer Vision",
    "เริ่มต้นจาก Android Kotlin และเคยทำ Laravel",
    "เป็นผู้ประสานทีม ทั้งการตกลง contract, git flow และตารางงาน",
  ]),
  bio_en: doc("A computer engineering student interested in AI and backend work.", [
    "Builds RAG and Agentic AI systems",
    "Maintains the FastAPI backend in team projects: gateway, auth, Docker Compose and module integration",
    "Works on Computer Vision",
    "Started with Android Kotlin and has also worked with Laravel",
    "Coordinates teams: contracts, git flow and work schedules",
  ]),
};

export const sections = [
  { type: "hero", slug: "hero", title_th: "ภาพรวม", title_en: "Overview", settings: {} },
  { type: "skills", slug: "skills", title_th: "ความสามารถ", title_en: "Skills", settings: {} },
  { type: "projects", slug: "projects", title_th: "โปรเจกต์", title_en: "Projects", settings: {} },
  { type: "certificates", slug: "certificates", title_th: "ใบประกาศ", title_en: "Certificates", settings: {} },
  { type: "latest_posts", slug: "latest-posts", title_th: "บทความล่าสุด", title_en: "Latest posts", settings: { limit: 3 } },
  { type: "contact", slug: "contact", title_th: "ติดต่อ", title_en: "Contact", settings: {} },
] as const;

type Cat = "language" | "framework" | "tool" | "ai_data" | "soft";
// [name, icon_slug ("" = none), note_th, note_en]
type S = [string, string, string?, string?];

const lists: Record<Cat, S[]> = {
  language: [
    ["Python", "python"], ["TypeScript", "ts"], ["JavaScript", "js"], ["Kotlin", "kotlin"],
    ["PHP", "php"], ["HTML", "html"], ["CSS", "css"], ["Bash", "bash"], ["PowerShell", "powershell"],
  ],
  framework: [
    ["FastAPI", "fastapi"], ["Streamlit", ""], ["Laravel", "laravel"], ["Android", "androidstudio"],
  ],
  ai_data: [
    ["RAG/LLM", ""], ["FAISS", ""], ["OpenCV", "opencv"], ["MediaPipe", ""], ["NumPy", ""], ["Jupyter", ""],
  ],
  tool: [
    ["PostgreSQL", "postgres"], ["Redis", "redis"], ["Docker", "docker"], ["Git", "git"],
    ["GitHub", "github"], ["VS Code", "vscode"], ["Android Studio", "androidstudio"],
  ],
  soft: [
    ["ประสานงานทีม", "", "ประสานงานระหว่างสมาชิกในทีม", "Team coordination"],
    ["วางการทำงานด้วย git flow", "", "วางขั้นตอนทำงานด้วย git flow", "Setting up git flow"],
  ],
};

export const skills = (Object.keys(lists) as Cat[]).flatMap((category) =>
  lists[category].map(([name, icon, note_th, note_en], i) => ({
    name,
    category,
    icon_slug: icon || null,
    note_th: note_th ?? "",
    note_en: note_en ?? "",
    sort_order: i,
  })),
);

const gh = (r: string) => `https://github.com/sakda1306/${r}`;

// Order matters: the first four are featured.
export const projects = [
  {
    slug: "auto-face-blur",
    title_th: "Auto Face Blur", title_en: "Auto Face Blur",
    summary_th: "เครื่องมือเบลอใบหน้าอัตโนมัติในภาพและวิดีโอ",
    summary_en: "Automatic face blurring tool for images and video.",
    my_role_th: "พัฒนาระบบตรวจจับใบหน้าและเบลอด้วย Computer Vision",
    my_role_en: "Built the face detection and blurring pipeline with Computer Vision.",
    stack: ["Python", "OpenCV", "MediaPipe", "YuNet", "Streamlit"],
    repo_url: gh("auto-face-blur-project"),
  },
  {
    slug: "football-assistant",
    title_th: "Football Assistant (Team D-II)", title_en: "Football Assistant (Team D-II)",
    summary_th: "Agentic AI สำหรับตอบคำถามเรื่อง Premier League",
    summary_en: "An Agentic AI assistant for the Premier League.",
    my_role_th: "ดูแล API backend และส่วน retrieval",
    my_role_en: "Maintained the API backend and the retrieval layer.",
    stack: ["Python", "FastAPI", "RAG", "Agentic AI"],
    repo_url: gh("Advanced-Topic-in-Computer-Software-Course-Team-D-II"),
  },
  {
    slug: "travel-safety-assistant",
    title_th: "Travel Safety Assistant (Team D)", title_en: "Travel Safety Assistant (Team D)",
    summary_th: "ผู้ช่วยด้านความปลอดภัยในการเดินทาง พัฒนาโดยทีม 7 คน",
    summary_en: "A travel safety assistant built by a team of 7.",
    my_role_th: "ดูแล API gateway, auth และการรวมโมดูลของทีม",
    my_role_en: "Maintained the API gateway and auth, and integrated the team's modules.",
    stack: ["Python", "FastAPI", "Docker Compose", "PostgreSQL"],
    repo_url: gh("Advanced-Topic-in-Computer-Software-Course-Team-D"),
  },
  {
    slug: "advanced-topics-in-computer-software",
    title_th: "Advanced Topics in Computer Software", title_en: "Advanced Topics in Computer Software",
    summary_th: "สร้างระบบ RAG ตั้งแต่ศูนย์ ใช้ชุดข้อมูลฟุตบอล 1,996 Q&A",
    summary_en: "A RAG system built from scratch on a 1,996 Q&A football dataset.",
    my_role_th: "ออกแบบและพัฒนาระบบ RAG ทั้งระบบ",
    my_role_en: "Designed and built the whole RAG system.",
    stack: ["Python", "RAG", "FAISS", "Jupyter"],
    repo_url: gh("04622404-Advanced-Topics-in-Computer-Software"),
  },
  {
    slug: "bagisto-dev",
    title_th: "Bagisto Dev", title_en: "Bagisto Dev",
    summary_th: "สภาพแวดล้อมพัฒนา Bagisto ด้วย PHP, Laravel และ Docker",
    summary_en: "A Bagisto development environment with PHP, Laravel and Docker.",
    my_role_th: "ตั้งค่าและพัฒนาในสภาพแวดล้อม Docker",
    my_role_en: "Set up and developed in a Docker environment.",
    stack: ["PHP", "Laravel", "Docker"],
    repo_url: gh("Bagisto_Dev"),
  },
  {
    slug: "android-apps",
    title_th: "แอป Android (Programmer Trainee, Record App)", title_en: "Android apps (Programmer Trainee, Record App)",
    summary_th: "แอป Android เขียนด้วย Kotlin",
    summary_en: "Android apps written in Kotlin.",
    my_role_th: "พัฒนาแอปด้วย Kotlin",
    my_role_en: "Developed the apps in Kotlin.",
    stack: ["Kotlin", "Android Studio"],
    repo_url: gh("Programmer_Trainee"),
  },
].map((x, i) => ({ ...x, is_featured: i < 4, sort_order: i }));
