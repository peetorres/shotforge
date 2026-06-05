# STATE MACHINE — Shotforge V2

> Formal state transitions. No transition not listed here is valid.

## States

```text
idle
creating
validating_upload
upload_failed
uploaded
generating
scoring
repairing
curated
previewing
editing
exporting
export_failed
exported
restoring_session
restore_failed
```

## State Transition Table

| From | Event | Guard | To | Side Effects |
|------|-------|-------|----|-------------|
| idle | form_opened | — | creating | initialize project shell |
| creating | files_selected | valid files | creating | update pending files |
| creating | files_rejected | invalid files | creating | show validation error |
| creating | generate_requested | RULE-C01 and RULE-C03 satisfied | validating_upload | POST `/api/upload` |
| validating_upload | upload_succeeded | — | uploaded | persist uploaded filenames |
| validating_upload | upload_failed | — | upload_failed | show error |
| upload_failed | retry | — | creating | clear error |
| uploaded | generation_started | — | generating | run ingest, perception, direction, composition |
| generating | candidates_ready | — | scoring | evaluate candidate sequences |
| generating | generation_failed | fallback available | scoring | continue with premium fallback candidates |
| scoring | enough_candidates_passed | >= 3 AAA or acceptable set | curated | build finalist set |
| scoring | repair_required | retry budget remains | repairing | target weak slides/sequences |
| scoring | no_candidates_passed | retry budget remains | repairing | attempt safer compositions |
| repairing | candidates_ready | — | scoring | re-evaluate |
| repairing | retry_budget_exhausted | premium acceptable set exists | curated | surface best acceptable finalists |
| curated | auto_enter_preview | — | previewing | show ranked finalists |
| previewing | finalist_selected | valid finalist | previewing | update selected finalist |
| previewing | edit_mode_entered | selected finalist exists | editing | open editor state within same surface |
| previewing | export_requested | selected finalist exportable | exporting | POST `/api/export` |
| editing | field_edited | editable field | editing | update centralized store, invalidate preview |
| editing | regenerate_requested | dirty guard passes | editing | trigger targeted regenerate |
| editing | edit_mode_exited | — | previewing | retain selected finalist |
| editing | export_requested | selected finalist exportable | exporting | POST `/api/export` |
| exporting | export_succeeded | — | exported | trigger ZIP download |
| exporting | export_failed | — | export_failed | show retryable error |
| export_failed | retry | — | exporting | retry export |
| exported | continue_previewing | — | previewing | remain in Preview surface |
| * | page_loaded | persisted session exists | restoring_session | hydrate centralized store |
| restoring_session | restore_succeeded | schema valid | restored user-visible state | resume Create, Generate, Preview, or Editing state |
| restoring_session | restore_failed | schema invalid | idle | clear invalid persistence and redirect to Create |

## Guards

| Guard | Condition |
|-------|-----------|
| valid_files | RULE-V01 and RULE-V02 and RULE-V03 and RULE-V04 |
| valid_finalist | finalist exists in surfaced `FinalistSet` |
| editable_field | field is valid for the selected slide and edit mode |
| dirty_guard | if `contentOrigin === "edited_by_user"`, require confirmation before overwrite |
| exportable | selected finalist exists, has slides, screenshots resolve, render inputs valid |
| schema_valid | persisted state matches current schema version |
| retry_budget_remains | repair budget not exhausted |

## Side Effects Registry

| Side Effect | Trigger |
|-------------|---------|
| persist_to_store | any centralized state mutation |
| invalidate_preview | edit or repair affecting selected finalist |
| debounced_preview_render | selected finalist changed or edited |
| trigger_generation_pipeline | after upload succeeds |
| trigger_evaluation | after candidate generation or repair |
| trigger_repair | evaluator requests repair |
| trigger_zip_download | export succeeds |
| clear_invalid_persistence | restore failure |
| show_error_toast | upload, export, restore, or render failure |
