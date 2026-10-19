# My Profile Phase 1 (ฐานราก) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างเว็บโปรไฟล์สองภาษาที่มีฐานข้อมูล ระบบล็อกอิน หน้าแอดมินครบทุกส่วน ปุ่มแปล ข้อมูลตั้งต้น และ keepalive ส่วนหน้าสาธารณะใช้หน้าตาชั่วคราวไปก่อนจนกว่าจะได้ reference ดีไซน์

**Architecture:** Next.js App Router คุยกับ Supabase โดยตรง ไม่มี backend แยก หน้าสาธารณะ `/[locale]/...` เป็น static/ISR และอ่านข้อมูลด้วย anon key ส่วนหน้าแอดมิน `/admin` เป็น dynamic เขียนข้อมูลผ่าน server actions ภายใต้ RLS เมื่อบันทึกจะ revalidate หน้าสาธารณะทั้งหมด (เว็บเล็ก ทำแบบนี้ได้ง่ายและถูกต้อง) ปุ่มแปลเรียก Gemini ฝั่ง server เท่านั้น

**Tech Stack:** Next.js 15+ (TypeScript strict), Tailwind CSS v4, next-intl, @supabase/supabase-js + @supabase/ssr, Supabase CLI, zod, Tiptap (+ @tiptap/html), dnd-kit, Vitest, tsx

**Spec:** `docs/superpowers/specs/2026-10-19-my-profile-design.md`

## Global Constraints

- Node 20+ และ npm ใช้ async request APIs ของ Next 15+ (`await params`, `await cookies()`, `await draftMode()`) ถ้าเป็น Next 16+ ให้ใช้ `proxy.ts` แทน `middleware.ts`
- **ไม่มีค่าใช้จ่าย:** ใช้เฉพาะแพลนฟรีของ Vercel Hobby, Supabase Free (2 project) และ Gemini API ผ่าน AI Studio
- Supabase สอง project คือ `my-profile-dev` (ใช้ใน `.env.local` และการทดสอบ) กับ `my-profile-prod` (สร้างใน Phase 3)
- ตัวแปร env มีดังนี้ และ `.env.example` มีครบทุกตัวแต่ไม่มีค่า: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`
- `SUPABASE_SERVICE_ROLE_KEY` ใช้ได้เฉพาะใน `scripts/` เท่านั้น ส่วน `GEMINI_API_KEY` ห้ามขึ้นต้นด้วย `NEXT_PUBLIC_` และห้าม import ใน client component
- ข้อความที่แสดงต่อคนดูเก็บเป็น `*_th` และ `*_en` **กฎแสดงภาษา:** ถ้าภาษาที่ขอว่าง ให้แสดงอีกภาษาแทน
- ทุกตารางรายการมี `sort_order int`, `is_visible bool`, `created_at` และ `updated_at`
- หน้าแอดมินเป็นภาษาไทยภาษาเดียว และตั้ง `noindex`
- รูปแปลงเป็น WebP ด้านยาวไม่เกิน 1600px ก่อนอัปโหลด ส่วน PDF จำกัดไฟล์ละ 10 MB
- component ห้ามใส่สีหรือฟอนต์ค่าตายตัว ให้ใช้ token จาก `src/styles/tokens.css` และฟอนต์ต้องรองรับภาษาไทย
- หน้าสาธารณะใน Phase 1 ใช้หน้าตาชั่วคราว ห้ามลงแรงกับดีไซน์
- **กฎ git:** ห้ามมีข้อความอ้างถึงผู้ช่วยเขียนโค้ด ทั้ง trailer ผู้ร่วมเขียนและ footer ประกาศว่าสร้างด้วยเครื่องมือ ห้ามมีในทั้ง commit และไฟล์ ผู้เขียนมีคนเดียวคือ `sakda1306` โฟลเดอร์ตั้งค่าเครื่องมือส่วนตัวห้ามเข้า git **ต้องถามเจ้าของก่อน commit หรือ push ทุกครั้ง** ขั้นตอน "Commit" ในแผนนี้หมายถึงเตรียม commit แล้วขออนุญาตก่อน และห้ามใช้ `--tags` หรือ `--follow-tags`

## Review Focus

1. **ชื่อภาษาไทยล้วนตอนสร้าง slug:** `slugify('สวัสดีครับ', 'post')` ต้องได้ `post-xxxxxx` ไม่ใช่ string ว่าง และ slug ซ้ำต้องได้ข้อความไทยที่อ่านเข้าใจ ไม่ใช่ error 500 (Task 5)
2. **ลิงก์ `javascript:` ในบทความ:** ต้องถูกตัดทิ้งก่อน render และรูปที่ src ไม่ใช่ http(s) ต้องถูกตัดทิ้งด้วย (Task 10)
3. **ช่องสองภาษาที่ว่างทั้งคู่ในฟิลด์บังคับ** เช่นชื่อโปรเจกต์ ต้องได้ข้อความ "กรอกอย่างน้อยหนึ่งภาษา" ไม่ใช่บันทึกแถวที่ไม่มีชื่อ (Task 5)
4. **Gemini ตอบกลับเพี้ยน** เช่น JSON พัง หรือจำนวนข้อความไม่ตรงกับที่ส่งไป ต้องได้ error ภาษาไทย และห้ามเขียนผลแปลแค่บางส่วนลงช่อง (Task 6)
5. **ไฟล์ค้างใน Storage หลังลบรายการ** รวมถึงรูปของโปรเจกต์และรูปที่ฝังอยู่ในบทความ ต้องถูกลบตามด้วย ไม่อย่างนั้นโควต้า 1 GB จะเต็ม (Task 5) รวมถึง `/api/preview?path=//evil.com` ต้องไม่ redirect ออกนอกเว็บ (Task 11)

---

## File Structure

```
src/
  app/
    [locale]/layout.tsx, page.tsx
    [locale]/projects/[slug]/page.tsx
    [locale]/blog/page.tsx, blog/[slug]/page.tsx
    admin/login/page.tsx, admin/login/actions.ts
    admin/(panel)/layout.tsx            ← requireAdmin + nav + noindex
    admin/(panel)/page.tsx              ← dashboard
    admin/(panel)/{profile,skills,certificates,projects,sections,posts}/...  ← page.tsx, [id]/page.tsx, actions.ts
    admin/actions/{crud,translate}.ts   ← shared server actions
    api/keepalive/route.ts, api/preview/route.ts, api/preview/exit/route.ts
    sitemap.ts, robots.ts
  middleware.ts (or proxy.ts)
  i18n/routing.ts, i18n/request.ts, i18n/navigation.ts
  messages/th.json, messages/en.json
  lib/
    locale/pick.ts                      ← fallback rule
    supabase/{public,server,browser,middleware}.ts, database.types.ts
    auth/require-admin.ts
    content/queries.ts, content/revalidate.ts
    admin/storage-paths.ts, admin/slugify.ts, admin/bilingual.ts, admin/result.ts
    media/{url,classify,resize,upload}.ts
    richtext/{sanitize,render,texts}.ts
    translate/gemini.ts
    seo/alternates.ts
    safe-path.ts
  components/
    public/SectionRenderer.tsx, public/sections/*.tsx, LanguageSwitcher.tsx, FallbackBadge.tsx, PreviewBanner.tsx, RichTextView.tsx
    admin/{BilingualField,TranslateButton,SortableList,VisibilityToggle,ConfirmDelete,MediaUpload,TiptapEditor}.tsx
  styles/tokens.css
supabase/migrations/{0001_schema,0002_rls,0003_storage}.sql
scripts/seed.ts, scripts/seed-data.ts
tests/unit/*.test.ts, tests/integration/rls.test.ts
.github/workflows/keepalive-dev.yml
vercel.json, .env.example, README.md
```

