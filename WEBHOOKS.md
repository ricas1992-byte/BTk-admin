# BTK-System Webhook Integration with Make.com

## Overview

BTK-System now has a complete, production-ready webhook system for bidirectional integration with Make.com. All webhooks are sent from the **server-side only**, ensuring security, reliability, and proper error handling.

---

## Features

✅ **Server-Side Only** - All webhooks sent from the backend, not client
✅ **Hardened Security** - WEBHOOK_SECRET authentication for incoming webhooks
✅ **Automatic Retries** - Exponential backoff retry logic (3 attempts)
✅ **Comprehensive Logging** - Full request/response logging for debugging
✅ **Error Handling** - Graceful failure handling with detailed error messages
✅ **Four Event Types** - Complete task lifecycle coverage

---

## Outgoing Webhooks (BTK → Make.com)

### Event Types

| Event | Description | Triggered When |
|-------|-------------|----------------|
| `task_created` | New task created | POST /api/tasks |
| `task_updated` | Task fields updated | PUT /api/tasks/:id |
| `task_status_changed` | Task status changed | PUT /api/tasks/:id (status field) |
| `task_deleted` | Task deleted | DELETE /api/tasks/:id |

### Payload Format

All outgoing webhooks send the following JSON structure:

```json
{
  "event": "task_created",
  "task": {
    "id": "task_1765216530445_che0wi9",
    "title": "Example Task",
    "description": "Task description",
    "type": "TECH",
    "category": "WORK",
    "status": "OPEN",
    "priority": "HIGH",
    "dueDate": "2025-12-15T00:00:00.000Z",
    "tags": ["webhook", "test"],
    "attachments": [],
    "createdAt": "2025-12-08T17:55:30.444Z",
    "updatedAt": "2025-12-08T17:55:30.444Z"
  }
}
```

### Configuration

Set the Make.com webhook URL in `.env`:

```bash
WEBHOOK_URL=https://hook.eu1.make.com/YOUR_WEBHOOK_ID_HERE
```

### Retry Logic

- **Max Retries**: 3 attempts
- **Backoff**: 1s, 2s, 4s (exponential)
- **Client Errors (4xx)**: No retry (except 429 rate limit)
- **Server Errors (5xx)**: Full retry cycle
- **Timeouts**: 10 seconds per request

---

## Incoming Webhooks (Make.com → BTK)

### Endpoint

```
POST /api/incoming-webhook?secret=YOUR_WEBHOOK_SECRET
```

### Authentication

**Required**: Query parameter `secret` must match `WEBHOOK_SECRET` in `.env`

### Request Format

```bash
curl -X POST "https://your-domain.com/api/incoming-webhook?secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "task_created",
    "task": {
      "id": "test123",
      "title": "Test Task",
      "status": "OPEN"
    }
  }'
```

### Response Codes

| Code | Description |
|------|-------------|
| `200` | Webhook received and processed successfully |
| `401` | Missing or invalid secret |
| `500` | Server error processing webhook |

### Success Response

```json
{
  "success": true,
  "message": "Webhook received successfully",
  "timestamp": "2025-12-08T17:57:49.760Z"
}
```

### Error Responses

```json
// Missing secret
{
  "error": "Unauthorized: Missing secret parameter"
}

// Invalid secret
{
  "error": "Unauthorized: Invalid secret"
}
```

---

## Task API Endpoints

### Create Task

```bash
POST /api/tasks
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description",
  "type": "TECH",
  "category": "WORK",
  "status": "OPEN",
  "priority": "HIGH",
  "tags": ["tag1", "tag2"]
}
```

**Triggers**: `task_created` webhook

---

### Get All Tasks

```bash
GET /api/tasks
```

**Returns**: Array of all tasks

---

### Get Single Task

```bash
GET /api/tasks/:id
```

**Returns**: Task object or 404

---

### Update Task

```bash
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "priority": "URGENT"
}
```

**Triggers**: `task_updated` webhook

---

### Change Task Status

```bash
PUT /api/tasks/:id
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

**Triggers**: `task_status_changed` webhook

---

### Delete Task

```bash
DELETE /api/tasks/:id
```

**Triggers**: `task_deleted` webhook

---

## Environment Variables

Create a `.env` file in the project root:

```bash
# Webhook Configuration
WEBHOOK_SECRET=your_secure_secret_key_here
WEBHOOK_URL=https://hook.eu1.make.com/YOUR_WEBHOOK_ID

