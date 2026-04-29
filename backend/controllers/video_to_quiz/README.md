# Video to Quiz API Documentation

This document explains all the available endpoints in the **Video to Quiz Platform API**. The API allows users to convert YouTube videos into quizzes, manage quiz generation, attempt quizzes, and retrieve results. Also plesae make sure your clerk setup is correct and working as expected. A common issue you may incounter that creds are not being sent to backend when origin is localhost, make sure to add credentials with your request so the authenticator in the backend can pass the request for further processing. Another thing you can do is increase the life of session you are creating, you can find this setting in clerk dashboard under session or JWT in left pane.

---

## Base Route

All endpoints are registered under the `videoToQuiz` router.

---

## 1. Health Check

### `GET /api/video_to_quiz/`
**Example:**
http://localhost:8000/api/video_to_quiz/

**Description:**
Checks if the Video to Quiz API is running.

**Response:**

```json
{
  "message":"Video to Quiz Platform API",
  "status":"running"
}
```

---

## 2. Get User Quiz History

### `GET /user-history`

**Description:**
Returns all quizzes created by the authenticated user.

**Authentication:** Required

**Response:**

```json
{
  "quizzes": [ ... ]
}
```

---

## 3. Get User Quota

### `GET /quota`

**Description:**
Returns the remaining quota for generating quizzes. If no quota exists, returns zero. Automatically resets quota if the reset date has passed.

**Authentication:** Required

**Response:**

```json
{
  "user_id": "string",
  "quota_remaining": 5,
  "last_reset_date": "2026-02-06T12:34:56"
}
```

---

## 4. Get Video Details

### `POST /video/details`

**Description:**
Fetches metadata of a YouTube video and stores it in the cache. Curently it stores the audio file in local storage, we will find some better way to store it in production.

**Request Body:**

```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Video details retrieved successfully.",
  "video_info": { ... }
}
```

---

## 5. Download Audio

### `POST /audio/download`

**Description:**
Downloads the audio of a video in the background. Requires video details to be cached first.

**Request Body:**

```json
{
  "video_id": "VIDEO_ID"
}
```

**Response (if already downloaded):**

```json
{
  "success": true,
  "message": "Audio already downloaded.",
  "video_info": { ... },
  "audio_path": "downloads/VIDEO_ID.m4a",
  "status": "already_downloaded"
}
```

**Response (if starting download):**

```json
{
  "success": true,
  "message": "Audio download started in background.",
  "video_info": { ... },
  "status": "downloading"
}
```

---

## 6. Generate Quiz

### `POST /generate`

**Description:**
Starts quiz generation in the background using the video audio and selected difficulty/number of questions.

**Authentication:** Required

**Request Body:**

```json
{
  "video_id": "VIDEO_ID",
  "difficulty": "easy | medium | hard",
  "num_questions": 5
}
```

**Constraints:**

* `difficulty` must be one of: `easy`, `medium`, `hard`
* `num_questions` must be between 1 and 20
* Audio must already be downloaded

**Response:**

```json
{
  "success": true,
  "message": "Quiz generation started in background.",
  "video_info": { ... },
  "difficulty": "medium",
  "num_questions": 5,
  "status": "processing",
  "quiz_ref": { ... }
}
```

---

## 7. Get Quiz Status

### `GET /status/{quiz_id}`

**Description:**
Checks whether a quiz has finished generating (i.e., whether questions exist).

**Authentication:** Required

**Path Parameter:**

* `quiz_id` (int)

**Response:**

```json
{
  "success": true,
  "ready": true
}
```

* `ready = true` → quiz is ready to start
* `ready = false` → still processing

---

## 8. Start Quiz

### `POST /start/{quiz_id}`

**Description:**
Fetches all questions for a quiz and returns them in a structured format.

**Authentication:** Required

**Path Parameter:**

* `quiz_id` (int)

**Response:**

```json
{
  "success": true,
  "quiz_questions": [
    {
      "question": "...",
      "options": {
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
      },
      "correct_answer": "B",
      "explanation": "..."
    }
  ],
  "quiz_id": 12
}
```

---

## 9. Add Quiz Results

### `POST /add_results/{quiz_id}`

**Description:**
Stores the result of a completed quiz attempt.

**Authentication:** Required

**Path Parameter:**

* `quiz_id` (int)

**Request Body:**

```json
{
  "total_correct_attempt": 4,
  "total_wrong_attempt": 1,
  "not_attempted": 0
}
```

**Response:**

```json
{
  "success": true,
  "message": "Quiz result saved successfully"
}
```

**Error:**

* Returns `400` if submitted counts do not match quiz requirements.

---

## 10. Get Quiz Results

### `GET /get_results/{quiz_id}`

**Description:**
Fetches the stored results for a quiz attempt by the authenticated user.

**Authentication:** Required

**Path Parameter:**

* `quiz_id` (int)

**Response:**

```json
{
  "quiz_id": 12,
  "total_correct_attempt": 4,
  "total_wrong_attempt": 1,
  "not_attempted": 0,
  "score": 4,
  "attempted_at": "2026-02-06T13:22:11"
}
```

---

## Flow Summary

1. `POST /video/details` → Cache video metadata
2. `POST /audio/download` → Download audio
3. `POST /generate` → Start quiz generation
4. `GET /status/{quiz_id}` → Poll until ready
5. `POST /start/{quiz_id}` → Get quiz questions
6. `POST /add_results/{quiz_id}` → Submit results
7. `GET /get_results/{quiz_id}` → Retrieve results

---