---

### Task 1: โครงโปรเจกต์และกฎแสดงภาษา

**Files:**
- Create: โครง Next.js ที่ root ของ repo, `src/styles/tokens.css`, `vitest.config.ts`, `.env.example`, `README.md`
- Create: `src/lib/locale/pick.ts`
- Test: `tests/unit/pick.test.ts`

**Interfaces:**
- Produces:
  - `type Locale = 'th' | 'en'`
  - `const LOCALES: Locale[] = ['th', 'en']`
  - `otherLocale(l: Locale): Locale`
  - `isEmptyValue(v: unknown): boolean` คืน true เมื่อเป็น null, undefined, string ที่ trim แล้วว่าง หรือ Tiptap doc ที่ไม่มี text node เลย
  - `pick<T extends Record<string, unknown>>(row: T, field: string, locale: Locale): { value: any; lang: Locale; isFallback: boolean }` อ่าน `row[field_th]` และ `row[field_en]`
  - `hasOwnContent(row, fields: string[], locale: Locale): boolean` คืน true เมื่อทุก field ใน locale นั้นไม่ว่าง

- [ ] **Step 1:** สร้างโปรเจกต์ด้วย `npx create-next-app@latest . --ts --tailwind --app --src-dir --eslint --import-alias "@/*" --use-npm` โดยคง `docs/` เดิมไว้ ติดตั้ง `vitest` และ `tsx` เป็น devDeps แล้วเพิ่ม script `"test": "vitest run tests/unit"` และ `"test:rls": "vitest run tests/integration"`
- [ ] **Step 2:** `src/styles/tokens.css` เป็น Tailwind v4 `@theme` ประกอบด้วย `--color-bg`, `--color-fg`, `--color-muted`, `--color-accent`, `--color-surface`, `--color-border`, `--font-sans`, `--radius-card` และ `--space-section` ใช้ค่ากลางๆ ชั่วคราว และใช้ Noto Sans Thai ผ่าน `next/font/google` ส่วน `.env.example` มีครบตาม Global Constraints โดยตั้ง `GEMINI_MODEL=gemini-flash-latest` พร้อม comment ว่าให้ตรวจชื่อรุ่นใน AI Studio
- [ ] **Step 3: เขียนเทสต์ที่ยังไม่ผ่าน** ใน `tests/unit/pick.test.ts`

```ts
expect(pick({ title_th: 'สวัสดี', title_en: 'Hello' }, 'title', 'en')).toEqual({ value: 'Hello', lang: 'en', isFallback: false })
expect(pick({ title_th: 'สวัสดี', title_en: '  ' }, 'title', 'en')).toEqual({ value: 'สวัสดี', lang: 'th', isFallback: true })
expect(pick({ title_th: null, title_en: null }, 'title', 'th')).toEqual({ value: null, lang: 'th', isFallback: false })
expect(isEmptyValue({ type: 'doc', content: [{ type: 'paragraph' }] })).toBe(true)
expect(isEmptyValue({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x' }] }] })).toBe(false)
expect(hasOwnContent({ title_th: 'ก', content_th: null, title_en: 'A', content_en: DOC_WITH_TEXT }, ['title', 'content'], 'th')).toBe(false)
```

- [ ] **Step 4:** รัน `npm test` ต้อง FAIL เพราะยังไม่มี module
- [ ] **Step 5:** เขียน `pick.ts`
- [ ] **Step 6:** รัน `npm test` ต้อง PASS และ `npm run build` ต้องสำเร็จ
- [ ] **Step 7: Commit** `chore: scaffold next.js app with locale fallback helpers` (ตรวจว่า `.env.local` อยู่ใน `.gitignore`)

---

### Task 2: ฐานข้อมูล, RLS และ Storage

**Files:**
- Create: `supabase/migrations/0001_schema.sql`, `0002_rls.sql`, `0003_storage.sql`, `src/lib/supabase/database.types.ts` (generate)
- Test: `tests/integration/rls.test.ts`, `tests/integration/setup.ts`

**Interfaces:**
- Produces: ตารางและคอลัมน์ตามข้อ 5.3 ของ spec โดยกำหนดเพิ่มดังนี้
  - enum `section_type` ('hero','skills','projects','certificates','latest_posts','contact','rich_text','gallery','cards','timeline'), enum `skill_category` ('language','framework','tool','ai_data','soft') และ enum `post_status` ('draft','published')
  - `profile.id boolean primary key default true check (id)` เพื่อให้มีได้แถวเดียว `profile.resume_path_th` และ `resume_path_en`
  - `skills.icon_slug text` (ชื่อไอคอนของ skillicons.dev) และ `skills.icon_path text` (รูปที่อัปโหลดเอง)
  - `projects.slug` กับ `posts.slug` เป็น `unique not null` ส่วน `project_images.project_id` และ `section_items.section_id` เป็น `on delete cascade`
  - ฟังก์ชัน `public.is_admin() returns boolean` แบบ `security definer` ตั้ง `set search_path = ''`
  - trigger `set_updated_at` ทุกตาราง
  - bucket `media` (public) อัปโหลดเป็น path `media/{folder}/{uuid}.{ext}`

- [ ] **Step 1 (เจ้าของทำ):** สร้าง Supabase project `my-profile-dev` แล้วไปที่ Authentication → Providers → Email ปิด "Allow new users to sign up" จากนั้นสร้างผู้ใช้แอดมินในหน้า Users แล้วใส่ URL, anon key, service role key, `ADMIN_EMAIL`, `TEST_ADMIN_EMAIL` และ `TEST_ADMIN_PASSWORD` ลงใน `.env.local` **ผู้ลงมือหยุดรอขั้นนี้ และห้ามสมัครบัญชีแทนเจ้าของ**
- [ ] **Step 2:** `npx supabase init` แล้ว `npx supabase link --project-ref <dev-ref>`
- [ ] **Step 3:** เขียน migration ทั้งสามไฟล์ โดย policy มีดังนี้
  - `select` ของ anon: `is_visible` ต้องเป็น true ส่วน `posts` ต้องเป็น `status = 'published'` ด้วย ส่วน `profile` อ่านได้เสมอ
  - `select` ของแอดมิน: `is_admin()` เห็นทุกแถว
  - `insert` และ `update`: `is_admin()`
  - `delete`: `is_admin()` และสำหรับ `sections` ต้องเป็น `not is_system` ด้วย
  - ตาราง `admins`: ผู้ใช้ select ได้เฉพาะแถวของตัวเอง ไม่มี policy เขียน
  - `storage.objects`: insert, update และ delete ใน bucket `media` ทำได้เมื่อ `is_admin()`