# Server Configuration
PORT=5000
NODE_ENV=production
```

**Important**: Never commit `.env` to git. Use `.env.example` as a template.

---

## Make.com Scenario Setup

### 1. Create Webhook Trigger

1. Create new scenario in Make.com
2. Add **Webhooks → Custom webhook** module
3. Copy the webhook URL (format: `https://hook.eu1.make.com/...`)
4. Paste into `.env` as `WEBHOOK_URL`

### 2. Configure Webhook Response (Optional)

To send data back to BTK-System:

1. Add **HTTP → Make a request** module after your logic
2. URL: `https://your-btk-domain.com/api/incoming-webhook?secret=YOUR_SECRET`
3. Method: `POST`
4. Body: JSON with event and task data

### 3. Test the Integration

Run all four operations and verify webhooks in Make.com:

```bash
# 1. Create task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","type":"TECH","status":"OPEN","priority":"HIGH"}'

# 2. Update task (use task ID from step 1)
curl -X PUT http://localhost:5000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"priority":"URGENT"}'

# 3. Change status
curl -X PUT http://localhost:5000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS"}'

# 4. Delete task
curl -X DELETE http://localhost:5000/api/tasks/TASK_ID
```

---

## Server Logs

All webhook activity is logged for debugging:

```
[WEBHOOK] Sending task_created for task task_123 (attempt 1/3)
[WEBHOOK] Successfully sent task_created for task task_123
[INCOMING WEBHOOK] Authenticated webhook received: { event: 'task_created', taskId: 'test123', ... }
```

To monitor logs in real-time:

```bash
npm run dev  # Development mode with live logs
```

---

## Architecture

### File Structure

```
server/
├── webhooks/
│   └── webhook_sender.ts          # Unified webhook module
├── routes/
│   ├── tasks.ts                   # Task CRUD + webhook triggers
│   └── incoming-webhook.ts        # Incoming webhook handler
├── types/
│   └── tasks.ts                   # Task type definitions
└── index.ts                       # Server entry point
```

### Webhook Sender Module

Located: `server/webhooks/webhook_sender.ts`

**Features**:
- Centralized webhook sending logic
- Automatic retry with exponential backoff
- Comprehensive error handling
- Detailed logging
- Helper functions for each event type

**Usage Example**:

```typescript
import { sendTaskCreatedWebhook } from '../webhooks/webhook_sender';

const result = await sendTaskCreatedWebhook(task);
if (!result.success) {
  console.error('Webhook failed:', result.error);
}
```

---

## Troubleshooting

### Webhooks Returning 403

**Cause**: Make.com webhook URL is invalid, expired, or scenario is paused

**Solution**:
1. Check if Make.com scenario is active
2. Regenerate webhook URL in Make.com
3. Update `WEBHOOK_URL` in `.env`
4. Restart server

---

### Incoming Webhooks Failing with 401

**Cause**: Missing or incorrect `WEBHOOK_SECRET`

**Solution**:
1. Verify `.env` contains `WEBHOOK_SECRET`
2. Ensure query parameter matches: `?secret=YOUR_SECRET`
3. Check for typos in secret value

---

### Webhooks Not Sending

**Cause**: Server not loading `.env` file

**Solution**:
1. Verify `.env` file exists in project root
2. Check `dotenv` is installed: `npm install dotenv`
3. Restart server to reload environment variables

---

## Testing

All four webhook events have been tested and verified:

✅ **task_created** - Tested
✅ **task_updated** - Tested
✅ **task_status_changed** - Tested
✅ **task_deleted** - Tested
✅ **Incoming webhook with auth** - Tested
✅ **Retry logic** - Implemented
✅ **Error handling** - Implemented

---

## Security Notes

1. **Never commit `.env`** - Contains sensitive webhook credentials
2. **Use strong secrets** - Generate random, long WEBHOOK_SECRET values
3. **HTTPS in production** - Always use HTTPS for webhook endpoints
4. **Validate incoming data** - Always validate webhook payloads before processing
5. **Rate limiting** - Consider adding rate limiting to incoming webhook endpoint

---

## Production Deployment

Before deploying to production:

1. Set all environment variables in your hosting platform
2. Ensure HTTPS is enabled
3. Update Make.com webhook URL to production domain
4. Test all four webhook events end-to-end
5. Monitor server logs for webhook errors
6. Set up error alerting for failed webhooks

---

## Status

**BTK-System Webhooks are fully operational and production-ready.**

All webhook functionality has been tested, documented, and is ready for use with Make.com.
