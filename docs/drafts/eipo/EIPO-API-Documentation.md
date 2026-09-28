# EIPO-API-Documentation — tracking log

Deliverable: `EIPO-API-Design-Document.docx` (72 pages, script-generated with docx-js; no user hand-edits yet, so the next structural change can still be regenerated from the script. After the user edits the file in Word, switch to surgical edits on their copy).

## Round 1 — 24 Sep 2026

**Asked:** design document for the EIPO package using the legacy-flow-api-doc skill, excluding `EIPO.services:submitIPORequest_1` and `EIPO.services:submitIPORequestSimulationTest`.

**Decisions (confirmed by user):** Word .docx; error-code prefix `IPO`; check Confluence first.

**Decisions (proposed, not yet confirmed):**
- Per-API code blocks: submit IPO001–029, search subscriptions 030–039, get configs 040–049, create 050–059, update 060–069, delete 070–079, lookups 080–089, internal 090–099.
- Endpoint renames: `GET /api/v1/lookups`, `GET/POST /api/v1/ipo-configurations`, `GET/PATCH/DELETE /api/v1/ipo-configurations/{ipoId}`, `POST/GET /api/v1/ipo-subscriptions`. Submit returns 201 (not 202). Checker action optionally `POST …/{ipoId}/decision`.
- Registry deviation: Confluence *REST API response codes* (page 2795896833) generic `1012 No Data Available` → 200 with empty list for the three collection reads; only `GET /ipo-configurations/{ipoId}` returns 404. Registry itself not changed.
- Exchange validation rejection (legacy 1032) classified as client-input 400 (IPO014).
- Response envelope keeps payload key `response`; `correlationID` renamed `correlationId`.

**Sources:** package export (13 flows, 11 JDBC adapters incl. decoded IRTNODE_PROPERTY table metadata and SQL, 2 WSDL consumers); Confluence pages SubmitIPORequest, getIPOSubscription, getIPOConfiguration, insert/updateIPOConfiguration, queryNin, getListOfValues, REST API response codes, release notes v58/v60.

**Key findings (Appendix D, F-01…F-25):** non-PROD stub overwrites submit results (F-01); hard-coded exchange credentials + UAT HTTP URL in queryNIN (F-02); plaintext credentials in IPO_CONFIGURATIONS (F-03); SQL injection and FIT-scope bypass via `customerName` OR in getIPOSubscriptions (F-04); caller-supplied identity (F-05); developer's personal e-mail hard-coded in NonListed 8888 branch (F-06); non-atomic subscription numbers (F-07) whose failures callers ignore (F-08); legacy code collisions with registry (F-09); `/\d*/` validation matches anything (F-10); refund JV ref always null (F-11).

**Verified:** PDF render (72 pages, no unexpected blank pages); heading numbering 1–12 + Appendices A–E with identical 8-subsection order for chapters 4–10; all error tables 4 columns except 11.7.1 / 11.8.1 (3 columns, no legacy codes); diagram ratios read from PNGs; no credential or personal e-mail values in the document text.

## Round 2 — 28 Sep 2026

**Asked:** Markdown version for GitHub.

**Done:** `EIPO-API-Design/README.md` + `images/` (10 PNG diagrams), generated from the same content modules as the .docx (single source), zipped as `EIPO-API-Design-md.zip`. Chapters are `##`, sections `###`; linked table of contents; callouts use GitHub alerts (`> [!CAUTION]` etc.); legacy-vs-target notes are placed inside the field's own table row.

**Fixed in both formats:** the docx italic markup was swallowing underscores in bare identifiers (e.g. `IPO_CONFIGURATIONS` rendered as `IPOCONFIGURATIONS`). The .docx was regenerated (content otherwise unchanged).

**Verified:** 67 tables parse as GFM tables with consistent column counts; 103 TOC links resolve to heading anchors; 10 images referenced and present.

## Still-open items
1. Confirm IPO code blocks and endpoint renames.
2. Confirm registry deviation for empty collections (and whether a registry-wide pass is wanted).
3. Confirm 1032 → 400 classification.
4. Inferred legacy outcomes to test: unknown ipoID → 1010; HTTP 200 transport everywhere; exchange status pass-through in queryNINBrokers.
5. getIPOConfigurations: keep FITNumber mandatory? Which adapter version is deployed (fitNumber / ISSUER_COMPANY_AR)?
6. Stored exchange value `ADX` vs `ADSM`; live DDL (PK/FK/unique, ID generation, CUTOFF_DATE type, RECEIVING_BANKS length, LIST_OF_VALUES types).
7. New business rules: IPO window/cut-off, amount min/max/multiple, config date sequence, delete guard, maker ≠ checker, default PO box 11111.
8. refundInterestRate type; vatAmount numeric (stored VARCHAR2).
9. queryNIN consumers in other packages.
10. ADX numberOfShares / PO box contract (F-12).
11. Operational: rotate the credentials exposed in queryNIN; review mail logs for F-06.