- [ ] **Step 4:** รัน `npx supabase db push` แล้ว `npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts`
- [ ] **Step 5: เขียนเทสต์ RLS** `tests/integration/setup.ts` โหลด `.env.local` สร้าง `anon` client และ `admin` client (signInWithPassword ด้วย TEST_ADMIN_*) และใส่แถว admin ลง `admins` ผ่าน service role ถ้ายังไม่มี เทสต์ที่ต้องมี:
  - `anon cannot insert skills`: insert ต้องได้ error
  - `anon sees only visible skills`: admin สร้างแถว `is_visible=false` แล้ว anon select ต้องไม่เห็นแถวนั้น
  - `anon cannot read draft posts`
  - `anon cannot upload to media`: `storage.from('media').upload(...)` ต้องได้ error
  - `admin cannot delete system section`: delete ได้ 0 แถว และแถวยังอยู่
  - `admin can insert and delete skill`
  - ทุกเทสต์ต้องลบข้อมูลที่ตัวเองสร้างทิ้งใน `afterAll`
- [ ] **Step 6:** รัน `npm run test:rls` ทุกข้อต้อง PASS
- [ ] **Step 7: Commit** `feat(db): add schema, rls policies and media bucket`

---

### Task 3: สองภาษาและ Supabase clients

**Files:**
- Create: `src/i18n/{routing,request,navigation}.ts`, `src/messages/{th,en}.json`, `src/middleware.ts`, `src/lib/supabase/{public,server,browser,middleware}.ts`, `src/app/[locale]/layout.tsx`, `src/components/public/LanguageSwitcher.tsx`

**Interfaces:**
- Consumes: `Locale`, `LOCALES` (Task 1) และ `Database` type (Task 2)
- Produces:
  - `routing` ของ next-intl: `{ locales: ['th','en'], defaultLocale: 'th', localePrefix: 'always' }` ใช้ cookie `NEXT_LOCALE`
  - `createPublicClient(): SupabaseClient<Database>` ใช้ anon key และไม่ผูก cookie จึงใช้ในหน้า static ได้
  - `createServerClient(): Promise<SupabaseClient<Database>>` ผูก cookie ใช้กับแอดมินและโหมดตัวอย่าง
  - `createBrowserClient(): SupabaseClient<Database>`
  - middleware: path `/admin/**` ให้ refresh session ของ Supabase ส่วน path อื่นใช้ next-intl ยกเว้น `/api`, `_next` และไฟล์ static

- [ ] **Step 1:** ตั้ง next-intl, messages (เมนู, ปุ่ม, หัวข้อหมวดตั้งต้น, ป้าย "Available in Thai only" / "มีเฉพาะภาษาอังกฤษ" และป้ายโหมดตัวอย่าง) และ `[locale]/layout.tsx` ที่มี `generateStaticParams` คืนทั้งสองภาษา, `<html lang>` และ LanguageSwitcher (ใช้ `Link` ของ next-intl ที่มี prop `locale` เพื่อให้อยู่หน้าเดิม)
- [ ] **Step 2:** เขียน Supabase clients ทั้งสี่ไฟล์ตาม Interfaces
- [ ] **Step 3: ตรวจ** รัน `npm run dev`
  - `curl -sI http://localhost:3000/ -H "Accept-Language: en"` ต้อง redirect ไป `/en`
  - เปิด `/th` แล้วกดสลับภาษา ต้องไป `/en` และ cookie `NEXT_LOCALE=en`
  - `/admin/login` ต้องไม่ถูกเติม locale นำหน้า
- [ ] **Step 4:** รัน `npm test` และ `npm run build` ต้องผ่าน
- [ ] **Step 5: Commit** `feat(i18n): add th/en routing and supabase clients`

---

### Task 4: ล็อกอินและโครงหน้าแอดมิน

**Files:**
- Create: `src/lib/auth/require-admin.ts`, `src/lib/admin/result.ts`, `src/app/admin/login/{page.tsx,actions.ts}`, `src/app/admin/(panel)/{layout.tsx,page.tsx}`

**Interfaces:**
- Consumes: `createServerClient()` (Task 3)
- Produces:
  - `type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string }`
  - `requireAdmin(): Promise<{ supabase: SupabaseClient<Database>; userId: string }>` สำหรับหน้า: ถ้าไม่ใช่แอดมินให้ redirect ไป `/admin/login`
  - `requireAdminAction(): Promise<{ supabase; userId } | { error: string }>` สำหรับ server action: คืน `{ error: 'กรุณาล็อกอินใหม่' }` แทนการ throw
  - ตรวจสิทธิ์ด้วย `supabase.auth.getUser()` แล้วเรียก `supabase.rpc('is_admin')`

- [ ] **Step 1:** หน้า login ใช้อีเมลกับรหัสผ่าน (`signInWithPassword`) ข้อความผิดพลาดเป็นภาษาไทย มีปุ่มออกจากระบบ ส่วน `(panel)/layout.tsx` เรียก `requireAdmin()` ตั้ง `metadata.robots = { index: false, follow: false }` และมีเมนูไปโปรไฟล์ หมวด ความสามารถ โปรเจกต์ ใบประกาศ บทความ และ "ดูหน้าเว็บ"
- [ ] **Step 2: ตรวจ**
  - เปิด `/admin` ตอนยังไม่ล็อกอิน ต้อง redirect ไป `/admin/login`
  - ล็อกอินด้วยบัญชีแอดมิน ต้องเข้าแดชบอร์ดได้
  - ใส่รหัสผิด ต้องเห็นข้อความไทย
- [ ] **Step 3: Commit** `feat(admin): add login and admin shell`

---

### Task 5: ชุดเครื่องมือแอดมิน (CRUD, slug, ช่องสองภาษา, อัปโหลด)

**Files:**
- Create: `src/lib/admin/{storage-paths,slugify,bilingual}.ts`, `src/lib/media/{url,classify,resize,upload}.ts`, `src/lib/content/revalidate.ts`, `src/app/admin/actions/crud.ts`
- Create: `src/components/admin/{BilingualField,SortableList,VisibilityToggle,ConfirmDelete,MediaUpload}.tsx`
- Test: `tests/unit/{slugify,bilingual,storage-paths,classify,url}.test.ts`

