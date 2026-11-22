# Project guide

## Features implemented in this starter
- Responsive single-page website and mobile navigation.
- Four BHMS year cards loaded from `data/subjects.json`.
- Global search across listed subjects, resources and medicine records.
- Allopathy medicine search with reference fields and source links.
- Resource category filter.
- External source links and optional PDF preview for resources that provide a direct PDF URL.
- Local medicine image preview only.
- GitHub Actions deployment workflow for GitHub Pages.

## Not implemented yet
- Complete topic-wise BHMS notes with English, Gujarati explanation and Gujarati-script pronunciation.
- Complete verified HNGU previous-year question-paper archive and solutions.
- Comprehensive Indian medicine database with verified brand, strength and manufacturer data.
- OCR or AI medicine identification.
- User accounts, cloud storage, backend database or AI chat endpoint.

## Folder plan
- `BHMS/First-Year` through `BHMS/Fourth-Year`: year-specific material.
- `Question-Papers/HNGU` and `Question-Papers/Other-Universities`: separate paper archives.
- `Notes/English`, `Notes/Gujarati`, `Notes/Pronunciation`: language-specific notes.
- `Practical`, `Diagrams`: practical and diagram material.
- `Allopathy/Medicine-Database`, `Allopathy/Drug-References`: medicine data and references.
- `Reference-Materials`, `Source-Links`: general references and source records.

## Content quality rules
1. Confirm each syllabus against the current applicable NCH/HNGU documents.
2. Check university, subject, exam session and year on every question paper before labelling it HNGU.
3. Keep other universities' papers in their own folder.
4. Add question solutions only after reviewing the question and source.
5. For medicines, use current official product information; do not invent dosage.
6. Respect copyright and permissions before hosting third-party PDFs or notes.
7. Mark content as `verified`, `needs-review`, or `content-needed` accurately.

## Run locally
Because the app fetches JSON, use a local web server rather than opening `index.html` with a `file://` URL.
