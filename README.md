# IMAGDD Registration API

Backend API for the IMAGDD event registration form built with NestJS and MongoDB.

- Max **250 overall slots**
- **50 slots per partner school** (students only)
- **100 slots** for professionals, educators, animators, LGU, and other-school students (shared pool)
- **30 slots per workshop** (students choosing workshop pick one per day)
- Duplicate emails are rejected
- No authentication required

---

## Slot Allocation

| Group | Slots |
|---|---|
| ADNU — Ateneo De Naga (students) | 50 |
| NCF — Naga College Foundation (students) | 50 |
| BISCAST — Bicol State College of Applied Sciences and Technology (students) | 50 |
| Professionals, Educators, Animators, LGU, Other-school Students | 100 |
| **Total** | **250** |

> Students from other schools (not ADNU/NCF/BISCAST) are placed in the general 100-slot pool.

### Workshop Slots (students only — 30 each)

| Workshop | Day | Room | Slots |
|---|---|---|---|
| Workshop 1 | Day 1 — Apr 24 | DIA Lab 1 | 30 |
| Workshop 2 | Day 1 — Apr 24 | DIA Lab 2 | 30 |
| Workshop 4 | Day 2 — Apr 25 | DIA Lab 1 | 30 |
| Workshop 5 | Day 2 — Apr 25 | DIA Lab 2 | 30 |

Students who choose `workshop` must pick one workshop per day (Day 1 and Day 2).

---

## Program Flow

### Day 1 — April 24, 2026 | Xavier Hall

| Time | Duration | Activity | Speaker |
|---|---|---|---|
| 1:00 pm – 2:00 pm | 1 hr | **[Seminar]** Cultural Storytelling in Games and Animation | Ms. Ria Lu — CEO, Leveret Group / President, GDAP |
| 2:00 pm – 3:00 pm | 1 hr | **[Seminar]** From Idea to Playable: Game Direction, Story, and Player Experience | Mr. Steven Jan Cadena — Senior Game Designer, Cadre Creative Solutions Naga City |
| 1:00 pm – 3:00 pm | 2 hrs | **[Workshop 1 – DIA Lab 1]** Marketing your Game: Trailers, AppStore, Pages, and Social Media | Mr. Raymond Tan — Senior Concept Artist & Head Instructor, Musings Art Academy |
| 1:00 pm – 3:00 pm | 2 hrs | **[Workshop 2 – DIA Lab 2]** Visual Development and World-Building Workshop | Mr. Kristopher Louie Rafael — Senior 2D Animator |

### Day 2 — April 25, 2026 | Xavier Hall

| Time | Duration | Activity | Speaker |
|---|---|---|---|
| 8:00 am – 9:00 am | 1 hr | Registration | — |
| 9:00 am – 10:00 am | 1 hr | Introduction to Game Design | Mr. Steven Jan Cadena |
| 10:00 am – 12:00 pm | 2 hrs | Concept Art for Games: Characters, Environments, Props | Mr. Kristopher Louie Rafael |
| 12:00 pm – 1:00 pm | 1 hr | Lunch Break | — |
| 1:00 pm – 2:30 pm | 1 hr 30 mins | **[Seminar]** Kick Start Your Indie Game Journey 2026 | Ms. Ria Lu & Mr. Solon Chen — Studio Manager, Kooapps Philippines / Board Member, GDAP |
| 2:30 pm – 3:00 pm | 30 mins | **[Seminar]** Sponsor Segment c/o Razer | — |
| 1:00 pm – 3:00 pm | 2 hrs | **[Workshop 4 – DIA Lab 1]** Portfolio Masterclass: Getting Studio-Ready | Ms. Ria Lu |
| 1:00 pm – 3:00 pm | 2 hrs | **[Workshop 5 – DIA Lab 2]** Game Design Workshop | Mr. Steven Jan Cadena |

---

## Base URL

```
http://localhost:3000
```

---

## Endpoints

### POST `/registration`

Register a new participant.

**Request Body — Seminar (any designation)**

```json
{
  "email": "juan.dela.cruz@email.com",
  "fullName": "Juan Dela Cruz",
  "designation": "educator",
  "affiliation": "Ateneo De Naga University",
  "contactNumber": "+63 912 345 6789",
  "attendanceType": "seminar"
}
```

**Request Body — Workshop (students only)**

```json
{
  "email": "maria.santos@school.edu.ph",
  "fullName": "Maria Santos",
  "designation": "student",
  "affiliation": "ADNU",
  "contactNumber": "+63 917 000 1234",
  "attendanceType": "workshop",
  "workshopDay1": "workshop1",
  "workshopDay2": "workshop4"
}
```

**Fields**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Valid email. Duplicates are rejected. |
| `fullName` | string | Yes | Full name of the participant. |
| `designation` | string | Yes | See valid values below. |
| `affiliation` | string | Yes | Partner-school students: `ADNU`, `NCF`, or `BISCAST`. Others: free text. |
| `contactNumber` | string | Yes | Valid phone number (7–20 digits, `+` and spaces allowed). |
| `attendanceType` | string | Yes | `seminar` or `workshop`. |
| `workshopDay1` | string | Conditional | Required if student + workshop. `workshop1` or `workshop2`. |
| `workshopDay2` | string | Conditional | Required if student + workshop. `workshop4` or `workshop5`. |