**Interfaces:**
- Consumes: `requireAdminAction`, `ActionResult` (Task 4)
- Produces:
  - `type ContentTable = 'skills' | 'certificates' | 'projects' | 'project_images' | 'sections' | 'section_items' | 'posts'`
  - `STORAGE_COLUMNS: Record<ContentTable, { files: string[]; richtext: string[] }>` ระบุว่าคอลัมน์ไหนเก็บ path ไฟล์ และคอลัมน์ไหนเป็น Tiptap ที่อาจมีรูปฝังอยู่
  - `collectStoragePaths(row: Record<string, unknown>, cols: { files: string[]; richtext: string[] }): string[]` ข้ามค่า null และ URL ที่ขึ้นต้นด้วย `http` ดึง `attrs.src` ของ node `image` ที่ชี้มา bucket media แล้วแปลงเป็น path
  - `reorderRows(table: ContentTable, orderedIds: string[]): Promise<ActionResult>`
  - `setVisible(table: ContentTable, id: string, visible: boolean): Promise<ActionResult>`
  - `deleteRow(table: ContentTable, id: string): Promise<ActionResult>` ลบไฟล์ใน Storage ของแถวนั้น และของแถวลูก (`project_images` และ `section_items`) ก่อนลบแถว
  - `revalidatePublic(): void` เรียก `revalidatePath('/[locale]', 'layout')` และ `revalidatePath('/sitemap.xml')`
  - `slugify(input: string, prefix: string): string` แปลงเป็น a-z0-9 คั่นด้วย `-` ถ้าผลว่างให้คืน `${prefix}-${6 ตัวอักษรสุ่ม a-z0-9}`
  - `bilingual(name: string, opts: { required: boolean; max: number })` คืน zod shape `{ [name_th], [name_en] }` และ `atLeastOne(name)` เป็น superRefine ข้อความ `'กรอกอย่างน้อยหนึ่งภาษา'`
  - `friendlyDbError(e: { code?: string }): string` แปลง `23505` เป็น `'slug หรือค่านี้ถูกใช้แล้ว'` ส่วน error อื่นเป็น `'บันทึกไม่สำเร็จ ลองอีกครั้ง'`
  - `classifyUpload(f: { type: string; size: number }): { kind: 'image' } | { kind: 'pdf' } | { error: string }` รองรับรูป jpeg, png, webp และ gif ส่วน PDF ต้องไม่เกิน 10 MB ไฟล์ HEIC และชนิดอื่นให้คืน error ภาษาไทย
  - `fitWithin(w: number, h: number, max = 1600): { w: number; h: number }`
  - `resizeToWebp(file: File): Promise<Blob>` ใช้ canvas และ quality 0.82
  - `uploadMedia(file: File, folder: string): Promise<{ path: string } | { error: string }>` ทำงานฝั่ง client ด้วย browser client
  - `mediaUrl(path: string | null): string | null` ถ้าเป็น `http(s)` ให้คืนค่าเดิม ถ้าไม่ใช่ให้คืน public URL ของ bucket media
  - `<BilingualField name label kind="text"|"textarea"|"richtext" translateEnabled />` แสดงช่อง TH และ EN คู่กัน และเว้นที่ไว้ให้ TranslateButton (Task 6)
  - `<SortableList items onReorder renderItem />` ใช้ dnd-kit และเรียก `reorderRows`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

```ts
expect(slugify('Auto Face Blur!', 'project')).toBe('auto-face-blur')
expect(slugify('ระบบ RAG ฟุตบอล', 'post')).toBe('rag')
expect(slugify('สวัสดีครับ', 'post')).toMatch(/^post-[a-z0-9]{6}$/)
// bilingual
expect(schema.safeParse({ title_th: '', title_en: ' ' }).error?.issues[0].message).toBe('กรอกอย่างน้อยหนึ่งภาษา')
expect(schema.safeParse({ title_th: 'ก', title_en: '' }).success).toBe(true)
// storage paths
expect(collectStoragePaths(
  { cover_path: 'projects/a.webp', repo_url: 'x', body_th: docWithImage(PUBLIC_MEDIA_URL + 'projects/b.webp'), body_en: docWithImage('https://other.com/c.png') },
  { files: ['cover_path'], richtext: ['body_th', 'body_en'] },
)).toEqual(['projects/a.webp', 'projects/b.webp'])
expect(collectStoragePaths({ avatar_path: 'https://avatars.githubusercontent.com/u/1' }, { files: ['avatar_path'], richtext: [] })).toEqual([])
// classify
expect(classifyUpload({ type: 'image/heic', size: 1 })).toEqual({ error: expect.stringContaining('HEIC') })
expect(classifyUpload({ type: 'application/pdf', size: 11 * 1024 * 1024 })).toHaveProperty('error')
expect(fitWithin(4000, 3000)).toEqual({ w: 1600, h: 1200 })
expect(fitWithin(800, 600)).toEqual({ w: 800, h: 600 })
expect(friendlyDbError({ code: '23505' })).toBe('slug หรือค่านี้ถูกใช้แล้ว')
```

- [ ] **Step 2:** รัน `npm test` ต้อง FAIL
- [ ] **Step 3:** เขียน helper และ server actions ใน `crud.ts` ทุก action ต้องเรียก `requireAdminAction()` ก่อนเสมอ และเรียก `revalidatePublic()` เมื่อสำเร็จ
- [ ] **Step 4:** เขียน component ทั้งห้า โดย `ConfirmDelete` ต้องยืนยันด้วย dialog ก่อนเรียก `deleteRow`
- [ ] **Step 5:** รัน `npm test` ต้อง PASS
- [ ] **Step 6: Commit** `feat(admin): add shared crud, slug, bilingual and upload helpers`

---

### Task 6: ปุ่มแปลอัตโนมัติ

**Files:**
- Create: `src/lib/richtext/texts.ts`, `src/lib/translate/gemini.ts`, `src/app/admin/actions/translate.ts`, `src/components/admin/TranslateButton.tsx`
- Test: `tests/unit/richtext-texts.test.ts`, `tests/unit/gemini.test.ts`

