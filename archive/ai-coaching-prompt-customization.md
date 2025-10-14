# AI Coaching Prompt Customization – Requirements

## Overview

Enable administrative users to fully customize the AI's prompt for the coaching role. This allows precise control over the AI's approach, tone, and functionality, ensuring the coaching experience aligns with organizational objectives and user needs.

---

## User Stories

- As an admin, I want to edit and save the AI's coaching prompt via a secure UI.
- As an admin, I want changes to the prompt to take effect immediately for all future AI coaching interactions.
- As a user, I want the AI's coaching style and guidance to reflect the organization's current objectives and preferences.

---

## Functional Requirements

### 1. Admin Prompt Editor UI
- Accessible only to authenticated admin users.
- Rich text editor (with markdown support) for editing the coaching prompt.
- "Save" and "Reset to Default" actions.
- Display the current active prompt and last updated timestamp.

### 2. Backend Storage
- Store the prompt in a persistent location (database table or config file).
- Track last updated timestamp and admin user who made the change.
- Provide a default prompt if none is set.

### 3. API Endpoints
- **GET /api/admin/ai-coaching-prompt**: Retrieve the current prompt (admin only).
- **POST /api/admin/ai-coaching-prompt**: Update the prompt (admin only).
- **GET /api/ai-coaching-prompt**: Retrieve the current prompt (for use in AI workflows, public).

### 4. AI Workflow Integration
- All AI coaching requests must use the latest admin-defined prompt as system/context for the model.
- If no custom prompt is set, use the default.

### 5. Access Control & Security
- Only admin users can view/edit the prompt editor UI and update the prompt.
- All API endpoints for editing require admin authentication.

### 6. Audit & Versioning (Optional/Advanced)
- Log all prompt changes with timestamp and admin user.
- Allow admins to view prompt history and revert to previous versions.

---

## Non-Functional Requirements

- **Performance:** Prompt retrieval must be fast and not block AI requests.
- **Reliability:** Prompt changes must persist across server restarts and deployments.
- **Security:** Only authorized admins can modify the prompt.
- **Usability:** Editor UI must be clear, accessible, and easy to use.

---

## Implementation Plan

1. **Database:** Create a table (e.g., `ai_coaching_prompt`) with fields: id, prompt, updatedAt, updatedBy.
2. **API:** Implement REST endpoints for prompt retrieval and update, with admin auth.
3. **Frontend:** Build an admin-only page/component for editing and saving the prompt.
4. **AI Integration:** Update AI workflow to always fetch and use the current prompt.
5. **Testing:** Add tests for prompt editing, retrieval, and AI workflow integration.

---

## Acceptance Criteria

- [ ] Admins can view and edit the AI coaching prompt via the UI.
- [ ] Prompt changes are immediately reflected in all AI coaching interactions.
- [ ] Only admins can access and modify the prompt.
- [ ] Prompt is persisted and survives server restarts.
- [ ] All requirements above are met and verified by tests.