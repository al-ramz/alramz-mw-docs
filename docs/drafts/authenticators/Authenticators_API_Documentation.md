# Authenticators (EQUITEC) — Generate Token & Validate Token API Documentation

**AL RAMZ CAPITAL MIDDLEWARE MIGRATION PROGRAMME**
*Software AG to Spring Boot Migration Requirement Gathering* — Legacy webMethods Integration Server → Spring Boot 3.x / Java 21

## Contents

- [Document Control](#document-control)
- [1. Overview](#1-overview)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Conventions](#12-conventions)
  - [1.3 High-Level Flow](#13-high-level-flow)
- [2. Common Conventions](#2-common-conventions)
  - [2.1 Endpoint Details](#21-endpoint-details)
  - [2.2 Provider URL Resolution](#22-provider-url-resolution)
  - [2.3 Response Envelope](#23-response-envelope)
  - [2.4 Input Validation](#24-input-validation)
- [3. Generate Token API](#3-generate-token-api)
  - [3.1 Endpoint](#31-endpoint)
  - [3.2 Request Body](#32-request-body)
  - [3.3 Response Body](#33-response-body)
  - [3.4 Business Logic](#34-business-logic)
- [4. Validate Token API](#4-validate-token-api)
  - [4.1 Endpoint](#41-endpoint)
  - [4.2 Request Body](#42-request-body)
  - [4.3 Response Body](#43-response-body)
  - [4.4 Business Logic](#44-business-logic)
- [5. External Dependencies & Configuration](#5-external-dependencies--configuration)
  - [5.1 Downstream Services](#51-downstream-services)
  - [5.2 Configuration](#52-configuration)
- [6. Error / Response Code Reference](#6-error--response-code-reference)
- [7. Implementation Notes](#7-implementation-notes)
  - [7.1 Suggested Spring Boot Structure](#71-suggested-spring-boot-structure)

## Document Control

| Attribute | Detail |
|---|---|
| Document Title | Authenticators (EQUITEC) — API Specification |
| Services | **Generate Token** — `POST /equitec/generateToken`<br>**Validate Token** — `POST /equitec/validateToken` |
| Legacy Flow Services | `Authenticators.services.EQUITEC:generateToken`<br>`Authenticators.services.EQUITEC:validateToken` |
| Legacy REST Resource | `Authenticators.restAPI:Authenticators` (URL templates `/equitec/generateToken`, `/equitec/validateToken`, method `POST`) |
| Legacy Package | `Authenticators` v1.0 (package build 2025-11-19 10:07 GST, JVM 17) |
| Target Platform | Spring Boot 3.x / Java 21 |
| External Provider | EQUITEC token service (URLs from static data `EQUITEC_GENERATE_TOKEN_URL` / `EQUITEC_VALIDATE_TOKEN_URL`) |
| Shared Dependencies | `commonUtility` (GUID, static data, error throw), `commonValidator` (input validation), `SEQDatalust` (audit log) |
| Document Status | Draft — for implementation |
| Prepared | 29 September 2026 |

## 1. Overview

### 1.1 Purpose

The `Authenticators` package exposes two thin proxy APIs in front of the external **EQUITEC** token service:

- **Generate Token** — `POST /equitec/generateToken`: obtains an EQUITEC access token for a given `platform` and `clientName`, returning `accessToken` and `expiresIn`.
- **Validate Token** — `POST /equitec/validateToken`: validates an EQUITEC access token for a client id (`cid`) and returns the `redirectUrl` supplied by EQUITEC.

Both services follow the same pattern: initialise (timestamps, correlation ID, provider URL) → validate mandatory inputs → call EQUITEC → map the result to a common response envelope → audit-log asynchronously.

### 1.2 Conventions

- Field names are exactly as the legacy contract exposes them (camelCase). The Spring Boot DTOs must keep these JSON names on the wire.
- `responseCode` / `responseMessage` are **body-level business codes**. The legacy flows never set the HTTP status, so every outcome is returned with HTTP **200 OK** (see Sections 2.4, 3.4 and 6).
- Every response carries a `correlationID` — taken from the request if supplied, otherwise generated (GUID).
- "Legacy" = what the webMethods flow does today; "Target" = what the Spring Boot service must do.

### 1.3 High-Level Flow

```text
Client ──POST /equitec/generateToken {platform, clientName}──► Authenticators API
   1. Init: requestTimestamp (GMT+4), correlationID, url = static data EQUITEC_GENERATE_TOKEN_URL
   2. Validate platform, clientName (mandatory)            ──fail──► 1061
   3. POST {platform, clientName} to EQUITEC  (header x-Gateway-APIKey = global var EQUITEC_API_KEY)
   4. JSON + statusCode 200 ─► 200 {accessToken, expiresIn}   else ─► 500
   5. Finally: async audit log (SEQDatalust); return {correlationID, responseCode, responseMessage, response}

Client ──POST /equitec/validateToken {accessToken, cid}──► Authenticators API
   1. Init: requestTimestamp, correlationID, url = static data EQUITEC_VALIDATE_TOKEN_URL
   2. Validate accessToken, cid (mandatory)                ──fail──► 1061
   3. POST (no body) to EQUITEC  headers: Authorization: Bearer <accessToken>, cid: <cid>
   4. JSON + success=true ─► 200 {redirectUrl}   success≠true ─► 1008 <EQUITEC message>   non-JSON ─► 500
   5. Finally: async audit log; return envelope
```

## 2. Common Conventions

These conventions apply to both APIs.

### 2.1 Endpoint Details

| Attribute | Detail |
|---|---|
| HTTP Method | `POST` (both APIs) |
| Paths (Target) | `/equitec/generateToken`, `/equitec/validateToken` |
| Paths (Legacy) | REST resource `Authenticators`, URL templates `/equitec/generateToken` and `/equitec/validateToken` (URL-template REST resource, typically `/restv2/Authenticators/equitec/...` — confirm against IS / API Gateway) |
| Content Type | Request and response: `application/json` |
| Inbound Authentication | Not enforced by the flow services — confirm the API Gateway / IS ACL layer before go-live |
| Correlation | Optional `correlationID` (legacy reads it from the pipeline, i.e. a top-level JSON body field). Target: accept body field and/or `X-Correlation-ID` header; generate a UUID when blank |
| Timeouts | None configured on the outbound EQUITEC calls in legacy — target must set connect/read timeouts |

### 2.2 Provider URL Resolution

Legacy resolves each EQUITEC URL at runtime via `commonUtility.v2.services:getStaticData` (application `MIDDLEWARE`, keys `EQUITEC_GENERATE_TOKEN_URL` / `EQUITEC_VALIDATE_TOKEN_URL`) and uses `response.staticData[0].value`. In the target these become externalised configuration properties (Section 5). Current values: `https://token.equitec.in/api/Token/generate` (generate) and `https://uat.equitec.in/alramz_equitec/ResearchPortal/Account/ValidateToken` (validate).

### 2.3 Response Envelope

🟦 **Depth 0** — top-level fields  
🟨 **Depth 1** — children of `response`

| Depth | Field | Type | Notes |
|---|---|---|---|
| 🟦 0 | correlationID | String | Request value or generated GUID. Always present. |
| 🟦 0 | responseCode | String | `200`, `1061`, `1008` or `500` (Section 6). |
| 🟦 0 | responseMessage | String | Text paired with `responseCode`. |
| 🟦 0 | response | Document | API-specific payload (Sections 3.3 / 4.3). Omitted on error. |

> [!NOTE]
> **Null handling:** Legacy webMethods omits unset fields from the JSON instead of writing `null`. Use `@JsonInclude(JsonInclude.Include.NON_NULL)` on response DTOs to stay wire-compatible.

### 2.4 Input Validation

Both flows build an `inputList` of `{key, value, isOptional=N, isEmail=N, isDate=N, isNumeric=N, isMobileNumber=N}` entries and call `commonValidator.genericValidator:validateInputList`. If the validator does not return `responseCode = 200`, its `responseMessage` is thrown via `commonUtility.services:checkAndThrowError`. The catch block recognises messages containing `1061`, strips the `1061` prefix, and returns `responseCode = 1061` with the remaining text. In effect every input is a **mandatory, non-blank string** with no format checks.

> [!NOTE]
> **Confirm:** The exact validator messages live in the `commonValidator` package (not in this export). Confirm the message wording (e.g. "platform is mandatory") so the target can reproduce it.

## 3. Generate Token API

### 3.1 Endpoint

| Attribute | Detail |
|---|---|
| HTTP Method | `POST` |
| Path | `/equitec/generateToken` |
| Legacy Service | `Authenticators.services.EQUITEC:generateToken` |
| Content Type | `application/json` |

### 3.2 Request Body

🟦 **Depth 0** — top-level fields

| Depth | Field | Type | Required | Notes |
|---|---|---|---|---|
| 🟦 0 | platform | String | Yes | Calling platform identifier. Mandatory, non-blank. Forwarded to EQUITEC unchanged. |
| 🟦 0 | clientName | String | Yes | Client name. Mandatory, non-blank. Forwarded to EQUITEC unchanged. |
| 🟦 0 | correlationID | String | No | Not in the signature, but honoured if present in the body. |

#### Sample Request

```json
{
  "platform": "MOBILE",
  "clientName": "AlRamzApp"
}
```

### 3.3 Response Body

🟦 **Depth 0** — top-level fields  
🟨 **Depth 1** — children of `response`

| Depth | Field | Type | Notes |
|---|---|---|---|
| 🟦 0 | correlationID | String | Section 2.3. |
| 🟦 0 | responseCode | String | `200` on success; see Section 6. |
| 🟦 0 | responseMessage | String | `OK` on success. |
| 🟦 0 | response | Document | Present only on success. |
| 🟨 1 | ↳ accessToken | String | EQUITEC `data.accessToken`. |
| 🟨 1 | ↳ expiresIn | String | EQUITEC `data.expiresIn`, converted to string (legacy uses `pub.string:objectToString`; EQUITEC may return a number). |

#### Sample — Success (200)

```json
{
  "correlationID": "5b1d8c7e-2f3a-4e6b-9c0d-1a2b3c4d5e6f",
  "responseCode": "200",
  "responseMessage": "OK",
  "response": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "3600"
  }
}
```

#### Sample — Validation Error (1061)

```json
{
  "correlationID": "5b1d8c7e-2f3a-4e6b-9c0d-1a2b3c4d5e6f",
  "responseCode": "1061",
  "responseMessage": "<validator message, e.g. clientName is mandatory>"
}
```

#### Sample — Provider / Unexpected Error (500)

```json
{
  "correlationID": "5b1d8c7e-2f3a-4e6b-9c0d-1a2b3c4d5e6f",
  "responseCode": "500",
  "responseMessage": "Internal Server Error"
}
```

> [!NOTE]
> **Note:** Sample values are illustrative — no real EQUITEC response was available in the source export.

### 3.4 Business Logic

In order:

1. **Initialise.** `requestTimestamp` = now (`yyyy-MM-dd HH:mm:ss.SSS`, GMT+4). Serialise `{platform, clientName}` to JSON as `requestBody` (TRY); if serialisation fails, `requestBody = "{ }"` (CATCH). Generate a GUID `correlationID` if blank.
2. **Resolve URL** from static data key `EQUITEC_GENERATE_TOKEN_URL` (Section 2.2).
3. **Validate** `platform` and `clientName` as mandatory (Section 2.4). Failure → `1061`.
4. **Call EQUITEC:** HTTP `POST {url}` with headers `Content-Type: application/json` and `x-Gateway-APIKey: <EQUITEC_API_KEY>`; body = `requestBody` (`{"platform": …, "clientName": …}`). The response body is read as UTF-8 text.
5. **Map result:** if the response `Content-Type` is `application/json` (with or without `; charset=utf-8`, header name in either case), parse it. If the JSON field `statusCode` = `200` → `response.accessToken = data.accessToken`, `response.expiresIn = string(data.expiresIn)`, `200` / `OK`. Any other `statusCode` → `500` / `Internal Server Error`. Non-JSON content type → `500` / `Internal Server Error`.
6. **On exception** (catch): message containing `1061` → `1061` with the message minus the `1061` prefix; anything else → `500` / `Internal Server Error`.
7. **Finally** (always): call `SEQDatalust.services:asynchronousIngestion` with the pipeline (correlation ID, request/response bodies, timestamps); return only `correlationID`, `responseCode`, `responseMessage`, `response`.

#### EQUITEC Request / Response (Generate Token)

| Direction | Detail |
|---|---|
| Request headers | `Content-Type: application/json`<br>`x-Gateway-APIKey: ${equitec.api-key}` |
| Request body | `{"platform": "<platform>", "clientName": "<clientName>"}` |
| Response fields used | `statusCode` (JSON body, not HTTP status)<br>`data.accessToken`<br>`data.expiresIn` |

```text
// EQUITEC response (expected shape, illustrative)
{
  "statusCode": 200,
  "data": { "accessToken": "eyJhbGciOi...", "expiresIn": 3600 }
}
```

## 4. Validate Token API

### 4.1 Endpoint

| Attribute | Detail |
|---|---|
| HTTP Method | `POST` |
| Path | `/equitec/validateToken` |
| Legacy Service | `Authenticators.services.EQUITEC:validateToken` |
| Content Type | `application/json` |

### 4.2 Request Body

🟦 **Depth 0** — top-level fields

| Depth | Field | Type | Required | Notes |
|---|---|---|---|---|
| 🟦 0 | accessToken | String | Yes | EQUITEC access token (from Generate Token). Mandatory, non-blank. Sent to EQUITEC as `Authorization: Bearer <accessToken>`. **Masked (empty) in the audit log.** |
| 🟦 0 | cid | String | Yes | Client id. Mandatory, non-blank. Sent to EQUITEC as HTTP header `cid`. |
| 🟦 0 | correlationID | String | No | Not in the signature, but honoured if present in the body. |

#### Sample Request

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "cid": "100245"
}
```

### 4.3 Response Body

🟦 **Depth 0** — top-level fields  
🟨 **Depth 1** — children of `response`

| Depth | Field | Type | Notes |
|---|---|---|---|
| 🟦 0 | correlationID | String | Section 2.3. |
| 🟦 0 | responseCode | String | `200` on success; `1008` when EQUITEC rejects the token; see Section 6. |
| 🟦 0 | responseMessage | String | `OK` on success; EQUITEC `message` on `1008`. |
| 🟦 0 | response | Document | Present only on success. |
| 🟨 1 | ↳ redirectUrl | String | EQUITEC `redirectUrl`. |

#### Sample — Success (200)

```json
{
  "correlationID": "5b1d8c7e-2f3a-4e6b-9c0d-1a2b3c4d5e6f",
  "responseCode": "200",
  "responseMessage": "OK",
  "response": {
    "redirectUrl": "https://equitec.example.com/session/abc123"
  }
}
```

#### Sample — Token Rejected (1008)

```json
{
  "correlationID": "5b1d8c7e-2f3a-4e6b-9c0d-1a2b3c4d5e6f",
  "responseCode": "1008",
  "responseMessage": "<EQUITEC message, e.g. Invalid or expired token>"
}
```

### 4.4 Business Logic

In order:

1. **Initialise.** `requestTimestamp` = now (GMT+4). Serialise `{cid, accessToken: ""}` to JSON as `requestBody` — the token is deliberately blanked for logging (CATCH fallback `"{ }"`). Generate a GUID `correlationID` if blank.
2. **Resolve URL** from static data key `EQUITEC_VALIDATE_TOKEN_URL`.
3. **Validate** `accessToken` and `cid` as mandatory (Section 2.4). Failure → `1061`.
4. **Call EQUITEC:** HTTP `POST {url}` with **no body** and headers `Authorization: Bearer <accessToken>` and `cid: <cid>`. No API key header is sent on this call.
5. **Map result:** if the response is JSON (same content-type check as Generate Token): `success = true` → `response.redirectUrl = redirectUrl`, `200` / `OK`; any other value → `1008` with `responseMessage` = EQUITEC `message`. Non-JSON → `500` / `Internal Server Error`.
6. **On exception:** `1061` for validation errors, otherwise `500` / `Internal Server Error`.
7. **Finally:** asynchronous audit log; return only the envelope fields.

#### EQUITEC Request / Response (Validate Token)

| Direction | Detail |
|---|---|
| Request headers | `Authorization: Bearer <accessToken>`<br>`cid: <cid>` |
| Request body | None |
| Response fields used | `success` (boolean/string `true`)<br>`redirectUrl`<br>`message` |

```text
// EQUITEC response (expected shape, illustrative)
{ "success": true,  "redirectUrl": "https://equitec.example.com/session/abc123" }
{ "success": false, "message": "Invalid or expired token" }
```

## 5. External Dependencies & Configuration

### 5.1 Downstream Services

| Legacy Service | Purpose | Target Implementation |
|---|---|---|
| `pub.client:http` → EQUITEC | Generate / validate token | `EquitecClient` (RestClient / WebClient) with timeouts |
| `commonUtility.v2.services:getStaticData` | Resolve EQUITEC URLs (application `MIDDLEWARE`) | Configuration properties |
| `commonValidator.genericValidator:validateInputList` | Mandatory-field validation | Bean Validation `@NotBlank` |
| `commonUtility.services:checkAndThrowError` | Throw validation error | `GlobalExceptionHandler` → `1061` |
| `commonUtility.java:GenerateGUID` | Correlation ID | `UUID.randomUUID()` |
| `SEQDatalust.services:asynchronousIngestion` | Async audit log | Async audit publisher to Seq (with masking) |

### 5.2 Configuration

| Name | Purpose |
|---|---|
| `equitec.generate-token.url` | EQUITEC generate-token endpoint (legacy static data `EQUITEC_GENERATE_TOKEN_URL`) |
| `equitec.validate-token.url` | EQUITEC validate-token endpoint (legacy static data `EQUITEC_VALIDATE_TOKEN_URL`) |
| `equitec.api-key` | Sent as `x-Gateway-APIKey` on Generate Token (legacy secure global variable `EQUITEC_API_KEY`). **Secret** — Vault / Config Server |
| `equitec.connect-timeout` / `equitec.read-timeout` | Outbound timeouts (none in legacy — agree values) |
| `app.timezone` | `GMT+4` for audit timestamps |

## 6. Error / Response Code Reference

| responseCode | responseMessage | When | API | Legacy HTTP | Target HTTP (recommended) |
|---|---|---|---|---|---|
| 200 | OK | Success | Both | 200 | 200 OK |
| 1061 | <validator message> | Mandatory input missing / blank | Both | 200 | 400 Bad Request |
| 1008 | <EQUITEC message> | EQUITEC returned `success ≠ true` | Validate Token | 200 | 401 Unauthorized |
| 500 | Internal Server Error | EQUITEC `statusCode ≠ 200` (Generate), non-JSON response, URL lookup failure, connection error, any exception | Both | 200 | 502 Bad Gateway (provider) / 500 (internal) |

> [!NOTE]
> **Recommendation:** Decide with consumers whether to keep HTTP 200 for backward compatibility or adopt the target HTTP statuses. Either way, keep `responseCode` / `responseMessage` in the body unchanged.

## 7. Implementation Notes

Legacy-source gotchas worth knowing so they are not silently reproduced (or silently changed):

- **Provider status is read from the JSON body, not the HTTP status.** Generate Token checks `statusCode` in the JSON; Validate Token checks `success`. The HTTP status of the EQUITEC response is never inspected.
- **Content-type check is literal.** Only `application/json` and `application/json; charset=utf-8` (header `Content-Type` or `content-type`) are accepted; e.g. `application/json;charset=UTF-8` falls through to `500`. Target: use a tolerant media-type check.
- **Generate Token errors lose the provider message.** Any non-200 `statusCode` becomes a generic `500 Internal Server Error`; the EQUITEC error text is not returned or logged separately. Recommend logging it.
- **Validate Token `1008` message comes straight from EQUITEC** and may be null if EQUITEC omits `message`; the target should default it (e.g. "Token validation failed").
- **Secrets in the audit log.** Validate Token blanks `accessToken` in the logged request, but Generate Token's logged **response body contains the raw EQUITEC response, including the access token**. Mask `accessToken` in the target audit record.
- **API key handling.** `x-Gateway-APIKey` is read from the secure global variable `EQUITEC_API_KEY` on Generate Token only; Validate Token sends no API key. Keep the key in a secret store.
- **No timeouts** on the outbound HTTP calls and **no inbound authentication** in the flows — set client timeouts and confirm gateway security.
- **URL lookup failure is not checked.** If static data returns no URL, the HTTP call fails and the caller gets `500`. Target: fail fast at startup if the URL properties are missing.
- **`expiresIn` is returned as a string**, even if EQUITEC sends a number.
- **`correlationID`** is not in the signature but is honoured if present in the body; also accept `X-Correlation-ID` in the target.
- **Validation is presence-only** (no length/format rules); `1061` detection relies on the validator message containing `1061` — any other validator failure text would surface as `500`.

### 7.1 Suggested Spring Boot Structure

| Component | Responsibility |
|---|---|
| `EquitecAuthController` | `POST /equitec/generateToken`, `POST /equitec/validateToken`; `@Valid` DTOs; correlation ID |
| `GenerateTokenRequest` / `ValidateTokenRequest` | `@NotBlank` fields (Sections 3.2 / 4.2) |
| `AuthResponse<T>`, `TokenData`, `RedirectData` | Envelope + payload DTOs, `@JsonInclude(NON_NULL)` |
| `EquitecClient` | Outbound calls, headers, timeouts, tolerant JSON content-type handling |
| `EquitecAuthService` | Mapping rules (Sections 3.4 / 4.4) |
| `GlobalExceptionHandler` | `1061` for validation, `500` for unexpected errors |
| `AuditLogPublisher` | Async Seq ingestion with token masking |
