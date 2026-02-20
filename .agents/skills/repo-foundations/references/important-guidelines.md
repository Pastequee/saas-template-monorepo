# Important Guidelines

## DO

- Keep files under 200-300 lines
- Write descriptive comments explaining "why" when code logic is complex
- Use existing patterns when adding new features
- Invalidate queries after mutations
- Handle loading and error states in UI
- Use the structured logger (`#lib/logger`) instead of console.log in the backend
- Keep this @AGENTS.md file up to date when adding/changing/removing key parts

## DON'T

- Don't mock data outside of tests
- Don't use `any` type (suppress with oxlint-ignore if unavoidable)
- Don't commit sensitive data or .env files
- Don't add features beyond what was requested
- Don't over-engineer or add unnecessary abstractions