**Interfaces:**
- Consumes: `requireAdminAction`, `ActionResult` (Task 4) และ `BilingualField` (Task 5)
- Produces:
  - `type TiptapDoc = { type: 'doc'; content?: TiptapNode[] }`
  - `extractTexts(doc: TiptapDoc): string[]` ดึงทุก text node ตามลำดับ ยกเว้น text ที่อยู่ใน `codeBlock` และ text ที่มี mark `code`
  - `applyTexts(doc: TiptapDoc, texts: string[]): TiptapDoc` คืนสำเนาใหม่ ถ้าจำนวนไม่ตรงให้ throw `TranslationShapeError`
  - `translateStrings(texts: string[], from: Locale, to: Locale): Promise<string[]>` เรียก `POST https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent` ส่ง header `x-goog-api-key` ตั้ง `generationConfig.responseMimeType = 'application/json'` แล้วตรวจผลด้วย zod ว่าเป็น `string[]` ที่ยาวเท่าเดิม HTTP 429 ให้ throw `QuotaError` ส่วน error อื่นให้ throw `TranslateError`
  - prompt สั่งให้แปลเป็นภาษาปลายทางและคืนเป็น JSON array ลำดับเดิม ห้ามแปลชื่อเฉพาะทางเทคนิค ชื่อโปรแกรม หรือชื่อ library (เช่น FastAPI, RAG, FAISS, Docker)
  - `isTranslateEnabled(): boolean` เช็กว่ามี `GEMINI_API_KEY`
  - `translateAction(input: { kind: 'text'; text: string } | { kind: 'doc'; doc: TiptapDoc }, from: Locale, to: Locale): Promise<ActionResult<{ text?: string; doc?: TiptapDoc }>>` ข้อความ error: ถ้าไม่มีคีย์ `'ยังไม่ได้ตั้งค่า GEMINI_API_KEY'` ถ้า quota หมด `'โควต้าการแปลหมดแล้ว ลองใหม่ภายหลังหรือพิมพ์เอง'` กรณีอื่น `'แปลไม่สำเร็จ ลองอีกครั้ง'`
  - `<TranslateButton from to sourceValue targetValue onResult />` ถ้า `targetValue` ไม่ว่าง ต้อง `confirm('ช่องปลายทางมีข้อความอยู่แล้ว เขียนทับไหม?')` ก่อน ผลแปลจะเติมลงช่องเท่านั้น ไม่บันทึกเอง

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

```ts
const doc = { type: 'doc', content: [
  { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'สวัสดี' }] },
  { type: 'paragraph', content: [{ type: 'text', text: 'ใช้ ' }, { type: 'text', text: 'pip install', marks: [{ type: 'code' }] }] },
  { type: 'codeBlock', content: [{ type: 'text', text: 'print("hi")' }] },
] }
expect(extractTexts(doc)).toEqual(['สวัสดี', 'ใช้ '])
const out = applyTexts(doc, ['Hello', 'Use '])
expect(out.content[0]).toMatchObject({ type: 'heading', attrs: { level: 2 }, content: [{ text: 'Hello' }] })
expect(out.content[1].content[1].text).toBe('pip install')
expect(out.content[2].content[0].text).toBe('print("hi")')
expect(doc.content[0].content[0].text).toBe('สวัสดี') // ไม่แก้ object เดิม
expect(() => applyTexts(doc, ['only one'])).toThrow(TranslationShapeError)
// gemini (mock global fetch)
mockFetch(200, geminiBody('["Hello"]'));   await expect(translateStrings(['สวัสดี'], 'th', 'en')).resolves.toEqual(['Hello'])
mockFetch(200, geminiBody('not json'));    await expect(translateStrings(['ก'], 'th', 'en')).rejects.toThrow(TranslateError)
mockFetch(200, geminiBody('["a","b"]'));   await expect(translateStrings(['ก'], 'th', 'en')).rejects.toThrow(TranslateError)
mockFetch(429, {});                        await expect(translateStrings(['ก'], 'th', 'en')).rejects.toThrow(QuotaError)
```

- [ ] **Step 2:** รัน `npm test` ต้อง FAIL
- [ ] **Step 3:** เขียน `texts.ts`, `gemini.ts`, `translate.ts` และ `TranslateButton.tsx` แล้วต่อเข้ากับ `BilingualField` โดยซ่อนปุ่มเมื่อ `translateEnabled` เป็น false
- [ ] **Step 4:** รัน `npm test` ต้อง PASS
- [ ] **Step 5: ตรวจด้วยมือ** (ถ้าเจ้าของใส่ `GEMINI_API_KEY` แล้ว) แปลข้อความในช่องหนึ่งช่องได้ และถ้าลบคีย์ออกแล้วรีสตาร์ต ปุ่มต้องหายไป
- [ ] **Step 6: Commit** `feat(admin): add auto-translate button via gemini`

---

### Task 7: แอดมิน โปรไฟล์ ความสามารถ และใบประกาศ

**Files:**
- Create: `src/app/admin/(panel)/profile/{page.tsx,actions.ts}`, `skills/{page.tsx,actions.ts}`, `certificates/{page.tsx,[id]/page.tsx,actions.ts}`
- Test: `tests/unit/admin-schemas.test.ts`

**Interfaces:**
- Consumes: ทุกอย่างจาก Task 5 และ 6
- Produces:
  - `saveProfile(form: FormData): Promise<ActionResult>` ใช้ upsert ที่ `id = true`
  - `profileSchema`: `full_name` (required, max 100), `headline` (max 160), `university` และ `location` (max 160), `bio` เป็น Tiptap JSON และ `links` เป็น `{ label: string; url: string(url); icon: string }[]` ไม่เกิน 10 รายการ
  - `upsertSkill(form): Promise<ActionResult>` โดย `skillSchema` มี `name` (required, max 60), `category` เป็น enum, `icon_slug` เป็น `/^[a-z0-9]+$/` หรือว่าง และ `note` (bilingual, max 160)
  - `upsertCertificate(form): Promise<ActionResult>` โดย `certificateSchema` มี `title` (required, bilingual, max 160), `issuer` (max 120), `issued_on` (date), `expires_on` (date หรือว่าง และต้องไม่ก่อน `issued_on`) และ `credential_url` (url หรือว่าง)
  - หน้า profile มีอัปโหลด avatar และ resume แยก TH/EN
  - หน้า skills จัดกลุ่มตาม category และลากเรียงภายในกลุ่มได้
  - หน้า certificates มีอัปโหลดรูปและ PDF

- [ ] **Step 1: เขียนเทสต์ schema** ทดสอบว่า `expires_on` ที่อยู่ก่อน `issued_on` ต้อง error, `icon_slug: 'Python!'` ต้อง error และ `links` ที่ url ไม่ถูกต้องต้อง error
- [ ] **Step 2:** รัน `npm test` ต้อง FAIL จากนั้นเขียนโค้ด แล้วรัน `npm test` อีกครั้งต้อง PASS
- [ ] **Step 3: ตรวจด้วยมือ** ใน `npm run dev`
  - แก้ bio แล้วกดแปล
  - เพิ่ม skill แล้วลากเรียง และซ่อนหนึ่งรายการ
  - เพิ่มใบประกาศพร้อมรูปและ PDF จากนั้นลบ แล้วไปดูใน Supabase Storage ว่าไฟล์หายไปจริง
- [ ] **Step 4: Commit** `feat(admin): manage profile, skills and certificates`

---

### Task 8: แอดมิน โปรเจกต์และรูปโปรเจกต์

**Files:**
- Create: `src/app/admin/(panel)/projects/{page.tsx,[id]/page.tsx,actions.ts}`
- Test: `tests/unit/admin-schemas.test.ts` (เพิ่ม)

