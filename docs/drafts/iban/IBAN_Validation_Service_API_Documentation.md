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



# Table of Contents

  - [Document Control](#document-control)
- [1. Overview](#1-overview)
  - [1.1 Purpose](#11-purpose)
- [2. API Contract](#2-api-contract)
  - [2.1 Endpoint](#21-endpoint)
  - [2.2 Request Body](#22-request-body)
  - [2.3 Response Body](#23-response-body)
    - [Sample — Success](#sample-success)
    - [Sample — Client Input Error](#sample-client-input-error)
    - [Sample — Backend/Provider Error](#sample-backendprovider-error)
  - [2.4 Response Headers — HTTP Status Codes](#24-response-headers-http-status-codes)
- [3. Business & Validation Logic](#3-business-validation-logic)
  - [3.1 Validation Rules](#31-validation-rules)
- [4. External Dependency & Configuration](#4-external-dependency-configuration)
- [5. Error Code Reference](#5-error-code-reference)
  - [5.1 Client Input Errors — errorCode/errorMsg returned](#51-client-input-errors-errorcodeerrormsg-returned)
  - [5.2 Backend / Provider Errors — errorCode/errorMsg left null](#52-backend-provider-errors-errorcodeerrormsg-left-null)
- [6. Implementation Notes](#6-implementation-notes)

# 1. Overview

## 1.1 Purpose

A single endpoint, `POST /validate`, that validates a customer-supplied IBAN against a third-party provider and returns the associated bank/branch details. This document specifies the target Spring Boot contract and the business rules the implementation must reproduce — it does not re-document the legacy webMethods internals in full; see the project's v1.0 edition of this doc if that detail is needed.

All request and response field names use **camelCase** (`iban`, `bankData`, `errorCode`, `errorMsg`, etc.), regardless of the casing used internally by the legacy system or the external provider.

`responseCode` and `responseMessage` always mirror the actual HTTP status code and reason phrase (Section 2.4) — they are a body-level echo of the header, not an independent value. `errorCode` and `errorMsg` carry the specific reason, but **only when the error is caused by the caller's own input** (`IBV001`–`IBV007`); for backend/provider failures (`IBV008`–`IBV010`) both are left `null` in the response, and the specific detail stays server-log-only .

# 2. API Contract

## 2.1 Endpoint

| **Attribute** | **Detail** |
| --- | --- |
| HTTP Method | `POST` |
| Path | `/validate` |
| Content Type | `application/json` |
| Authentication | Not enforced by the legacy service itself — confirm the gateway/API Manager policy layer in front of this endpoint. |

## 2.2 Request Body

| **Field** | **Type** | **Required** | **Notes** |
| --- | --- | --- | --- |
| `iban` | string | Yes | The IBAN to validate, e.g. `AE070331234567890123456`. Trim whitespace before use. |

```json
{
  "iban": "AE070331234567890123456"
}
```

## 2.3 Response Body

`responseCode`/`responseMessage` always mirror the real HTTP status/reason phrase (Section 2.4) — they exist in the body purely for convenience so callers don't have to inspect headers. `errorCode`/`errorMsg` carry the specific reason, but **only for client-input errors**; backend/provider errors leave both `null` (Section 5). Every field is listed below, including every field nested under `response.bankData`, rather than summarized in prose. Rows are shaded by **nesting depth**: a field whose Type is **Document** is itself a nested object, and its children are the rows immediately below it at the next depth; every field at the same depth shares the same color.

|  | Depth 0 — top-level fields |  | Depth 1 — children of \`response\` |  | Depth 2 — leaf fields of \`bankData\` (normal style) |
| --- | --- | --- | --- | --- | --- |

| **Field** | **Type** | **Notes** |
| --- | --- | --- |
| `responseCode` | string | Mirrors the actual HTTP status code returned in the header, as a string (`"200"`, `"400"`, `"422"`, `"502"`, `"503"`). Always present. |
| `responseMessage` | string | Mirrors the actual HTTP reason phrase (`"OK"`, `"Bad Request"`, `"Unprocessable Entity"`, `"Bad Gateway"`, `"Service Unavailable"`). Always present. |
| `errorCode` | string \| null | App-level error code, populated **only for client-input errors** (`IBV001`–`IBV007`, Section 5); `null` on success and `null` on backend/provider errors (`IBV008`–`IBV010`). |
| `errorMsg` | string \| null | Human-readable, business-specific description of a client-input error only (e.g. "IBAN length is not correct"); `null` on success and `null` on backend/provider errors — that detail stays server-log-only. |
| **`response`** | ***Document*** | Wrapper object holding the domain payload. Always present; `bankData` is `null` on any error. |
| `    ↳ `**`bankData`** | ***Document*** | Bank/branch details on success; `null` on any error. Its own fields are listed below. |
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

### Sample — Success

```json
{
  "responseCode": "200",
  "responseMessage": "OK",
  "errorCode": null,
  "errorMsg": null,
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
    }
  }
}
```

### Sample — Client Input Error

```json
{
  "responseCode": "400",
  "responseMessage": "Bad Request",
  "errorCode": "IBV005",
  "errorMsg": "IBAN length is not correct",
  "response": {
    "bankData": null
  }
}
```

*The caller can act on *`errorMsg`* directly, or branch on *`errorCode`* against Section 5's table.*

### Sample — Backend/Provider Error

```json
{
  "responseCode": "502",
  "responseMessage": "Bad Gateway",
  "errorCode": null,
  "errorMsg": null,
  "response": {
    "bankData": null
  }
}
```

`errorCode`*/*`errorMsg`* stay *`null`* here — the caller only learns "something went wrong upstream" via *`responseCode`*/*`responseMessage`*; the specific reason (e.g. which provider call failed and why) is server-log-only. See the callout above.*

*Sample values are illustrative — no real provider response was available in the source export.*

## 2.4 Response Headers — HTTP Status Codes

`responseCode`/`responseMessage` in the body (Section 2.3) always mirror the values below — implement them by reading the actual status the framework is about to send, not a separately-maintained value, so the two can never drift apart. Every status this service can return:

| **HTTP Status** | **Reason Phrase** | **Meaning** |
| --- | --- | --- |
| 200 | OK | Validation succeeded; `response.bankData` is populated, `errorCode`/`errorMsg` are `null`. |
| 400 | Bad Request | The supplied `iban` failed a client-fixable check (`IBV001`–`IBV005`, `IBV007`, Section 5). |
| 422 | Unprocessable Entity | The IBAN is well-formed but its country isn't supported by the provider (`IBV006`). |
| 502 | Bad Gateway | The upstream IBAN provider rejected the request or reported no remaining quota (`IBV008`/`IBV009`). |
| 503 | Service Unavailable | An unhandled internal exception occurred (`IBV010`). |

# 3. Business & Validation Logic

In order:

- 1. Reject a blank/missing `iban` — client-input error: set `responseCode`/`responseMessage` to `400`/"Bad Request", `errorCode: "IBV007"`, `errorMsg` to the specific reason (the legacy guard for this is dead code; the target must enforce it explicitly).
- 2. Trim the input, then call the external IBAN provider: `GET {baseUrl}?iban=..&api_key=..&format=json`.
- 3. Parse the response; resolve `countryISO3` from `countryISO` via a country-code lookup.
- 4. Run the validation chain below, short-circuiting on the first failing check — each failure is client-input, so `errorCode`/`errorMsg` are populated.
- 5. If every check passes → `responseCode`/`responseMessage`: `200`/"OK", `bankData` populated, `errorCode`/`errorMsg`: `null`.
- 6. If the provider itself reports an error (invalid API key / no quota) → this is a **backend** error: set `responseCode`/`responseMessage` to `502`/"Bad Gateway", but leave `errorCode`/`errorMsg` `null` — log the specific reason (`IBV008`/`IBV009`, Section 5) internally only, regardless of the chain result above.
- 7. Any unhandled exception → backend error: `responseCode`/`responseMessage`: `503`/"Service Unavailable", `errorCode`/`errorMsg`: `null`; log `IBV010` internally.

## 3.1 Validation Rules

Each rule checks a field the provider returns; the "pass" value is provider-defined, not this service's own convention. Every row below is a client-input failure, so both `errorCode` and `errorMsg` are populated in the response for each (Section 2.3) — this differs from backend/provider failures (Section 5), which leave `errorCode`/`errorMsg` as `null`.

| **Check** | **Pass Value** | **On Failure — errorCode / HTTP Status** | **errorMsg (returned)** |
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

# 5. Error Code Reference

Every error this service can produce falls into exactly one of two categories, and the category determines whether `errorCode`/`errorMsg` are populated in the body (Section 2.3) or left `null`. `responseCode`/`responseMessage` are always populated in both cases, mirroring the HTTP status (Section 2.4). Success (`200`) is covered in Section 2.4 and not repeated here.

## 5.1 Client Input Errors — errorCode/errorMsg returned

Caused by the caller's own IBAN; the specific reason is safe to return since it describes only the submitted input.

| **errorCode** | **responseCode / responseMessage** | **errorMsg (returned)** |
| --- | --- | --- |
| IBV001 | 400 / Bad Request | IBAN contains illegal characters |
| IBV002 | 400 / Bad Request | Account number check digit not correct |
| IBV003 | 400 / Bad Request | IBAN check digit not correct |
| IBV004 | 400 / Bad Request | IBAN structure is not correct |
| IBV005 | 400 / Bad Request | IBAN length is not correct |
| IBV006 | 422 / Unprocessable Entity | Country does not support the IBAN standard |
| IBV007 | 400 / Bad Request | IBAN is missing/blank |

## 5.2 Backend / Provider Errors — errorCode/errorMsg left null

Caused by this service's own infrastructure or its upstream provider, not the caller's input — never surfaced via `errorCode`/`errorMsg`; the detail in the last column is written to the server log only, keyed by a correlation/request ID.

| **errorCode (internal)** | **responseCode / responseMessage** | **Logged Detail Only — never returned** |
| --- | --- | --- |
| IBV008 | 502 / Bad Gateway | Provider rejected the configured API key |
| IBV009 | 502 / Bad Gateway | Provider has no queries/quota remaining |
| IBV010 | 503 / Service Unavailable | Unhandled exception (generic internal error) |

*The "errorCode" column here (*`IBV008`*–*`IBV010`*) is an internal log key only — it is never present in the *`errorCode`* response field, which stays *`null`* for these three.*

# 6. Implementation Notes

Legacy-source gotchas worth knowing so they aren't silently reproduced in the target:

- The legacy `CATCH` block's `503` fallback is set with `OVERWRITE=false` behind a forced-set `1069` default at the top of the flow — in practice this means the generic error fallback never actually fires in the legacy system. Not applicable to the target design above (which always sets `responseCode`/`responseMessage` explicitly per branch), but useful context if reconciling behavior against the legacy service during cutover testing.
- The legacy "missing IBAN" guard is effectively dead code — all real logic runs unconditionally. The target must add its own explicit `@NotBlank` validation (Section 3, step 1).
- The legacy system never populates its own `lastError` field on exception — server logs are the only diagnostic trail today. Recommend the target actually log/return exception detail via its `GlobalExceptionHandler`.
- No authentication is enforced by the legacy Flow itself — confirm the gateway/API Manager layer covers this before go-live.
- `responseCode`/`responseMessage` (v4.0) must always be set from the same status value the framework actually returns in the HTTP header — implement them by reading the real status right before responding, not from a separately-maintained field, so the body and the header can never drift apart.
- `errorCode`/`errorMsg` (v4.0) are populated **only** for the client-input codes `IBV001`–`IBV007` (Section 5.1); for the backend/provider codes `IBV008`–`IBV010` (Section 5.2) both must be left `null` in the response even though the code is still used as an internal log key — take care in the exception-handling/mapping layer not to let the backend codes leak into the same field that serves the client-input codes.
- Documentation convention (Section 2.3): nested schema fields are shaded by nesting depth, not by row index — a field of Type "Document" is itself a nested object, its children sit at the next depth and share one color, and this depth-based shading is the standard going forward for any nested request/response body table in this programme, not a one-off for IBAN.
