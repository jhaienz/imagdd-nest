# IMAGDD Registration API

Backend API for the IMAGDD event registration form built with NestJS and MongoDB.

- Max **250 slots**
- Duplicate emails are rejected
- No authentication required

---

## Base URL

```
http://localhost:3000
```

---

## Endpoints

### POST `/registration`

Register a new participant.

**Request Body**

```json
{
  "email": "juan.dela.cruz@email.com",
  "fullName": "Juan Dela Cruz",
  "designation": "student",
  "affiliation": "University of the Philippines",
  "contactNumber": "+63 912 345 6789"
}
```

**Fields**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Must be a valid email. Duplicates are rejected. |
| `fullName` | string | Yes | Full name of the participant. |
| `designation` | string | Yes | One of: `student`, `game developer`, `educator`, `industry professional`, `other` |
| `affiliation` | string | Yes | School, company, or organization. |
| `contactNumber` | string | Yes | Valid phone number (7–20 digits, `+` and spaces allowed). |

**Responses**

`201 Created` — Registration successful

```json
{
  "message": "Registration successful.",
  "data": {
    "_id": "664a1f2e3b1c2d4e5f6a7b8c",
    "email": "juan.dela.cruz@email.com",
    "fullName": "Juan Dela Cruz",
    "designation": "student",
    "affiliation": "University of the Philippines",
    "contactNumber": "+63 912 345 6789",
    "createdAt": "2026-04-17T08:00:00.000Z",
    "updatedAt": "2026-04-17T08:00:00.000Z"
  }
}
```

`400 Bad Request` — Validation error

```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
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

`503 Service Unavailable` — Slots full

```json
{
  "statusCode": 503,
  "message": "Registration is full. The 250-slot limit has been reached.",
  "error": "Service Unavailable"
}
```

---

### GET `/registration/slots`

Check how many slots have been filled and how many remain.

**Response**

`200 OK`

```json
{
  "registered": 42,
  "remaining": 208
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