**Interfaces:**
- Consumes: Task 5 และ 6 และ `TiptapEditor` (Task 10 ถ้า Task 10 ยังไม่เสร็จ ให้ใช้ textarea ไปก่อน แล้วเปลี่ยนเป็น `TiptapEditor` ใน Task 10)
- Produces:
  - `upsertProject(form): Promise<ActionResult<{ id: string }>>` โดย `projectSchema` มี `title` (required, bilingual, max 120), `summary` (bilingual, max 300), `my_role` (bilingual, max 300), `body` (Tiptap), `stack` (string[] ไม่เกิน 15), `repo_url` และ `demo_url` (url หรือว่าง), `slug` (ถ้าว่างให้ใช้ `slugify(title_en || title_th, 'project')`), `is_featured`, `start_date` และ `end_date`
  - `addProjectImage(projectId: string, path: string): Promise<ActionResult>` และ `updateProjectImageCaption(...)`
  - การลบและจัดลำดับรูปใช้ `deleteRow('project_images', id)` และ `reorderRows('project_images', ids)`

- [ ] **Step 1: เขียนเทสต์** ทดสอบว่า `stack` 16 รายการต้อง error และ slug ว่างพร้อม `title_en: 'Football Assistant'` ต้องได้ `football-assistant`
- [ ] **Step 2:** รันแล้วต้อง FAIL จากนั้นเขียนโค้ด แล้วรันอีกครั้งต้อง PASS
- [ ] **Step 3: ตรวจด้วยมือ**
  - สร้างโปรเจกต์พร้อมรูป 3 รูป แล้วลากเรียงรูป
  - ใช้ slug ซ้ำ ต้องเห็นข้อความ "slug หรือค่านี้ถูกใช้แล้ว"
  - ลบโปรเจกต์ แล้วไฟล์ทั้ง cover และรูปทั้งหมดต้องหายจาก Storage
- [ ] **Step 4: Commit** `feat(admin): manage projects and project images`

---

### Task 9: แอดมิน หมวดและรายการในหมวดที่สร้างเอง

**Files:**
- Create: `src/app/admin/(panel)/sections/{page.tsx,[id]/page.tsx,actions.ts}`
- Test: `tests/unit/admin-schemas.test.ts` (เพิ่ม)

**Interfaces:**
- Produces:
  - `CREATABLE_TYPES = ['rich_text', 'gallery', 'cards', 'timeline'] as const`
  - `createSection(type: typeof CREATABLE_TYPES[number], title: { th: string; en: string }): Promise<ActionResult<{ id: string }>>` ตั้ง `is_system=false` และ `sort_order = max + 1`
  - `updateSection(form): Promise<ActionResult>` แก้ได้แค่ `title`, `subtitle`, `body` (เฉพาะ `rich_text`), `slug` และ `settings` ห้ามเปลี่ยน `type`
  - `sectionSettingsSchema`: `columns` เป็น 1–4 (สำหรับ gallery และ cards) และ `limit` เป็น 1–12 (สำหรับ latest_posts)
  - `upsertSectionItem(form): Promise<ActionResult>` ฟิลด์ที่ต้องกรอกขึ้นกับ type ของหมวด: `gallery` ต้องมี `image_path`, `cards` ต้องมี `title`, `timeline` ต้องมี `title` และ `start_date`
  - หน้ารายการหมวดแสดงทุกหมวด ลากเรียงได้ ซ่อนได้ และซ่อนปุ่มลบของหมวดที่เป็น `is_system`

- [ ] **Step 1: เขียนเทสต์** ทดสอบว่า `createSection('hero', ...)` ถูกปฏิเสธโดย type, `columns: 5` ต้อง error และ timeline item ที่ไม่มี `start_date` ต้อง error
- [ ] **Step 2:** รันแล้วต้อง FAIL จากนั้นเขียนโค้ด แล้วรันอีกครั้งต้อง PASS
- [ ] **Step 3: ตรวจด้วยมือ**
  - สร้างหมวด timeline ชื่อ "การศึกษา" แล้วเพิ่ม 2 รายการ
  - ลากหมวดนี้ไปไว้ใต้ hero
  - หมวด skills ต้องไม่มีปุ่มลบ
- [ ] **Step 4: Commit** `feat(admin): manage sections and custom section items`

---

### Task 10: แอดมิน บทความ, editor และการ render ที่ปลอดภัย

**Files:**
- Create: `src/components/admin/TiptapEditor.tsx`, `src/lib/richtext/{sanitize,render}.ts`, `src/components/public/RichTextView.tsx`, `src/app/admin/(panel)/posts/{page.tsx,[id]/page.tsx,actions.ts}`
- Test: `tests/unit/sanitize.test.ts`, `tests/unit/admin-schemas.test.ts` (เพิ่ม)

**Interfaces:**
- Consumes: `uploadMedia`, `mediaUrl` (Task 5) และ `TiptapDoc` (Task 6)
- Produces:
  - `<TiptapEditor value onChange />` ใช้ StarterKit, Link (`protocols: ['http','https','mailto']`, `autolink`) และ Image (อัปโหลดผ่าน `uploadMedia(file, 'posts')`) มีแถบเครื่องมือ: หัวข้อ H2/H3, ตัวหนา, ตัวเอียง, รายการ, quote, code, code block, ลิงก์ และรูป
  - `sanitizeDoc(doc: TiptapDoc): TiptapDoc` ตัด mark `link` ที่ href ไม่ใช่ `http:`, `https:` หรือ `mailto:` และตัด node `image` ที่ src ไม่ใช่ `http(s):`
  - `renderRichText(doc: TiptapDoc | null): string` คือ `generateHTML(sanitizeDoc(doc), extensions)` บล็อกโค้ดใส่ class `language-*` ส่วน syntax highlighting ให้ผู้สร้างเลือกวิธีเอง
  - `upsertPost(form): Promise<ActionResult<{ id: string }>>` โดย `postSchema` มี `title` (required, bilingual, max 160), `excerpt` (bilingual, max 300), `content` (Tiptap), `tags` (string[] ไม่เกิน 10 แต่ละอันไม่เกิน 30 ตัวอักษร เก็บเป็นตัวพิมพ์เล็ก) และ `slug` (ถ้าว่างให้ใช้ `slugify(title_en || title_th, 'post')`)
  - `setPostStatus(id: string, status: 'draft' | 'published'): Promise<ActionResult>` เมื่อเผยแพร่ครั้งแรกให้ตั้ง `published_at = now()`

- [ ] **Step 1: เขียนเทสต์**

```ts
const bad = docWith([
  { type: 'text', text: 'x', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] },
  { type: 'text', text: 'y', marks: [{ type: 'link', attrs: { href: 'https://ok.dev' } }] },
], [{ type: 'image', attrs: { src: 'data:image/png;base64,AAA' } }])
const html = renderRichText(bad)
expect(html).not.toContain('javascript:')
expect(html).toContain('href="https://ok.dev"')
expect(html).not.toContain('data:image')
expect(postSchema.safeParse({ ...validPost, tags: ['RAG', 'AI'] }).data?.tags).toEqual(['rag', 'ai'])
```

