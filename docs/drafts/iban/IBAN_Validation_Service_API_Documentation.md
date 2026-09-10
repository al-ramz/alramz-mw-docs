**AL RAMZ CAPITAL**
**MIDDLEWARE MIGRATION PROGRAMME**
# IBAN Validation Service
**API Specification — Spring Boot Implementation Guide**
*Software AG webMethods  →  Spring Boot 3.x / Java 21 Migration*

## Document Control

| **Attribute** | **Detail** |
| --- | --- |
| Document Title | IBAN Validation Service — API Specification |
| Service | **Validate IBAN** — `POST /validate` |
| Migration Target | Spring Boot 3.x / Java 21 |
| Document Version | 2.2 — Response Schema fully enumerates every field (including all `bankData` children) as a nested, depth-colored table instead of dot-notation summary text |
| Prior Version | 2.1 (2026-09-10) — `responseMessage` restricted to the standard HTTP reason phrase. 2.0 (2026-09-10) — target-contract rewrite (camelCase fields, condensed content). 1.0 (2026-09-09) — full source-analysis edition. See Implementation Notes (Section 6) for legacy defects carried over from v1.0. |

# Table of Contents

  - [Document Control](#document-control)
- [1. Overview](#1-overview)
  - [1.1 Purpose](#11-purpose)
- [2. API Contract](#2-api-contract)
  - [2.1 Endpoint](#21-endpoint)
  - [2.2 Request Schema](#22-request-schema)
  - [2.3 Response Schema](#23-response-schema)
    - [Sample — Success](#sample-success)
    - [Sample — Validation Error](#sample-validation-error)
- [3. Business & Validation Logic](#3-business-validation-logic)
  - [3.1 Validation Rules](#31-validation-rules)
- [4. External Dependency & Configuration](#4-external-dependency-configuration)
- [5. Status & Error Code Reference](#5-status-error-code-reference)
- [6. Implementation Notes](#6-implementation-notes)

# 1. Overview

## 1.1 Purpose

A single endpoint, `POST /validate`, that validates a customer-supplied IBAN against a third-party provider and returns the associated bank/branch details. This document specifies the target Spring Boot contract and the business rules the implementation must reproduce — it does not re-document the legacy webMethods internals in full; see the project's v1.0 edition of this doc if that detail is needed.

All request and response field names use **camelCase** (`iban`, `bankData`, `serviceErrorCode`, etc.), regardless of the casing used internally by the legacy system or the external provider.

# 2. API Contract

## 2.1 Endpoint

| **Attribute** | **Detail** |
| --- | --- |
| HTTP Method | `POST` |
| Path | `/validate` |
| Content Type | `application/json` |
| Authentication | Not enforced by the legacy service itself — confirm the gateway/API Manager policy layer in front of this endpoint. |

## 2.2 Request Schema

| **Field** | **Type** | **Required** | **Notes** |
| --- | --- | --- | --- |
| `iban` | string | Yes | The IBAN to validate, e.g. `AE070331234567890123456`. Trim whitespace before use. |

```json
{
  "iban": "AE070331234567890123456"
}
```

## 2.3 Response Schema

A single envelope shape is used for both success and error outcomes. Every field is listed below — including every field nested under `response` and under `response.bankData` — rather than summarized in prose. Rows are shaded by **nesting depth**: a field whose Type is **Document** is itself a nested object, and its children are the rows immediately below it at the next depth; every field at the same depth shares the same color, so the color alone shows which fields belong together.

| **Field** | **Type** | **Notes** |
| --- | --- | --- |
| `responseCode` | string | Target HTTP-style status as a string (`"200"`, `"400"`, `"422"`, `"502"`, `"503"`). |
| `responseMessage` | string | The **standard HTTP reason phrase** for `responseCode` only (`"OK"`, `"Bad Request"`, `"Unprocessable Entity"`, `"Bad Gateway"`, `"Service Unavailable"`) — never a business-specific error description. |
| **`response`** | ***Document*** | Wrapper object holding the domain payload (`bankData`) and the app-level error code (`serviceErrorCode`). Always present; its children are `null` depending on outcome. |
| `    ↳ serviceErrorCode` | string  | App-level error code (`IBV001`–`IBV010`, Section 5); `null` on success. |
| `  ↳ `**`bankData`** | ***Document*** | Bank/branch details on success; `null` on any error. Its own fields are listed below. |
| `        ↳ bic` | string | Bank Identifier Code (SWIFT/BIC). |
| `        ↳ branch` | string | Branch name. |
| `        ↳ bank` | string | Bank name. |
| `        ↳ address` | string | Branch street address. May be blank depending on provider/country. |
| `        ↳ city` | string | Branch city. |
| `        ↳ state` | string | Branch state/region. May be blank depending on provider/country. |
| `        ↳ zip` | string | Branch postal/ZIP code. May be blank depending on provider/country. |
| `        ↳ phone` | string | Branch contact phone number. May be blank depending on provider/country. |
| `        ↳ fax` | string | Branch fax number — legacy field, frequently blank. |
| `        ↳ www` | string | Bank/branch website URL. May be blank depending on provider/country. |
| `        ↳ email` | string | Branch contact email. May be blank depending on provider/country. |
| `        ↳ country` | string | Country name. |
| `        ↳ countryISO` | string | ISO 3166-1 alpha-2 country code. |
| `        ↳ countryISO3` | string | ISO 3166-1 alpha-3 country code — derived locally from `countryISO`, not returned by the provider directly. |
| `        ↳ account` | string | Local account number portion of the IBAN. |
| `        ↳ bankCode` | string | Bank code portion of the IBAN/routing. |
| `        ↳ branchCode` | string | Branch code portion of the IBAN/routing. May be blank depending on provider/country. |

> **Error detail is logged, not returned:**
>
> The API response never contains a business-specific error description (e.g. "IBAN length is not correct") — `responseMessage` is always the generic HTTP reason phrase. The specific reason should be written to the application log (keyed by `serviceErrorCode` and a request/correlation ID) so support staff can look it up after the fact; the caller only ever sees `responseCode` + `serviceErrorCode`.

### Sample — Success

```json
{
  "responseCode": "200",
  "responseMessage": "OK",
  "response": {
    "bankData": {
      "bic": "BOMLAEAD",
      "branch": "Main Branch",
      "bank": "Example Bank",
      "country": "United Arab Emirates",
      "countryISO": "AE",
      "countryISO3": "ARE",
      "account": "0331234567890123456",
      "bankCode": "033"
    },
    "serviceErrorCode": null
  }
}
```

### Sample — Validation Error

```json
{
  "responseCode": "400",
  "responseMessage": "Bad Request",
  "response": {
    "bankData": null,
    "serviceErrorCode": "IBV005"
  }
}
```

*The caller resolves the specific reason from *`serviceErrorCode`* (Section 5) if needed; the underlying business message ("IBAN length is not correct") is written to the server log, not returned here.*

*Sample values are illustrative — no real provider response was available in the source export.*

# 3. Business & Validation Logic

In order:

- 1. Reject a blank/missing `iban` — return `IBV007` / `400` (the legacy guard for this is dead code; the target must enforce it explicitly).
- 2. Trim the input, then call the external IBAN provider: `GET {baseUrl}?iban=..&api_key=..&format=json`.
- 3. Parse the response; resolve `countryISO3` from `countryISO` via a country-code lookup.
- 4. Run the validation chain below, short-circuiting on the first failing check.
- 5. If every check passes → `200` / `OK`, `bankData` populated, `serviceErrorCode: null`.
- 6. If the provider itself reports an error (invalid API key / no quota) → override with `IBV008`/`IBV009` regardless of the chain result above.
- 7. Any unhandled exception → `IBV010` / `503`.

## 3.1 Validation Rules

Each rule checks a field the provider returns; the "pass" value is provider-defined, not this service's own convention. "On Failure" below shows what's **returned** to the caller (status + `serviceErrorCode`) — the quoted text is the detail to write to the **log only** (see the callout in Section 2.3).

| **Check** | **Pass Value** | **On Failure (returned)** | **Logged Detail Only** |
| --- | --- | --- | --- |
| Characters | `006` | `IBV001` / 400 | "IBAN contains illegal characters" |
| Account check digit | `004` or `002` | `IBV002` / 400 | "Account number check digit not correct" |
| IBAN check digit | `001` | `IBV003` / 400 | "IBAN check digit not correct" |
| Structure | `005` | `IBV004` / 400 | "IBAN structure is not correct" |
| Length | `003` | `IBV005` / 400 | "IBAN length is not correct" |
| Country support | `007` | `IBV006` / 422 | "Country does not support the IBAN standard" |

*Note: the account check accepts two distinct provider values (*`004`*/*`002`*) with no documented semantic difference between them — confirm with the provider before deciding whether to preserve or collapse this in the target.*

# 4. External Dependency & Configuration

| **Name** | **Purpose** |
| --- | --- |
| `iban.provider.base-url` | Base URL of the external IBAN validation provider. |
| `iban.provider.api-key` | API key sent to the provider. Treat as a secret (Vault / Config Server), not a plain property. |

The service has no other runtime dependency (no database). Every request makes a live outbound call to the provider — no caching or fallback exists in the source system.

# 5. Status & Error Code Reference

The first three columns are what the API actually returns (`responseCode`, `responseMessage`, `response.serviceErrorCode`). The last column is written to the server log only, keyed by `serviceErrorCode` — it is never part of the response body (Section 2.3).

| **HTTP Status** | **responseMessage (returned)** | **serviceErrorCode** | **Logged Detail Only** |
| --- | --- | --- | --- |
| 200 | OK | *(null)* | — |
| 400 | Bad Request | IBV001 | IBAN contains illegal characters |
| 400 | Bad Request | IBV002 | Account number check digit not correct |
| 400 | Bad Request | IBV003 | IBAN check digit not correct |
| 400 | Bad Request | IBV004 | IBAN structure is not correct |
| 400 | Bad Request | IBV005 | IBAN length is not correct |
| 422 | Unprocessable Entity | IBV006 | Country does not support the IBAN standard |
| 400 | Bad Request | IBV007 | IBAN is missing/blank |
| 502 | Bad Gateway | IBV008 | Provider rejected the configured API key |
| 502 | Bad Gateway | IBV009 | Provider has no queries/quota remaining |
| 503 | Service Unavailable | IBV010 | Unhandled exception (generic internal error) |

# 6. Implementation Notes

Legacy-source gotchas worth knowing so they aren't silently reproduced in the target:

- The legacy `CATCH` block's `503` fallback is set with `OVERWRITE=false` behind a forced-set `1069` default at the top of the flow — in practice this means the generic error fallback never actually fires in the legacy system. Not applicable to the target design above (which always sets `serviceErrorCode`/`responseCode` explicitly per branch), but useful context if reconciling behavior against the legacy service during cutover testing.
- The legacy "missing IBAN" guard is effectively dead code — all real logic runs unconditionally. The target must add its own explicit `@NotBlank` validation (Section 3, step 1).
- The legacy system never populates its own `lastError` field on exception — server logs are the only diagnostic trail today. Recommend the target actually log/return exception detail via its `GlobalExceptionHandler`.
- No authentication is enforced by the legacy Flow itself — confirm the gateway/API Manager layer covers this before go-live.
- `responseMessage` must stay a fixed HTTP reason phrase — resist the temptation to swap in the business message for "better UX" during implementation; log the business detail instead (Section 2.3, Section 5's "Logged Detail Only" column) so it's still available for support without exposing internal validation logic to callers.
- Documentation convention (Section 2.3): nested schema fields are shaded by nesting depth, not by row index — a field of Type "Document" is itself a nested object, its children sit at the next depth and share one color, and this depth-based shading is the standard going forward for any nested request/response schema in this programme, not a one-off for IBAN.
