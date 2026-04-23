# IMAGDD Registration API

Backend API for the IMAGDD event registration form built with NestJS and MongoDB.

- Fee is **250 per day**
- Max **500 total registrations** across both days
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
| **Total** | **500** |

> Registration fee is **250 per day**. If a participant attends both days, they are counted twice.

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

### GET `/`

Health/root route.

**Sample request (curl)**

```bash
curl -X GET http://localhost:3000/
```

**Sample request (frontend fetch)**

```ts
const res = await fetch('http://localhost:3000/');
const data = await res.text();
```

---

### POST `/registration`

Register a participant.

**Required fields**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Valid email. Duplicates are rejected. |
| `fullName` | string | Yes | Full name of participant. |
| `designation` | string | Yes | `student`, `game developer`, `educator`, `industry professional`, `animator`, `lgu`, `other`. |
| `affiliation` | string | Yes | School/company/organization. |
| `contactNumber` | string | Yes | Valid phone format. |
| `attendanceDay` | string | Yes | `day 1` or `day 2`. |
| `attendanceType` | string | Yes | `seminar` or `workshop`. |
| `workshopDay1` | string | Conditional | Required if `designation=student` and `attendanceType=workshop`. Values: `workshop1`, `workshop2`. |
| `workshopDay2` | string | Conditional | Required if `designation=student` and `attendanceType=workshop`. Values: `workshop4`, `workshop5`. |

**Sample request body (seminar)**

```json
{
  "email": "juan.dela.cruz@email.com",
  "fullName": "Juan Dela Cruz",
  "designation": "educator",
  "affiliation": "Ateneo De Naga University",
  "contactNumber": "+63 912 345 6789",
  "attendanceDay": "day 1",
  "attendanceType": "seminar"
}
```

**Sample request body (student + workshop)**

```json
{
  "email": "maria.santos@school.edu.ph",
  "fullName": "Maria Santos",
  "designation": "student",
  "affiliation": "ADNU",
  "contactNumber": "+63 917 000 1234",
  "attendanceDay": "day 1",
  "attendanceType": "workshop",
  "workshopDay1": "workshop1",
  "workshopDay2": "workshop4"
}
```

**Sample request (curl)**

```bash
curl -X POST http://localhost:3000/registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.santos@school.edu.ph",
    "fullName": "Maria Santos",
    "designation": "student",
    "affiliation": "ADNU",
    "contactNumber": "+63 917 000 1234",
    "attendanceDay": "day 1",
    "attendanceType": "workshop",
    "workshopDay1": "workshop1",
    "workshopDay2": "workshop4"
  }'
```

**Sample request (frontend fetch)**

```ts
const payload = {
  email: 'maria.santos@school.edu.ph',
  fullName: 'Maria Santos',
  designation: 'student',
  affiliation: 'ADNU',
  contactNumber: '+63 917 000 1234',
  attendanceDay: 'day 1',
  attendanceType: 'workshop',
  workshopDay1: 'workshop1',
  workshopDay2: 'workshop4',
};

const res = await fetch('http://localhost:3000/registration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

const data = await res.json();
```

---

### GET `/registration`

List registrations. All filters are optional.

**Supported query params**

| Param | Type | Example |
|---|---|---|
| `attendanceDay` | string | `day 1` |
| `workshops` | string or repeated param | `workshop1,workshop4` |
| `schools` | string or repeated param | `ADNU,NCF` |
| `designations` | string or repeated param | `student,educator` |

**Sample requests (curl)**

```bash
# no filters
curl -X GET "http://localhost:3000/registration"

# single filters
curl -X GET "http://localhost:3000/registration?attendanceDay=day%201"
curl -X GET "http://localhost:3000/registration?workshops=workshop1,workshop4"
curl -X GET "http://localhost:3000/registration?schools=ADNU,NCF"
curl -X GET "http://localhost:3000/registration?designations=student,educator"

# combined filters
curl -X GET "http://localhost:3000/registration?attendanceDay=day%201&workshops=workshop1,workshop4&schools=ADNU&designations=student"
```

**Sample request (frontend fetch)**

```ts
const params = new URLSearchParams({
  attendanceDay: 'day 1',
  workshops: 'workshop1,workshop4',
  schools: 'ADNU',
  designations: 'student',
});

const res = await fetch(`http://localhost:3000/registration?${params.toString()}`);
const data = await res.json();
```

---

### GET `/registration/slots`

Get slot summary counts.

**Sample request (curl)**

```bash
curl -X GET http://localhost:3000/registration/slots
```

**Sample request (frontend fetch)**

```ts
const res = await fetch('http://localhost:3000/registration/slots');
const data = await res.json();
```

---

### POST `/sponsorship`

Submit sponsorship inquiry.

**Sample request body**

```json
{
  "companyName": "Game Studio PH",
  "companyWebsite": "https://gamestudioph.example",
  "companyDescription": "Indie game studio and education partner.",
  "contactPerson": "Ana Reyes",
  "emailAdress": "ana@gamestudioph.example",
  "contactNumber": "+63 917 555 0101",
  "sponsorshipDescription": "Booth and prize support",
  "comments": "Available for a quick call next week"
}
```

**Sample request (curl)**

```bash
curl -X POST http://localhost:3000/sponsorship \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Game Studio PH",
    "companyWebsite": "https://gamestudioph.example",
    "companyDescription": "Indie game studio and education partner.",
    "contactPerson": "Ana Reyes",
    "emailAdress": "ana@gamestudioph.example",
    "contactNumber": "+63 917 555 0101",
    "sponsorshipDescription": "Booth and prize support",
    "comments": "Available for a quick call next week"
  }'
```

**Sample request (frontend fetch)**

```ts
const payload = {
  companyName: 'Game Studio PH',
  companyWebsite: 'https://gamestudioph.example',
  companyDescription: 'Indie game studio and education partner.',
  contactPerson: 'Ana Reyes',
  emailAdress: 'ana@gamestudioph.example',
  contactNumber: '+63 917 555 0101',
  sponsorshipDescription: 'Booth and prize support',
  comments: 'Available for a quick call next week',
};

const res = await fetch('http://localhost:3000/sponsorship', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

const data = await res.json();
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