- [ ] **Step 2:** รันแล้วต้อง FAIL จากนั้นเขียนโค้ด แล้วรันอีกครั้งต้อง PASS
- [ ] **Step 3:** เปลี่ยนช่อง richtext ใน Task 7–9 (bio, project body และ rich_text section) ให้ใช้ `TiptapEditor`
- [ ] **Step 4: ตรวจด้วยมือ**
  - เขียนบทความภาษาไทยที่มีบล็อกโค้ดและรูป แล้วบันทึกเป็นร่าง
  - กดแปล TH→EN แล้วบล็อกโค้ดต้องเหมือนเดิม
  - กดเผยแพร่
- [ ] **Step 5: Commit** `feat(admin): add blog editor and safe rich text rendering`

---

### Task 11: หน้าสาธารณะ (หน้าตาชั่วคราว) และโหมดตัวอย่าง

**Files:**
- Create: `src/lib/content/queries.ts`, `src/lib/safe-path.ts`, `src/app/[locale]/page.tsx`, `src/app/[locale]/projects/[slug]/page.tsx`, `src/app/[locale]/blog/{page.tsx,[slug]/page.tsx}`, `src/components/public/{SectionRenderer,FallbackBadge,PreviewBanner}.tsx`, `src/components/public/sections/{Hero,Skills,Projects,Certificates,LatestPosts,Contact,RichText,Gallery,Cards,Timeline}.tsx`, `src/app/api/preview/route.ts`, `src/app/api/preview/exit/route.ts`
- Test: `tests/unit/safe-path.test.ts`

**Interfaces:**
- Consumes: `pick`, `hasOwnContent` (Task 1), `createPublicClient` และ `createServerClient` (Task 3), `mediaUrl` (Task 5) และ `renderRichText` (Task 10)
- Produces:
  - `getContentClient(): Promise<SupabaseClient<Database>>` ถ้าอยู่ใน draftMode ให้ใช้ `createServerClient()` (session แอดมิน ซึ่งเห็นแถวที่ซ่อนและร่างผ่าน RLS) ถ้าไม่อยู่ให้ใช้ `createPublicClient()`
  - `getHomeData(): Promise<HomeData>` (profile, sections, skills, projects, certificates, posts ล่าสุด และ section_items ที่จัดกลุ่มตาม section_id) ทุกอย่างเรียงตาม `sort_order`
  - `getProjectBySlug(slug)`, `getPosts(tag?: string)`, `getPostBySlug(slug)` และ `getAllSlugs(): Promise<{ projects: SlugRow[]; posts: SlugRow[] }>` โดย `SlugRow` คือแถวที่มี slug พร้อมฟิลด์หลักสองภาษาสำหรับ `hasOwnContent`
  - ทุกหน้าเป็น static โดยมี `generateStaticParams` ครบทั้งสองภาษา และตั้ง `dynamicParams = true` ให้หน้าที่สร้างใหม่ทำงานได้
  - `safeRedirectPath(p: string | null): string` ยอมรับเฉพาะ path ที่ขึ้นต้นด้วย `/` แต่ไม่ขึ้นต้นด้วย `//` หรือ `/\` ถ้าไม่ผ่านให้คืน `/th`
  - `GET /api/preview?path=` ถ้าไม่ใช่แอดมินให้ตอบ 401 ถ้าใช่ให้เรียก `draftMode().enable()` แล้ว redirect ไป `safeRedirectPath(path)` ส่วน `/api/preview/exit` ให้ปิดโหมดตัวอย่าง
  - ในหน้าแอดมิน รายการที่ซ่อนอยู่และบทความร่างมีปุ่ม "ดูตัวอย่าง" ที่ลิงก์ไป `/api/preview?path=...`
  - `FallbackBadge` แสดงเมื่อ `pick(...).isFallback` และ `PreviewBanner` แสดงเมื่ออยู่ใน draftMode พร้อมลิงก์ออก

- [ ] **Step 1: เขียนเทสต์** ทดสอบว่า `safeRedirectPath('/th/blog/x')` ได้ `'/th/blog/x'` ส่วน `'//evil.com'`, `'/\\evil.com'`, `'https://evil.com'` และ `null` ต้องได้ `'/th'` ทั้งหมด
- [ ] **Step 2:** รันแล้วต้อง FAIL จากนั้นเขียนโค้ด แล้วรันอีกครั้งต้อง PASS
- [ ] **Step 3:** เขียนหน้าเว็บและ section components ใช้ token เท่านั้น ใช้ layout เรียบที่อ่านง่ายบนมือถือ รูปใช้ `next/image` (ตั้ง `remotePatterns` สำหรับ Supabase, avatars.githubusercontent.com และ skillicons.dev) ส่วนไอคอน skill ใช้ `https://skillicons.dev/icons?i=<icon_slug>` ถ้าไม่มีทั้ง slug และรูป ให้แสดงเป็นป้ายข้อความ
- [ ] **Step 4: ตรวจ**
  - รัน `npm run build && npm start`
  - แก้ข้อความใน admin แล้วรีเฟรช `/th` ต้องเห็นผลทันที
  - เปิดบทความร่างผ่าน "ดูตัวอย่าง" ต้องเห็น พร้อมแถบโหมดตัวอย่าง
  - เปิด `/en/blog/<slug>` ของบทความที่มีแต่ภาษาไทย ต้องเห็นป้าย "Available in Thai only"
  - เปิด `/api/preview?path=//evil.com` ต้องได้ 401 ถ้ายังไม่ล็อกอิน และต้องไปที่ `/th` ถ้าล็อกอินแล้ว
- [ ] **Step 5: Commit** `feat(public): add temporary public pages and preview mode`

---

### Task 12: SEO

**Files:**
- Create: `src/lib/seo/alternates.ts`, `src/app/sitemap.ts`, `src/app/robots.ts` และใส่ `generateMetadata` ในหน้าสาธารณะทุกหน้า
- Test: `tests/unit/seo.test.ts`

