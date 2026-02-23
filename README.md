# ระบบห้องพยาบาลโรงเรียน (Hospital Room Management System)

ระบบบริหารจัดการห้องพยาบาลโรงเรียน แบบ Multi-Tenant รองรับหลายโรงเรียน ข้อมูลแยกขาดจากกัน 100%

**พัฒนาโดย:** รัชเดช ศรีแก้ว | โทร: 093-073-2896 | Line: jacknewd

---

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                  │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Landing  │  │  Auth    │  │Dashboard │             │
│  │  Page    │  │ Pages    │  │  Pages   │             │
│  └─────────┘  └──────────┘  └──────────┘             │
├──────────────────────────────────────────────────────┤
│              Middleware (JWT Verification)             │
│         Role-based + School-based Access Control      │
├──────────────────────────────────────────────────────┤
│                 API Routes (Next.js)                  │
│  /api/auth  /api/schools  /api/rooms  /api/visits     │
│  /api/users /api/students /api/treatments /api/stats  │
├──────────────────────────────────────────────────────┤
│                  MySQL Database                       │
│  schools | users | health_rooms | students            │
│  room_visits | treatment_records | symptom_categories │
└──────────────────────────────────────────────────────┘
```

## เทคโนโลยีที่ใช้

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 16, React 19, TailwindCSS   |
| Backend     | Next.js API Routes (Full Stack)     |
| Database    | MySQL (mysql2)                      |
| Auth        | JWT (jose) + bcryptjs               |
| Charts      | Recharts                            |
| PDF Export  | jsPDF + jspdf-autotable             |
| Icons       | Lucide React                        |
| UI Base     | NextAdmin Dashboard Template        |

## โครงสร้างผู้ใช้งาน (Roles)

| Role         | สิทธิ์                                              |
|--------------|------------------------------------------------------|
| Super Admin  | อนุมัติโรงเรียน, ดูข้อมูลทั้งหมด, เปิด/ปิดระบบ      |
| School Admin | จัดการข้อมูลโรงเรียน, จัดการผู้ใช้ในโรงเรียน          |
| Staff/Nurse  | บันทึกการใช้ห้อง, บันทึกการรักษา                      |

## Database Schema

```sql
-- ตาราง 7 ตาราง ทุกตารางมี school_id (Multi-Tenant)
schools             -- ข้อมูลโรงเรียน (tenant)
users               -- ผู้ใช้งาน (role-based)
health_rooms        -- ห้องพยาบาล
students            -- นักเรียน
symptom_categories  -- ประเภทอาการ
room_visits         -- บันทึกการเข้าใช้ห้อง
treatment_records   -- ประวัติการรักษา
```

## API Endpoints

### Authentication
| Method | Path                        | Description                |
|--------|-----------------------------|----------------------------|
| POST   | /api/auth/login             | เข้าสู่ระบบ                  |
| POST   | /api/auth/logout            | ออกจากระบบ                  |
| GET    | /api/auth/me                | ข้อมูลผู้ใช้ปัจจุบัน          |
| POST   | /api/auth/register-school   | สมัครโรงเรียนใหม่            |

### Schools (Super Admin)
| Method | Path          | Description               |
|--------|---------------|---------------------------|
| GET    | /api/schools  | รายชื่อโรงเรียน             |
| PUT    | /api/schools  | อัปเดตสถานะ (อนุมัติ/ระงับ)  |

### Users
| Method | Path         | Description          |
|--------|--------------|----------------------|
| GET    | /api/users   | รายชื่อผู้ใช้          |
| POST   | /api/users   | เพิ่มผู้ใช้            |
| PUT    | /api/users   | แก้ไขผู้ใช้            |
| DELETE | /api/users   | ลบผู้ใช้              |

### Health Rooms
| Method | Path         | Description          |
|--------|--------------|----------------------|
| GET    | /api/rooms   | รายการห้องพยาบาล      |
| POST   | /api/rooms   | เพิ่มห้อง             |
| PUT    | /api/rooms   | แก้ไขห้อง             |
| DELETE | /api/rooms   | ลบห้อง               |

### Students, Visits, Treatments, Stats
| Path                     | Description              |
|--------------------------|--------------------------|
| /api/students            | จัดการนักเรียน            |
| /api/visits              | บันทึกการเข้าใช้ห้อง      |
| /api/treatments          | บันทึกการรักษา            |
| /api/symptom-categories  | ประเภทอาการ              |
| /api/stats               | สถิติและรายงาน            |

## Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd hospital-room-management
npm install
```

### 2. ตั้งค่า Database
```bash
# สร้าง MySQL database และรัน schema
mysql -u root -p < src/lib/schema.sql
```

### 3. ตั้งค่า Environment
```bash
cp .env.example .env.local
# แก้ไขค่าใน .env.local ให้ตรงกับ MySQL ของคุณ
```

### 4. รัน Development Server
```bash
npm run dev
```

### 5. เข้าใช้งาน
- **Landing Page:** http://localhost:3000
- **Login:** http://localhost:3000/auth/signin
- **Super Admin:** email: `admin@hospital-room.com` / password: `admin123`

## ฟีเจอร์หลัก

1. **ระบบสมัครใช้งาน** - โรงเรียนสมัครฟรี, รอ Super Admin อนุมัติ
2. **ระบบ Login** - JWT Authentication, Role-based Access
3. **จัดการห้องพยาบาล** - เพิ่ม/แก้ไข/ลบห้อง, บันทึกการใช้งาน
4. **บันทึกการรักษา** - ประวัติการรักษา, ประเภทอาการ, ยาที่ให้
5. **สถิติและรายงาน** - กราฟ Bar/Line/Pie, ส่งออก PDF
6. **Multi-Tenant** - ข้อมูลแยกตาม school_id 100%
7. **Responsive** - รองรับ Desktop/Tablet/Mobile

## UX/UI Flow

```
Landing Page → สมัครใช้งาน → รออนุมัติ → Login → Dashboard
                                                    ├── ห้องพยาบาล
                                                    ├── บันทึกการเข้าใช้ห้อง
                                                    ├── บันทึกการรักษา
                                                    ├── จัดการนักเรียน
                                                    ├── สถิติ (กราฟ)
                                                    ├── ส่งออกรายงาน PDF
                                                    ├── จัดการผู้ใช้
                                                    └── จัดการโรงเรียน (Super Admin)
```

## ความปลอดภัย

- **JWT Token** - ตรวจสอบทุก request ผ่าน middleware
- **Role-based Access** - Super Admin / School Admin / Staff / Nurse
- **School Isolation** - ตรวจสอบ school_id ทุก API
- **Password Hashing** - bcrypt (12 rounds)
- **HttpOnly Cookie** - ป้องกัน XSS

## แนวทาง Deploy

### Vercel (แนะนำ)
```bash
npm run build
# Deploy ผ่าน Vercel CLI หรือ GitHub Integration
```

### Database
- ใช้ PlanetScale, AWS RDS, หรือ DigitalOcean Managed MySQL
- ตั้ง connection string ใน environment variables

## การขยายระบบในอนาคต

- เพิ่มระบบแจ้งเตือน (Line Notify / Email)
- เพิ่มระบบนัดหมายติดตามอาการ
- เพิ่ม Dashboard สำหรับผู้ปกครอง
- เพิ่มระบบจัดการยาและเวชภัณฑ์
- เพิ่ม API สำหรับ Mobile App
- เพิ่มระบบ Backup ข้อมูลอัตโนมัติ

---

© 2025 ระบบห้องพยาบาลโรงเรียน — พัฒนาโดย **รัชเดช ศรีแก้ว**