**Valid designations**

| Value | Label |
|---|---|
| `student` | Student |
| `game developer` | Game Developer |
| `educator` | Educator |
| `industry professional` | Industry Professional |
| `animator` | Animator |
| `lgu` | Local Government Unit (LGU) |
| `other` | Other (free text sent by frontend) |

**Valid attendance types**

| Value | Description |
|---|---|
| `seminar` | Attend talk/lecture sessions |
| `workshop` | Attend hands-on DIA Lab sessions (students only pick workshops) |

**Valid workshop values**

| Field | Value | Session |
|---|---|---|
| `workshopDay1` | `workshop1` | DIA Lab 1 — Marketing your Game |
| `workshopDay1` | `workshop2` | DIA Lab 2 — Visual Development & World-Building |
| `workshopDay2` | `workshop4` | DIA Lab 1 — Portfolio Masterclass: Getting Studio-Ready |
| `workshopDay2` | `workshop5` | DIA Lab 2 — Game Design Workshop |

**Responses**

`201 Created` — Registration successful

```json
{
  "message": "Registration successful.",
  "data": {
    "_id": "664a1f2e3b1c2d4e5f6a7b8c",
    "email": "maria.santos@school.edu.ph",
    "fullName": "Maria Santos",
    "designation": "student",
    "affiliation": "ADNU",
    "contactNumber": "+63 917 000 1234",
    "attendanceType": "workshop",
    "workshopDay1": "workshop1",
    "workshopDay2": "workshop4",
    "createdAt": "2026-04-17T08:00:00.000Z",
    "updatedAt": "2026-04-17T08:00:00.000Z"
  }
}
```

`400 Bad Request` — Validation error

```json
{
  "statusCode": 400,
  "message": ["attendanceType must be either: seminar or workshop"],
  "error": "Bad Request"
}
```

`400 Bad Request` — Duplicate email

```json
{
  "statusCode": 400,
  "message": "This email address is already registered.",
  "error": "Bad Request"
}
```

`503 Service Unavailable` — Overall slots full

```json
{
  "statusCode": 503,
  "message": "Registration is full. The 250-slot limit has been reached.",
  "error": "Service Unavailable"
}
```

`503 Service Unavailable` — School slots full

```json
{
  "statusCode": 503,
  "message": "Registration slots for ADNU are full (50-slot limit reached).",
  "error": "Service Unavailable"
}
```

`503 Service Unavailable` — Professional/general pool full

```json
{
  "statusCode": 503,
  "message": "Registration slots for this group are full (100-slot limit reached).",
  "error": "Service Unavailable"
}
```

`503 Service Unavailable` — Workshop slot full

```json
{
  "statusCode": 503,
  "message": "Workshop 1 — DIA Lab 1 (Day 1) is full (30-slot limit reached).",
  "error": "Service Unavailable"
}
```

---

### GET `/registration/slots`

Check slot counts across all groups.

**Response**

`200 OK`

```json
{
  "overall": { "registered": 43, "remaining": 207, "limit": 250 },
  "schools": [
    { "school": "ADNU", "registered": 10, "limit": 50, "remaining": 40 },
    { "school": "NCF", "registered": 5, "limit": 50, "remaining": 45 },
    { "school": "BISCAST", "registered": 20, "limit": 50, "remaining": 30 }
  ],
  "professionals": { "registered": 8, "remaining": 92, "limit": 100 },
  "attendance": { "seminar": 25, "workshop": 18 },
  "workshops": [
    { "id": "workshop1", "label": "Workshop 1 — DIA Lab 1 (Day 1)", "registered": 12, "limit": 30, "remaining": 18 },
    { "id": "workshop2", "label": "Workshop 2 — DIA Lab 2 (Day 1)", "registered": 6, "limit": 30, "remaining": 24 },
    { "id": "workshop4", "label": "Workshop 4 — DIA Lab 1 (Day 2)", "registered": 9, "limit": 30, "remaining": 21 },
    { "id": "workshop5", "label": "Workshop 5 — DIA Lab 2 (Day 2)", "registered": 3, "limit": 30, "remaining": 27 }
  ]
}
```

---

## Running Locally

**1. Install dependencies**

```bash
pnpm install
```

**2. Set up environment**

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/imagdd-registration
PORT=3000
```

**3. Start the server**

```bash
# development
pnpm run start:dev

# production
pnpm run build
pnpm run start:prod
```

**4. Interactive API Docs (Swagger UI)**

```
http://localhost:3000/api/docs
```

---

## Tech Stack

- [NestJS](https://nestjs.com/) v11
- [MongoDB](https://www.mongodb.com/) via Mongoose
- [class-validator](https://github.com/typestack/class-validator) for request validation
- [@nestjs/swagger](https://docs.nestjs.com/openapi/introduction) for Swagger UI