**Interfaces:**
- Consumes: `getAllSlugs`, `hasOwnContent` และ `LOCALES`
- Produces:
  - `buildAlternates(path: string, own: Record<Locale, boolean>, locale: Locale, siteUrl: string): { canonical: string; languages: Partial<Record<Locale, string>> }` โดย `path` ไม่มี locale นำหน้า เช่น `/blog/x` ถ้า locale ปัจจุบันไม่มีเนื้อหาของตัวเอง canonical ต้องชี้ไปที่ locale ที่มีเนื้อหา ส่วน `languages` ใส่เฉพาะ locale ที่มีเนื้อหาของตัวเอง
  - `buildSitemapEntries(items: { path: string; own: Record<Locale, boolean>; updatedAt?: string }[], siteUrl: string): MetadataRoute.Sitemap` ใส่เฉพาะ URL ของ locale ที่มีเนื้อหาของตัวเอง
  - field หลักที่ใช้ตัดสินว่า "มีเนื้อหาของตัวเอง": posts ใช้ `['title', 'content']`, projects ใช้ `['title', 'summary']` ส่วนหน้าแรกและ `/blog` ถือว่ามีทั้งสองภาษาเสมอ
  - `robots.ts` disallow `/admin` และ `/api` และชี้ไปที่ sitemap
  - metadata มี title, description และ Open Graph (ใช้ cover หรือ avatar) แยกตามภาษา

- [ ] **Step 1: เขียนเทสต์**

```ts
const thOnly = { th: true, en: false }
expect(buildAlternates('/blog/x', thOnly, 'en', SITE)).toEqual({ canonical: `${SITE}/th/blog/x`, languages: { th: `${SITE}/th/blog/x` } })
expect(buildAlternates('/blog/x', { th: true, en: true }, 'en', SITE).canonical).toBe(`${SITE}/en/blog/x`)
expect(buildSitemapEntries([{ path: '/blog/x', own: thOnly }], SITE).map(e => e.url)).toEqual([`${SITE}/th/blog/x`])
```

- [ ] **Step 2:** รันแล้วต้อง FAIL จากนั้นเขียนโค้ด แล้วรันอีกครั้งต้อง PASS
- [ ] **Step 3: ตรวจ** ใน `npm run build && npm start`
  - `curl -s localhost:3000/sitemap.xml` ต้องไม่มี `/en/...` ของบทความที่มีแต่ภาษาไทย
  - `curl -s localhost:3000/robots.txt` ต้องมี `Disallow: /admin`
- [ ] **Step 4: Commit** `feat(seo): add localized metadata, hreflang and sitemap`

---

### Task 13: ข้อมูลตั้งต้นจาก GitHub

**Files:**
- Create: `scripts/seed-data.ts`, `scripts/seed.ts` และเพิ่ม script `"seed": "tsx scripts/seed.ts"`

**Interfaces:**
- Consumes: schema (Task 2)
- Produces:
  - `npm run seed` ใช้ `SUPABASE_SERVICE_ROLE_KEY` ทำงานดังนี้
    1. ใส่ `admins` จาก `ADMIN_EMAIL` โดยค้นหา user ผ่าน `auth.admin.listUsers`
    2. upsert `profile`
    3. สร้างหมวดตั้งต้นหกหมวด (`is_system=true`) ตามลำดับ hero, skills, projects, certificates, latest_posts, contact
    4. ใส่ skills และ projects
  - **รันซ้ำได้ปลอดภัย:** ถ้ามี `profile` อยู่แล้วให้หยุดพร้อมข้อความ ยกเว้นส่ง `--force` ซึ่งจะลบแล้วใส่ใหม่เฉพาะ skills, projects และหมวดที่เป็น `is_system`
  - เนื้อหาใน `seed-data.ts` เป็นสองภาษาตามข้อ 8 ของ spec ใช้ avatar เป็น `https://avatars.githubusercontent.com/u/127590935?v=4` และ links มี GitHub `https://github.com/sakda1306` ส่วน `icon_slug` ใช้ชื่อของ skillicons (python, ts, js, kotlin, php, html, css, bash, powershell, fastapi, laravel, opencv, androidstudio, docker, postgres, redis, git, github, vscode) skill ที่ไม่มีไอคอน (Streamlit, MediaPipe, NumPy, FAISS, RAG/LLM, Jupyter และ soft skill) ให้ปล่อย `icon_slug` ว่าง projects มี `repo_url` ของแต่ละ repo และ `is_featured` เป็น true สำหรับสี่อันแรก

- [ ] **Step 1:** เขียน seed แล้วรัน `npm run seed` กับ dev project
- [ ] **Step 2: ตรวจ**
  - `/th` และ `/en` ต้องแสดงชื่อ คำแนะนำตัว skill ครบตามหมวด และโปรเจกต์ 6 อันตามลำดับ
  - รัน `npm run seed` ซ้ำ ต้องหยุดพร้อมข้อความ และไม่มีข้อมูลซ้ำ
  - รัน `npm run test:rls` ต้องยัง PASS
- [ ] **Step 3: Commit** `feat(seed): add initial profile content from github`

---

### Task 14: Keepalive, การตั้งค่า deploy และ README

**Files:**
- Create: `src/app/api/keepalive/route.ts`, `vercel.json`, `.github/workflows/keepalive-dev.yml`, `README.md`
- Test: `tests/unit/keepalive.test.ts`

**Interfaces:**
- Produces:
  - `GET /api/keepalive` ถ้าไม่มี header `Authorization: Bearer ${CRON_SECRET}` ให้ตอบ 401 ถ้ามีให้ query `profile` (`select id limit 1`) ผ่าน public client แล้วตอบ `{ ok: true }` ถ้า query error ให้ตอบ 500
  - `vercel.json`: `{ "crons": [{ "path": "/api/keepalive", "schedule": "0 3 * * *" }] }`
  - `keepalive-dev.yml`: มี `schedule` cron `0 3 * * *` และ `workflow_dispatch` ทำ `curl -fsS "$DEV_SUPABASE_URL/rest/v1/profile?select=id&limit=1" -H "apikey: $DEV_SUPABASE_ANON_KEY"` โดยอ่านค่าจาก repository secrets `DEV_SUPABASE_URL` และ `DEV_SUPABASE_ANON_KEY`
  - README เป็นภาษาไทย อธิบายวิธีรันในเครื่อง, env, การสร้าง project dev และ prod, `supabase db push`, `npm run seed`, การเอา Gemini key, การตั้ง Vercel env และ secrets ของ GitHub Actions **ห้ามมีข้อความอ้างถึงผู้ช่วยเขียนโค้ด**

- [ ] **Step 1: เขียนเทสต์** เรียก handler โดยตรง ไม่มี header ต้องได้ 401 และ secret ผิดต้องได้ 401 ส่วน secret ถูก (mock client) ต้องได้ 200 `{ ok: true }`
- [ ] **Step 2:** รันแล้วต้อง FAIL จากนั้นเขียนโค้ด แล้วรันอีกครั้งต้อง PASS
- [ ] **Step 3: ตรวจทั้งหมด**
  - `npm test`, `npm run test:rls`, `npm run lint` และ `npm run build` ต้องผ่านทั้งหมด
  - ตรวจ staged files และ commit message ตาม checklist กฎ git ของเจ้าของ (รายการคำต้องห้ามอยู่ในการตั้งค่าส่วนตัวของเจ้าของ ไม่เขียนลง repo)
- [ ] **Step 4: Commit** `chore: add keepalive cron and setup guide` แล้วถามเจ้าของก่อน push
