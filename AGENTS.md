# LabFlow development handoff

Start by reading `docs/HANDOFF.md`, `docs/DECISIONS.md` and `tasks/todo.md`, then inspect actual Git status. Read only the relevant SRS sections for the task. Do not restart completed milestones or overwrite another chat's unfinished work.

- This is an individual ICTAK demo capstone using JavaScript/JSX, React/Vite, Express and MongoDB/Mongoose. Scope is one lab, students and administrators.
- The owner authorized development on 21 October 2026 while SRS approval/submission remain pending. Do not restore the superseded pre-coding gate or claim the SRS was approved/submitted.
- Preserve M0 history and both ignored original ICTAK DOCX files. Work on focused `codex/` branches and save verified increments as local commits. No force-push or destructive resets.
- Local edits/tests/fixes are authorized. Ask only for required information/access or concrete publishing, payment and submission approval. No paid resources or real-person demo data.
- API boundary validation, role/ownership enforcement and real MongoDB transaction tests are required. Browser mocks are not database concurrency evidence. Keep secrets out of Git, logs and screenshots.
- Use the root npm workspace and authoritative `package-lock.json`. Run `npm ci --ignore-scripts`; dependency scripts are disabled by `.npmrc`. Do not add competing lockfiles or blanket-enable scripts.
- Commands: `npm test`, `npm run test:integration`, `npm run lint`, `npm run build`; `npm run check` combines them. See README for startup and environment configuration.
- Keep `docs/HANDOFF.md`, milestone evidence and `tasks/todo.md` current at each checkpoint. Distinguish passing, failing and not-run checks. Record any incomplete work before changing chats.
- Continue authorized local development across milestones; completing a milestone is not a reason to stop or ask to continue. Report concise milestones. The owner prefers economical model use and may switch the chat model between milestones; the agent cannot change its own running model. Do not create agents unless explicitly authorized.
- Use installed plugins where they help. MongoDB Atlas read access was verified; cloud provisioning/publication still requires a concrete approval. No additional plugin is needed for local development.
