# My Profile

เว็บโปรไฟล์ส่วนตัวสองภาษา (ไทย/อังกฤษ) สร้างด้วย Next.js 16 และ Supabase โฮสต์บน Vercel

ซอร์สโค้ดอยู่ที่ https://github.com/sakda1306/my-profile

## สิ่งที่ต้องมี

- Node.js 20.9+ และ npm
- Supabase CLI (`npx supabase` ก็ได้)
- บัญชี Supabase, Vercel, GitHub และ Google AI Studio

## 1. สร้าง Supabase project

สร้างสอง project บน Supabase: `my-profile-dev` สำหรับพัฒนาและรันเทสต์ และ `my-profile-prod` สำหรับเว็บจริง
จากนั้นผูก project ด้วย Supabase CLI แล้ว push schema (migrations ในโฟลเดอร์ `supabase/`):

```bash
npx supabase login
npx supabase link --project-ref <project-ref ของ dev>
npx supabase db push
```

ทำซ้ำกับ project `my-profile-prod` โดยเปลี่ยน `--project-ref` เป็นของ prod

## 2. ตั้งค่า environment

คัดลอก `.env.example` เป็น `.env.local` แล้วกรอกค่า (ห้าม commit `.env.local`)

| ตัวแปร | ความหมาย |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL ของ Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key ของ project |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key ใช้เฉพาะสคริปต์ใน `scripts/` ห้ามนำไปใช้ในโค้ดแอป |
| `GEMINI_API_KEY` | key ของ Gemini (ใช้ฝั่งเซิร์ฟเวอร์เท่านั้น) |
| `GEMINI_MODEL` | ชื่อโมเดล Gemini ตรวจชื่อล่าสุดใน Google AI Studio ก่อน deploy |
| `CRON_SECRET` | รหัสลับสำหรับเรียก `/api/keepalive` |
| `NEXT_PUBLIC_SITE_URL` | URL ของเว็บ เช่น `http://localhost:3000` (บน Vercel ต้องตั้งเป็นโดเมนจริงของเว็บ ถ้าไม่ตั้งจะใช้ `VERCEL_PROJECT_PRODUCTION_URL` แทน และถ้ายังเป็น localhost ตอน production จะมี warning ใน log) |
| `ADMIN_EMAIL` | อีเมลของผู้ดูแลที่เข้าหลังบ้านได้ |
| `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD` | บัญชีผู้ดูแลสำหรับเทสต์ RLS (ใช้กับ project dev เท่านั้น) |

### Gemini API key

เข้า Google AI Studio (https://aistudio.google.com) เลือก Get API key แล้วสร้าง key
ใช้ free tier ได้ นำค่าที่ได้ไปใส่ใน `GEMINI_API_KEY`

### สร้างผู้ดูแล

ใน Supabase dashboard ของ project ไปที่ Authentication > Users แล้วสร้างผู้ใช้ด้วยอีเมลที่ตรงกับ
`ADMIN_EMAIL` สำหรับ project dev ที่ใช้รันเทสต์ ให้สร้างผู้ใช้ตาม `TEST_ADMIN_EMAIL` และ
`TEST_ADMIN_PASSWORD` โดยเลือก Auto Confirm

## 3. รันในเครื่อง

```bash
npm install
npm run dev
```

เปิด http://localhost:3000

## 4. Seed ข้อมูลเริ่มต้น

```bash
npm run seed
```

- ถ้ามีข้อมูล profile อยู่แล้ว สคริปต์จะหยุดและจบด้วย exit code 2
- `npm run seed -- --force` จะลบแล้วสร้างใหม่เฉพาะ skills, projects และ system sections โดยไม่แตะต้อง profile
- หลัง seed ให้ลบโฟลเดอร์ `.next` แล้วรีสตาร์ท dev server (หรือ redeploy บน Vercel) เพื่อให้หน้าแสดงข้อมูลใหม่

## 5. เทสต์

```bash
npm test          # unit tests
npm run test:rls  # ทดสอบ RLS กับ Supabase project dev
npm run lint
npm run build
```

`npm run test:rls` ต้องตั้ง `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`TEST_ADMIN_EMAIL` และ `TEST_ADMIN_PASSWORD` ให้ชี้ไปที่ project dev และต้องสร้างผู้ดูแลทดสอบไว้แล้ว
(Auto Confirm)

## 6. Deploy บน Vercel

1. Import repo `sakda1306/my-profile` เข้า Vercel
2. ที่ Settings > Environment Variables ใส่เฉพาะตัวแปรเหล่านี้ โดยชี้ไปที่ project `my-profile-prod`
   ของ Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`,
   `GEMINI_MODEL`, `CRON_SECRET` และ `NEXT_PUBLIC_SITE_URL` (ตั้งเป็นโดเมนจริงของเว็บ)
   ห้ามใส่ `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `TEST_ADMIN_EMAIL` และ `TEST_ADMIN_PASSWORD`
   บน Vercel เพราะใช้เฉพาะในเครื่องสำหรับ `npm run seed` และเทสต์ (service role key ข้าม RLS ได้)
3. ตั้ง `CRON_SECRET` เป็นสตริงสุ่มยาว ๆ Vercel Cron จะส่งค่านี้มาเป็น
   `Authorization: Bearer <CRON_SECRET>` ให้อัตโนมัติ
4. `vercel.json` ตั้ง cron เรียก `/api/keepalive` ทุกวันเวลา 03:00 UTC เพื่อไม่ให้ project
   Supabase ฟรีถูกพักเพราะไม่มีการใช้งาน

## 7. Keepalive ของ project dev

Workflow `.github/workflows/keepalive-dev.yml` ping project dev ทุกวัน (และกด Run workflow เองได้)
ตั้ง repository secrets ที่ GitHub: Settings > Secrets and variables > Actions

- `DEV_SUPABASE_URL`
- `DEV_SUPABASE_ANON_KEY`
