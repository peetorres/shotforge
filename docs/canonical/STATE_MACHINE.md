# STATE MACHINE — Shotforge V2

> Formal state transitions. No transition not listed here is valid.

## States

```
idle                    Initial state, no project
creating                User is filling the Create form
validating_upload       Files being validated server-side
upload_failed           Upload rejected (validation error)
uploaded                Files uploaded, ready to generate
generating              AI + render pipeline running
generation_partial      Some variants completed, others in progress
generation_failed       All AI calls failed (fallback should prevent this)
generated               All 3 variants ready
choosing                User browsing variants
refining                User editing selected variant
previewing              Inspector hidden, full-width App Store view
exporting               ZIP being generated server-side
export_failed           Export request failed
exported                ZIP downloaded successfully
restoring_session       Rehydrating from localStorage on page load
restore_failed          Stored session invalid or incompatible
```

## State Transition Table

| From | Event | Guard | To | Side Effects |
|------|-------|-------|----|-------------|
| idle | form_opened | — | creating | — |
| creating | files_selected | valid files (RULE-V01..V04) | creating | update store.uploadedFiles |
| creating | files_rejected | invalid files | creating | show validation error |
| creating | generate_requested | RULE-C01 + C03 satisfied | validating_upload | POST /api/upload |
| validating_upload | upload_succeeded | — | uploaded | store files, navigate to /generate |
| validating_upload | upload_failed | — | upload_failed | show error, stay on create |
| upload_failed | retry | — | creating | clear error |
| uploaded | generation_started | — | generating | call AI + render for 3 variants |
| generating | variant_completed | partial | generation_partial | update progress, store variant |
| generating | all_variants_completed | all 3 done | generated | navigate to /choose |
| generating | generation_failed | all failed | generation_failed | show error with retry |
| generation_partial | variant_completed | last one | generated | navigate to /choose |
| generation_partial | variant_failed | fallback available | generation_partial | use template, continue |
| generated | — | auto | choosing | — |
| choosing | variant_selected | valid variantId | choosing | set selectedVariantId, show export bar |
| choosing | refine_requested | valid variantId | refining | set selectedVariantId, navigate to /refine |
| choosing | slide_clicked | valid variantId + slideIdx | refining | set both, navigate to /refine |
| choosing | export_requested | selectedVariantId set | exporting | POST /api/export |
| refining | slide_selected | valid index | refining | update activeSlideIndex |
| refining | field_edited | editable field | refining | update store, mark dirty, invalidate preview |
| refining | background_changed | valid preset | refining | update all slides in variant |
| refining | brand_color_changed | valid hex | refining | update project-level, affects all variants |
| refining | ai_regenerate_requested | slide selected | refining | call AI, respect dirty guard (RULE-RG02) |
| refining | preview_toggled | — | previewing | hide inspector |
| refining | export_requested | — | exporting | POST /api/export |
| refining | back_to_choose | — | choosing | navigate to /choose |
| previewing | preview_toggled | — | refining | show inspector |
| previewing | export_requested | — | exporting | POST /api/export |
| exporting | export_succeeded | — | exported | trigger ZIP download |
| exporting | export_failed | — | export_failed | show error, allow retry |
| export_failed | retry | — | exporting | retry POST |
| exported | continue_editing | — | refining | — |
| * (any page load) | page_loaded | session in localStorage | restoring_session | read + validate |
| restoring_session | restore_succeeded | schema valid | (restored step) | hydrate store |
| restoring_session | restore_failed | schema invalid | idle | clear storage, redirect to / |

## Guards

| Guard | Condition |
|-------|-----------|
| valid_files | RULE-V01 AND V02 AND V03 AND V04 |
| form_complete | RULE-C01 AND RULE-C03 satisfied |
| valid_variantId | id in ["midnight", "clean", "vivid"] |
| valid_slideIndex | 0 <= index < uploadedFiles.length |
| editable_field | field exists on slide type, field is editable per truth table |
| dirty_guard | if contentOrigin === "edited_by_user", require confirmation before overwrite |
| schema_valid | stored session matches current schema version |
| exportable | selectedVariantId set, variant has slides, all slides have screenshots |

## Side Effects Registry

| Side Effect | Trigger |
|-------------|---------|
| persist_to_localStorage | any store mutation |
| invalidate_preview | any slide or variant field change |
| debounced_preview_render | slide field changed (300ms debounce) |
| navigate | step transition |
| show_error_toast | any *_failed transition |
| trigger_zip_download | export_succeeded |
| clear_localStorage | restore_failed |
| log_telemetry | all transitions (future: PostHog) |
