# Market Onboarding Service — API Documentation

**AL RAMZ CAPITAL MIDDLEWARE MIGRATION PROGRAMME**
*Software AG to Spring Boot Migration Requirement Gathering* — Legacy webMethods Integration Server → Spring Boot 3.x / Java 21

## Contents

- [Document Control](#document-control)
- [1. Overview](#1-overview)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Conventions](#12-conventions)
  - [1.3 High-Level Flow](#13-high-level-flow)
- [2. API Contract](#2-api-contract)
  - [2.1 Endpoint Details](#21-endpoint-details)
  - [2.2 Request Body](#22-request-body)
  - [2.3 Response Body](#23-response-body)
  - [2.4 Response Codes & HTTP Status](#24-response-codes--http-status)
- [3. Business & Validation Logic](#3-business--validation-logic)
  - [3.1 Validation Rules](#31-validation-rules)
  - [3.2 Data Preparation & Derived Fields](#32-data-preparation--derived-fields)
  - [3.3 Processing Flow](#33-processing-flow)
  - [3.4 Per-Market Outcome Rules](#34-per-market-outcome-rules)
  - [3.5 Overall Response Code Determination](#35-overall-response-code-determination)
- [4. External Dependencies & Configuration](#4-external-dependencies--configuration)
  - [4.1 Downstream Services](#41-downstream-services)
  - [4.2 Field Mapping — DFM NINOnboarding](#42-field-mapping--dfm-ninonboarding)
  - [4.3 Field Mapping — ADX NINCreation](#43-field-mapping--adx-nincreation)
  - [4.4 Field Mapping — ADX Account Creation](#44-field-mapping--adx-account-creation)
  - [4.5 Reference-Data Lookups (FIT DB)](#45-reference-data-lookups-fit-db)
  - [4.6 Audit Logging](#46-audit-logging)
  - [4.7 Configuration](#47-configuration)
- [5. Error Code Reference](#5-error-code-reference)
  - [5.1 Service-Level Codes](#51-service-level-codes)
  - [5.2 Market-Level Status Messages](#52-market-level-status-messages)
- [6. Implementation Notes](#6-implementation-notes)
  - [6.1 Suggested Spring Boot Structure](#61-suggested-spring-boot-structure)

## Document Control

| Attribute | Detail |
|---|---|
| Document Title | Market Onboarding Service — API Specification |
| Service | **Market Onboarding** — `POST /marketOnboarding` |
| Legacy Flow Service | `CRM.services.marketOnboarding:onBoarding` |
| Legacy REST Resource | `CRM.restAPI:crm` (URL template `/marketOnboarding`, method `POST`) |
| Request Document Type | `CRM.documents:marketOnboardingRequest` |
| Legacy Package | `CRM` v1.0 (package build 2026-04-28 15:10 GST, JVM 17) |
| Target Platform | Spring Boot 3.x / Java 21 |
| Downstream Systems | DFM (Dubai Financial Market), ADX / ADSM (Abu Dhabi Securities Exchange), FIT reference data DB, Seq/Datalust audit log |
| Document Status | Draft — for implementation |
| Prepared | 23 September 2026 |

## 1. Overview

### 1.1 Purpose

This API onboards an individual investor onto one or both UAE stock exchanges in a single call. For each requested market it creates the investor number (NIN) and then the trading account(s) selected in `portfolioOptions` (cash and/or margin):

- **DFM** — one call to the DFM integration (`DFMIntegrations.v2.services:NINOnboarding`) returns the NIN and the cash/margin trading numbers together.
- **ADSM (ADX)** — a NIN creation call (`ADXIntegrations.v2.services:NINCreation`), followed by one call per account type: `tradingAccountCreation` (cash) and `marginAccountCreation` (margin).

The API returns one result entry per market × account type, with the status of each, plus an overall `responseCode` that reports full success, partial success or total failure.

### 1.2 Conventions

- Field names are shown exactly as the legacy contract exposes them (mixed case, e.g. `tradingaccountnumber`, `TIN`). The Spring Boot implementation must keep these JSON names on the wire (use `@JsonProperty` where Java naming differs) so existing consumers are not broken.
- `responseCode` / `responseMessage` are **body-level business codes**. In the legacy service the HTTP status is always `200 OK` regardless of outcome (see Section 2.4 and Section 6).
- Every response carries a `correlationID` — taken from the request if supplied, otherwise generated (GUID).
- "Legacy" describes what the webMethods flow does today; "Target" describes what the Spring Boot service must do. Where they differ it is called out explicitly.

### 1.3 High-Level Flow

```text
Client ──POST /marketOnboarding──► Market Onboarding API
   1. Init: requestTimestamp, correlationID (generate if blank)
   2. Validate request against schema  ──fail──► responseCode 1069
   3. Prepare data (IBAN routing, EID clean-up, CRS list, defaults,
      ISO3→ISO2 + city-name lookups on FIT DB, DOB formats, market list)
   4. For market DFM  ─► DFM NINOnboarding ─► NIN + cash/margin numbers
   5. For market ADSM ─► ADX NINCreation ─► NIN
                        ├─ cash   ─► ADX tradingAccountCreation
                        └─ margin ─► ADX marginAccountCreation
   6. Derive overall code: 200 | 1070 | 1071   (exception ─► 500)
   7. Finally: async audit log to Seq/Datalust; return
      { correlationID, responseCode, responseMessage, response[] }
```

## 2. API Contract

### 2.1 Endpoint Details

| Attribute | Detail |
|---|---|
| HTTP Method | `POST` |
| Path (Target) | `/marketOnboarding` |
| Path (Legacy) | REST resource `crm`, URL template `/marketOnboarding` on Integration Server (URL-template REST resource, typically `/restv2/crm/marketOnboarding` — confirm against the IS/API Gateway configuration) |
| Content Type | Request: `application/json`   Response: `application/json` |
| Authentication | Not enforced by the flow service itself — confirm API Gateway / IS ACL layer before go-live |
| Correlation | Optional `correlationID` string (legacy reads it from the pipeline — i.e. a top-level JSON body field). Target: accept body field and/or `X-Correlation-ID` header; generate a UUID when blank |
| Idempotency | None. Re-submitting creates new downstream requests (see Section 6) |
| Timeouts | No explicit timeout configured on any step in the legacy flow |

### 2.2 Request Body

Validated against `CRM.documents:marketOnboardingRequest`. "Required" means the field must be present; length / pattern rules are listed in Section 3.1. All scalar values are strings.

🟦 **Depth 0** — top-level fields  
🟨 **Depth 1** — children of an array of Documents (`markets[]`, `csr[]`)

| Depth | Field | Type | Required | Notes |
|---|---|---|---|---|
| 🟦 0 | correlationID | String | No | Not in the document type, but read from the pipeline if sent. Echoed in response; GUID generated when blank. |
| 🟦 0 | fullnameEnglish | String | Yes | Min length 1. → DFM `cust_engfullname`, ADX `investornameenglish`. |
| 🟦 0 | fullnameArabic | String | Yes | Min length 1. → DFM `cust_arfullname`, ADX `investorname` and `shareholdername`. |
| 🟦 0 | firstname | String | No | Min length 1 if present. → DFM `cust_firstname`. |
| 🟦 0 | lastname | String | Yes | Min length 1. → DFM `cust_lastname`. |
| 🟦 0 | email | String | Yes | Email pattern; multiple addresses may be separated by `;`. → DFM `cust_email`, ADX `email`. |
| 🟦 0 | mobileNumber | String | Yes | Min length 1, e.g. `+971501234567`. DFM receives `+`→`00`; ADX receives it unchanged. |
| 🟦 0 | telephoneNumber | String | No | Accepted but **not forwarded** anywhere (ADX `telephonenumber` is populated from `mobileNumber`). |
| 🟦 0 | swiftCode | String | No | Bank SWIFT/BIC. → ADX `bankcode`; DFM `pay_frn_swift` (only for non-AE IBANs). |
| 🟦 0 | ibanNumber | String | No | Trimmed and all spaces removed before use. Routed to DFM `pay_aed_iban` or `pay_frn_iban` (Section 3.2). → ADX `iban`. |
| 🟦 0 | emiratesId | String | No* | Max length 18 (e.g. `784-1990-1234567-1`). *Mandatory in practice for ADSM — without it ADX onboarding is skipped and reported FAILED. |
| 🟦 0 | emiratesIdExpiryDate | String | No | Empty or `yyyy-MM-dd`, max length 10. → DFM `eid_expirydate`. |
| 🟦 0 | eidAttachmentFront | String | No | Base64 image. → DFM `eid_attachment_front`. Excluded from audit log. |
| 🟦 0 | eidAttachmentBack | String | No | Base64 image. → DFM `eid_attachment_back`. Excluded from audit log. |
| 🟦 0 | passportNumber | String | Yes | → DFM `pp_no`, ADX `passportnumber`. |
| 🟦 0 | passportExpiryDate | String | No | `yyyy-MM-dd`, length 10 when present. → DFM `pp_expirydate`. |
| 🟦 0 | passportAttachmentType | String | No | Defaults to `JPG` when blank. → DFM `pp_attachment_type`. |
| 🟦 0 | passportAttachment | String | No | Base64 image. → DFM `pp_attachment`. Excluded from audit log. |
| 🟦 0 | routeCode | String | No | Max length 20. → DFM `pay_routecode`. |
| 🟦 0 | gender | String | Yes | Exactly `M` or `F`. → DFM `cust_gender`, ADX `gender`. |
| 🟦 0 | dateOfBirth | String | Yes | `yyyy-MM-dd`. DFM receives as-is; ADX receives `yyyyMMdd`. |
| 🟦 0 | nationality | String | Yes | ISO 3166 alpha-3 (length 3). DFM receives ISO-2 (lookup); ADX `citizenship` receives the ISO-3 value. |
| 🟦 0 | address | String | Yes | → DFM `adr_address`, ADX `address1`. |
| 🟦 0 | city | String | Yes | Numeric FIT city code (pattern `\d+`). DFM receives the English city name (lookup); ADX `city` receives the code. |
| 🟦 0 | countryCode | String | Yes | Address country, ISO alpha-3 (length 3). DFM `adr_country` receives ISO-2; ADX `country` receives ISO-3. |
| 🟦 0 | poBox | String | Yes | → DFM `adr_pobox`, ADX `postalcode`. |
| 🟦 0 | familyId | String | No | Accepted but **not forwarded** (ADX `familyid` is hard-set to empty). |
| 🟦 0 | payPrintname | String | No | Accepted but **not forwarded** (DFM `pay_printname` is never set). |
| 🟦 0 | portfolioOptions | String | No | Comma-separated list of `cash` and/or `margin`. Default `cash, margin`. **Drives which trading accounts are created.** |
| 🟦 0 | paymentMethod | String | No | Default `bank`. → DFM `pay_method`. |
| 🟦 0 | custSignatureImageType | String | No | Default `JPG`. → DFM `cust_signatureimage_type`. |
| 🟦 0 | custSignatureImage | String | No | Base64 image. Validated but **not forwarded** (DFM `cust_signatureimage` is never set). Excluded from audit log. |
| 🟦 0 | userCode | String | No | Digits only. Accepted/logged, not forwarded. |
| 🟦 0 | fitNumber | String | No | Digits only. Accepted/logged, not forwarded. |
| 🟦 0 | markets | Document[] | Yes | Markets to onboard. Only `marketShortname` values `DFM` and `ADSM` are processed (case-sensitive). Duplicates are collapsed. |
| 🟨 1 | ↳ accountType | String | Yes | `normal`/`NORMAL` or `margin`/`MARGIN`. Collected but **not used** downstream — account creation is driven by `portfolioOptions`. |
| 🟨 1 | ↳ accountNumber | String | Yes | Collected but **not used** downstream. |
| 🟨 1 | ↳ marketShortname | String | Yes | `DFM` or `ADSM`. |
| 🟦 0 | csr | Document[] | No | CRS (Common Reporting Standard) tax residencies. Sent to DFM only. |
| 🟨 1 | ↳ country | String | Yes | ISO alpha-3; converted to ISO-2 → `csr_country`. |
| 🟨 1 | ↳ TIN | String | No | Tax ID. Present → `csr_havetin`=`1`, else `2`. → `csr_tin`. |
| 🟨 1 | ↳ reasonForNoTIN | String | No | `A`, `B` or `C` (see Section 3.2). → `csr_notinreason` and descriptive `csr_whynotinissued`. |
| 🟨 1 | ↳ reasonBDetails | String | No | Accepted but **not forwarded**. |

#### Sample Request

```json
{
  "correlationID": "9f1c2a4e-5b7d-4c1e-9a0b-3d2f6e8a1c55",
  "fullnameEnglish": "Ahmed Ali Hassan",
  "fullnameArabic": "أحمد علي حسن",
  "firstname": "Ahmed",
  "lastname": "Hassan",
  "email": "ahmed.hassan@example.com",
  "mobileNumber": "+971501234567",
  "swiftCode": "EBILAEAD",
  "ibanNumber": "AE07 0331 2345 6789 0123 456",
  "emiratesId": "784-1990-1234567-1",
  "emiratesIdExpiryDate": "2028-05-31",
  "eidAttachmentFront": "<base64>",
  "eidAttachmentBack": "<base64>",
  "passportNumber": "N1234567",
  "passportExpiryDate": "2030-01-15",
  "passportAttachmentType": "JPG",
  "passportAttachment": "<base64>",
  "gender": "M",
  "dateOfBirth": "1990-04-12",
  "nationality": "ARE",
  "address": "Villa 12, Street 5, Al Barsha",
  "city": "1",
  "countryCode": "ARE",
  "poBox": "12345",
  "portfolioOptions": "cash, margin",
  "paymentMethod": "bank",
  "markets": [
    { "accountType": "normal", "accountNumber": "", "marketShortname": "DFM" },
    { "accountType": "normal", "accountNumber": "", "marketShortname": "ADSM" }
  ],
  "csr": [ { "country": "ARE", "TIN": "", "reasonForNoTIN": "A" } ]
}
```

> [!NOTE]
> **Note:** Sample values are illustrative. `city` is a FIT city code, not a name.

### 2.3 Response Body

Rows are shaded by **nesting depth**: a field whose Type is Document is itself a nested object, and its children are the rows immediately below it at the next depth.

🟦 **Depth 0** — top-level fields  
🟨 **Depth 1** — fields of each `response[]` entry

| Depth | Field | Type | Notes |
|---|---|---|---|
| 🟦 0 | correlationID | String | Request value or generated GUID. |
| 🟦 0 | responseCode | String | Business result code: `200`, `1069`, `1070`, `1071`, `500` (Section 2.4 / 5.1). May be absent in the edge cases listed in Section 6. |
| 🟦 0 | responseMessage | String | Text matching `responseCode`. |
| 🟦 0 | response | Document[] | One entry per market × account type processed. Omitted when nothing was processed (e.g. validation error). |
| 🟨 1 | ↳ marketShortname | String | `DFM` or `ADSM`. |
| 🟨 1 | ↳ tradingaccountnumber | String | Cash or margin trading account number. Only present on `SUCCESS`. |
| 🟨 1 | ↳ nin | String | Investor number issued by the exchange. Present whenever the NIN was created (even if the account step failed). |
| 🟨 1 | ↳ accountType | String | `normal` (cash) or `margin`. Absent on NIN-level / exception failures. |
| 🟨 1 | ↳ status | String | `SUCCESS` or `FAILED`. |
| 🟨 1 | ↳ statusMessage | String | On success: downstream NIN response message. On failure: reason (Section 5.2). |

> [!NOTE]
> **Null handling:** Legacy webMethods omits unset fields from the JSON rather than writing `null`. Target should use `@JsonInclude(JsonInclude.Include.NON_NULL)` on the response DTOs to stay wire-compatible.

#### Sample — Full Success (responseCode 200)

```json
{
  "correlationID": "9f1c2a4e-5b7d-4c1e-9a0b-3d2f6e8a1c55",
  "responseCode": "200",
  "responseMessage": "OK",
  "response": [
    { "marketShortname": "DFM",  "tradingaccountnumber": "1100234567", "nin": "88776655",
      "accountType": "normal", "status": "SUCCESS", "statusMessage": "Created" },
    { "marketShortname": "DFM",  "tradingaccountnumber": "1100234568", "nin": "88776655",
      "accountType": "margin", "status": "SUCCESS", "statusMessage": "Created" },
    { "marketShortname": "ADSM", "tradingaccountnumber": "200145678",  "nin": "7001234",
      "accountType": "normal", "status": "SUCCESS", "statusMessage": "OK" },
    { "marketShortname": "ADSM", "tradingaccountnumber": "300145678",  "nin": "7001234",
      "accountType": "margin", "status": "SUCCESS", "statusMessage": "OK" }
  ]
}
```

#### Sample — Partial Success (responseCode 1071)

```json
{
  "correlationID": "9f1c2a4e-5b7d-4c1e-9a0b-3d2f6e8a1c55",
  "responseCode": "1071",
  "responseMessage": "Some operations were completed successfully, while others encountered errors",
  "response": [
    { "marketShortname": "DFM", "tradingaccountnumber": "1100234567", "nin": "88776655",
      "accountType": "normal", "status": "SUCCESS", "statusMessage": "Created" },
    { "marketShortname": "ADSM", "status": "FAILED",
      "statusMessage": "Error ADX NIN was not created since customer is a non-UAE Resident. Please proceed with generating the nin manually." }
  ]
}
```

#### Sample — All Failed (responseCode 1070)

```json
{
  "correlationID": "9f1c2a4e-5b7d-4c1e-9a0b-3d2f6e8a1c55",
  "responseCode": "1070",
  "responseMessage": "All operations encountered errors",
  "response": [
    { "marketShortname": "DFM", "status": "FAILED", "statusMessage": "Error 400 - <DFM responseMessage>" }
  ]
}
```

#### Sample — Validation Error (responseCode 1069)

```json
{
  "correlationID": "9f1c2a4e-5b7d-4c1e-9a0b-3d2f6e8a1c55",
  "responseCode": "1069",
  "responseMessage": "Middleware system validation error :  /gender<validator error text>"
}
```

#### Sample — Unhandled Exception (responseCode 500)

```json
{
  "correlationID": "9f1c2a4e-5b7d-4c1e-9a0b-3d2f6e8a1c55",
  "responseCode": "500",
  "responseMessage": "Internal Server Error",
  "response": [
    { "marketShortname": "ADSM", "status": "FAILED", "statusMessage": "Error - <exception message>" }
  ]
}
```

### 2.4 Response Codes & HTTP Status

The legacy flow never calls `pub.flow:setResponseCode`, so every outcome — including validation errors and exceptions — is returned with HTTP **200 OK**; consumers read `responseCode` in the body. The target column is the recommended mapping; the programme must confirm with consumers whether to keep HTTP 200 for backward compatibility.

| responseCode | responseMessage | Meaning | Legacy HTTP | Target HTTP (recommended) |
|---|---|---|---|---|
| 200 | OK | Every requested market onboarded; all requested account types created | 200 | 200 OK |
| 1071 | Some operations were completed successfully, while others encountered errors | Both DFM and ADSM requested; exactly one succeeded | 200 | 207 Multi-Status or 200 (confirm) |
| 1070 | All operations encountered errors | Every requested market failed | 200 | 502 Bad Gateway or 200 (confirm) |
| 1069 | Middleware system validation error : <path><message> | Request failed schema validation (first error only) | 200 | 400 Bad Request |
| 500 | Internal Server Error | Unhandled exception during processing | 200 | 500 Internal Server Error |

## 3. Business & Validation Logic

### 3.1 Validation Rules

Legacy uses `pub.schema:validate` against the document type. Whitespace facet is "collapse" on the constrained string fields (leading/trailing whitespace trimmed and internal runs collapsed before checking). Validation stops the flow and returns `1069` with only the **first** error (`errors[0].pathName` + `errors[0].errorMessage`).

| Field | Rule | Suggested Bean Validation |
|---|---|---|
| fullnameEnglish, fullnameArabic, lastname, email, mobileNumber | Required, min length 1 | `@NotBlank` |
| firstname | Optional; min length 1 if present | `@Size(min = 1)` |
| passportNumber, address, poBox, markets | Required (presence) | `@NotNull` (`@NotEmpty` for `markets`) |
| email | Pattern `^(?:[a-zA-Z0-9_'^&/+-]+(?:\.[a-zA-Z0-9_'^&/+-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(?:\s*;\s*(…same…))*$` | `@Pattern` |
| gender | Length 1, pattern `M\|F` | `@Pattern(regexp = "M\|F")` |
| dateOfBirth | Length 10, `yyyy-MM-dd` with month/day ranges (Feb ≤ 29) | `@Pattern` + parse as `LocalDate` |
| passportExpiryDate | Optional; length 10, `yyyy-MM-dd` | `@Pattern` |
| emiratesIdExpiryDate | Optional; empty or `yyyy-MM-dd`, max length 10 | `@Pattern(regexp = "^$\|…")` |
| emiratesId | Optional; max length 18 | `@Size(max = 18)` |
| routeCode | Optional; max length 20 | `@Size(max = 20)` |
| nationality, countryCode | Required; length exactly 3 (ISO alpha-3) | `@NotNull @Size(min = 3, max = 3)` |
| city | Required; digits only `\d+` | `@Pattern(regexp = "\\d+")` |
| userCode, fitNumber | Optional; digits only | `@Pattern(regexp = "\\d+")` |
| markets[].accountType / accountNumber / marketShortname | Required (presence) in each entry | `@Valid` + `@NotNull` |
| csr[].country | Required when a `csr` entry is present | `@Valid` + `@NotNull` |

### 3.2 Data Preparation & Derived Fields

| Derived Value | Source | Rule | Used By |
|---|---|---|---|
| requestTimestamp / responseTimestamp | System clock | Pattern `yyyy-MM-dd HH:mm:ss.SSS`, timezone `GMT+4` | Audit log |
| correlationID | Request | Keep if non-blank; else generate GUID | All calls, response |
| mobileNumber00CCode | mobileNumber | Replace `+` with `00` | DFM `cust_mobile` |
| ibanNumber (normalised) | ibanNumber | Trim, then remove all spaces | DFM, ADX |
| pay_aed_iban | ibanNumber | If normalised IBAN **contains** `AE` anywhere | DFM |
| pay_frn_iban / pay_frn_swift | ibanNumber / swiftCode | If normalised IBAN does not contain `AE` | DFM |
| eid_noINTEGER | emiratesId | Remove all `-` | ADX `primaryidnumber`, `adxreferencenumber`, `emiratesid` |
| DFMCRS[] (csr_countries) | csr[] | Per entry: `csr_tin`=TIN; `csr_havetin`=`1` if TIN non-blank else `2`; `csr_notinreason`=reasonForNoTIN; `csr_whynotinissued`: A→"Country does not issue TIN", B→"Investor not able to get TIN", C→"No TIN required" (only when TIN blank); `csr_country`=ISO-2 of country | DFM `csr.csr_countries` |
| cust_signatureimage_type | custSignatureImageType | Default `JPG` | DFM |
| pp_attachment_type | passportAttachmentType | Default `JPG` | DFM |
| pay_method | paymentMethod | Default `bank` | DFM |
| portfolio_options | portfolioOptions | Default `cash, margin` | DFM (raw string) |
| portfolio_options_list | portfolio_options | Split on `,`, trim each value | Account loop (`cash` / `margin`) |
| nationalityISO2 | nationality | FIT lookup ISO-3 → ISO-2 (`getISO2CountryCode`) | DFM `cust_nationality` |
| addressCountryISO2 | countryCode | FIT lookup ISO-3 → ISO-2 | DFM `adr_country` |
| addressCityName | city | FIT lookup city code → English name (`getCityName`) | DFM `adr_city` |
| dateOfBirthyyyyMMdd | dateOfBirth | `yyyy-MM-dd` → `yyyyMMdd` | ADX `birthdate` |
| marketList | markets[].marketShortname | Distinct list, first-seen order | Market loops |

### 3.3 Processing Flow

In order:

1. **Initialise.** Capture `requestTimestamp` (GMT+4). Serialise the request to JSON for the audit log, **excluding** `eidAttachmentFront`, `eidAttachmentBack`, `passportAttachment` and `custSignatureImage`. If `correlationID` is blank, generate a GUID.
2. **Validate** the request (Section 3.1). On failure → `responseCode` `1069`, `responseMessage` "Middleware system validation error : " + first error path + message; no downstream calls; go to step 8.
3. **Prepare data** (Section 3.2), including the FIT DB lookups for nationality, address country, CRS countries and city.
4. **Onboard DFM** (if `DFM` is in `marketList`): set `dfmOnboardingRequested = Y`; call DFM `NINOnboarding` once (mapping Section 4.2). Evaluate per Section 3.4.
5. **Onboard ADSM** (if `ADSM` is in `marketList`): set `adsmOnboardingRequested = Y`. If `emiratesId` is blank → append a FAILED entry (non-UAE resident message), `adsmOnboarded = N`. Otherwise call ADX `NINCreation` (Section 4.3); if it returns `200` with a NIN, call `tradingAccountCreation` for `cash` and/or `marginAccountCreation` for `margin` per `portfolio_options_list` (Section 4.4). Evaluate per Section 3.4.
6. **Derive the overall result** from the requested/onboarded flags (Section 3.5) and set `responseCode`, `responseMessage`, `response`.
7. **On any exception** (catch block): set `500` / "Internal Server Error" (or `1069` for validation), then re-derive the result from the flags (Section 3.5, exception column) and append a FAILED entry `"Error - <error>"` for each requested market whose flag is already `N`. Entries already added before the failure are kept (see Section 6 for the quirks of this path).
8. **Finally** (always): send the audit record asynchronously to Seq/Datalust (Section 4.6); return only `correlationID`, `responseCode`, `responseMessage`, `response`.

### 3.4 Per-Market Outcome Rules

| Market | Condition | Entry appended to response[] | Flag |
|---|---|---|---|
| DFM | DFM `responseCode` is `200` or `201` and `nin` present — for each `cash`/`margin` in portfolio options with the matching trading number present | `status` SUCCESS, `accountType` `normal`/`margin`, `tradingaccountnumber`, `nin`, `statusMessage` = DFM responseMessage | dfmOnboarded = Y |
| DFM | `200`/`201` + NIN, but `cashTradingNumber` (or `marginTradingNumber`) missing for a requested type | FAILED, `accountType`, `nin`, "Error - DFM Cash (Margin) Trading Number was not retrieved successfully." | dfmOnboarded = N |
| DFM | Any other `responseCode` | FAILED, "Error <code> - <DFM responseMessage>" | dfmOnboarded = N |
| DFM | `200`/`201` but `nin` blank | Nothing appended (legacy gap — see Section 6) | dfmOnboarded unset |
| ADSM | `emiratesId` blank | FAILED, "Error ADX NIN was not created since customer is a non-UAE Resident. Please proceed with generating the nin manually." | adsmOnboarded = N |
| ADSM | NINCreation `200` + NIN; account call returns a number | SUCCESS, `accountType`, `tradingaccountnumber`, `nin`, `statusMessage` = NINCreation responseMessage | adsmOnboarded = Y |
| ADSM | NINCreation `200` + NIN; account call returns no number | FAILED, `accountType`, `nin`, "Error - ADX Cash (Margin) Trading Number was not retrieved successfully." | adsmOnboarded = N |
| ADSM | NINCreation returns any code other than `200` | FAILED, "Error <code> - <ADX responseMessage>" | adsmOnboarded = N |
| ADSM | NINCreation `200` but NIN blank | Nothing appended (legacy gap) | adsmOnboarded unset |

> [!NOTE]
> **Rule:** A market is marked successful (`Y`) first and flipped to `N` as soon as any requested account type fails. It is never flipped back to `Y`.

### 3.5 Overall Response Code Determination

| DFM requested | ADSM requested | Outcome | Normal path | Exception path |
|---|---|---|---|---|
| Y | Y | DFM = Y and ADSM = Y | 200 OK | 500 (entries kept) |
| Y | Y | DFM = N and ADSM = N | 1070 | 1070 + FAILED entries for DFM and ADSM |
| Y | Y | Exactly one = N | 1071 | 1071 + FAILED entry for the failed market |
| Y | — | DFM = Y / N | 200 / 1070 | 500 / 1070 + FAILED DFM entry |
| — | Y | ADSM = Y / N | 200 / 1070 | 500 / 1070 + FAILED ADSM entry |
| — | — | No DFM/ADSM market in request | No code set (legacy gap) | 500 or 1069 |

## 4. External Dependencies & Configuration

### 4.1 Downstream Services

| Legacy Service | Purpose | Target Implementation |
|---|---|---|
| `DFMIntegrations.v2.services:NINOnboarding` | DFM NIN + cash/margin trading account onboarding (single call) | REST client (`DfmClient`) — reuse the migrated DFM integration API |
| `ADXIntegrations.v2.services:NINCreation` | ADX investor number (NIN) creation | REST client (`AdxClient`) |
| `ADXIntegrations.v2.services:tradingAccountCreation` | ADX cash trading account | `AdxClient` |
| `ADXIntegrations.v2.services:marginAccountCreation` | ADX margin account | `AdxClient` |
| `commonUtility.adapter:getISO2CountryCode` | JDBC lookup on FIT DB: ISO-3 → ISO-2 + English country name | Repository / cached reference-data service |
| `commonUtility.adapter:getCityName` | JDBC lookup on FIT DB: city code → English city name | Repository / cached reference-data service |
| `commonUtility.java:GenerateGUID` | Generate correlation ID | `UUID.randomUUID()` |
| `SEQDatalust.services:asynchronousIngestion` | Asynchronous audit log (request/response) | Async logger / `@Async` publisher to Seq |

### 4.2 Field Mapping — DFM NINOnboarding

Rows marked **(implicit)** are not mapped explicitly in the legacy flow: they reach the DFM service only because a pipeline variable with the same name exists. The target must map them explicitly.

| DFM Field | Source | Transformation |
|---|---|---|
| correlationID, request_id | correlationID | — |
| cust_mobile | mobileNumber | `+` → `00` |
| cust_email | email | — |
| cust_engfullname / cust_arfullname | fullnameEnglish / fullnameArabic | — |
| cust_firstname / cust_lastname | firstname / lastname | — |
| cust_dob | dateOfBirth | as received (`yyyy-MM-dd`) |
| cust_gender | gender | — |
| cust_nationality | nationality | ISO-3 → ISO-2 lookup |
| cust_signatureimage_type | custSignatureImageType | default `JPG` **(implicit)** |
| eid_no | emiratesId | as received (dashes kept) |
| eid_expirydate | emiratesIdExpiryDate | — |
| eid_attachment_front / eid_attachment_back | eidAttachmentFront / eidAttachmentBack | — |
| pp_no / pp_expirydate / pp_attachment | passportNumber / passportExpiryDate / passportAttachment | — |
| pp_attachment_type | passportAttachmentType | default `JPG` **(implicit)** |
| adr_country | countryCode | ISO-3 → ISO-2 lookup |
| adr_city | city | city code → English name lookup |
| adr_address / adr_pobox | address / poBox | — |
| pay_method | paymentMethod | default `bank` **(implicit)** |
| pay_aed_iban | ibanNumber | when IBAN contains `AE` **(implicit)** |
| pay_frn_iban / pay_frn_swift | ibanNumber / swiftCode | when IBAN does not contain `AE` **(implicit)** |
| pay_routecode | routeCode | — |
| portfolio_options | portfolioOptions | default `cash, margin` **(implicit)** |
| csr.csr_countries[] | csr[] | see DFMCRS in Section 3.2 |
| csr_resident | constant | `1` |
| fatca_uscitizen | constant | `2` |
| fatca_tin | constant | empty string |
| Not set: cust_familyid, cust_signatureimage, cust_nin, adr_zipcode, adr_phone, pay_usd_iban, pay_cor_iban, pay_cor_swift, pay_printname, guardian_name, guardianship_type, proof_of_guardianship | — | Left null in legacy |

#### DFM Response Used

| DFM Response Field | Used As |
|---|---|
| responseCode | Branch: `200`/`201` = NIN created; other = failure |
| responseMessage | `statusMessage` of SUCCESS entries; part of failure message |
| response.nin | `nin` |
| response.cashTradingNumber | `tradingaccountnumber` for `normal` |
| response.marginTradingNumber | `tradingaccountnumber` for `margin` |
| response.memberReference, dfmReference, trackingNumber | Not used |

### 4.3 Field Mapping — ADX NINCreation

| ADX Field | Source | Transformation |
|---|---|---|
| correlationID | correlationID | **(implicit)** |
| primaryidnumber, adxreferencenumber, emiratesid | emiratesId | dashes removed |
| investorname, shareholdername | fullnameArabic | — |
| investornameenglish | fullnameEnglish | — |
| shareholdertype | constant | `REG` |
| clienttype | constant | `I` |
| bankaccounttype | constant | `C` |
| jointholder / minor | constant | `N` / `N` |
| familyid | constant | empty string |
| bankcode | swiftCode | — |
| iban | ibanNumber | trimmed, spaces removed |
| gender | gender | **(implicit)** |
| birthdate | dateOfBirth | `yyyyMMdd` |
| citizenship | nationality | ISO-3 as received |
| city | city | FIT city code **(implicit)** |
| address1 | address | — |
| postalcode | poBox | — |
| country | countryCode | ISO-3 as received |
| mobilenumber, telephonenumber | mobileNumber | as received (with `+`) |
| passportnumber | passportNumber | — |
| email | email | **(implicit)** |
| address2, address3 | — | Not set |

Response used: `responseCode` (only `200` counts as success), `responseMessage`, `response.NIN`.

### 4.4 Field Mapping — ADX Account Creation

| Service | Input | Output Used |
|---|---|---|
| tradingAccountCreation (cash) | `primaryIdNumber` = ADX NIN; `correlationID` | `response.cashTradingNumber` → `tradingaccountnumber` (`normal`) |
| marginAccountCreation (margin) | `primaryIdNumber` = ADX NIN; `correlationID` **(implicit)** | `response.marginAccountNumber` → `tradingaccountnumber` (`margin`) |

The `responseCode` of the account calls is ignored — success is decided solely by whether an account number came back.

### 4.5 Reference-Data Lookups (FIT DB)

| Lookup | Input | Output | Called For |
|---|---|---|---|
| getISO2CountryCode | `ISO3_CODE_1` | `results[].COUNTRY_CODE` (ISO-2), `COUNTRY_NAME_ENGLISH` | nationality, countryCode, each csr[].country |
| getCityName | `CITY_CODE_1` | `results[].CITY_NAME_ENGLISH` | city |

Lookups are skipped when the input is blank. If no row is found, the corresponding DFM field is sent empty — the legacy flow does not fail. Table names/SQL live in the `commonUtility` package (not in this export) and must be confirmed.

### 4.6 Audit Logging

In the `Finally` block the flow calls `SEQDatalust.services:asynchronousIngestion` with `serviceName` = `CRM.services.marketOnboarding:onBoarding`, `correlationID`, `responseCode`, `responseMessage`, `requestTimestamp`, `responseTimestamp`, `requestBody` (JSON without attachments/signature) and `responseBody` (JSON of `response[]`). `requestHeaders` and `executionTime` are not populated. Logging must never block or fail the API response.

### 4.7 Configuration

| Name | Purpose |
|---|---|
| `dfm.integration.base-url` | DFM integration endpoint (NIN onboarding) |
| `adx.integration.base-url` | ADX integration endpoint (NIN, trading and margin account creation) |
| `*.connect-timeout` / `*.read-timeout` | Explicit timeouts for DFM/ADX clients (none exist in legacy — agree values) |
| `spring.datasource.fit.*` | FIT reference DB connection for country/city lookups |
| `seq.ingestion.url` / `seq.api-key` | Audit log sink (secret in vault/config server) |
| `app.timezone` | `GMT+4` (Asia/Dubai) for request/response timestamps |
| `onboarding.defaults.*` | `portfolio-options=cash, margin`, `payment-method=bank`, `image-type=JPG` |

## 5. Error Code Reference

### 5.1 Service-Level Codes

| responseCode | responseMessage | When | response[] |
|---|---|---|---|
| 1069 | Middleware system validation error : <path><message> | Schema validation fails (Section 3.1). Only the first error is reported. | Absent |
| 1070 | All operations encountered errors | Every requested market ended with flag N | FAILED entries |
| 1071 | Some operations were completed successfully, while others encountered errors | DFM and ADSM both requested; one Y, one N | Mixed entries |
| 500 | Internal Server Error | Unhandled exception (downstream fault, lookup error, etc.) | Entries created so far + "Error - <error>" entries |

### 5.2 Market-Level Status Messages

| statusMessage (returned) | Market | Cause |
|---|---|---|
| Error - DFM Cash Trading Number was not retrieved successfully. | DFM | NIN created but no cash trading number |
| Error - DFM Margin Trading Number was not retrieved successfully. | DFM | NIN created but no margin trading number |
| Error <code> - <message> | DFM / ADSM | NIN call returned a non-success code |
| Error ADX NIN was not created since customer is a non-UAE Resident. Please proceed with generating the nin manually. | ADSM | `emiratesId` blank |
| Error - ADX Cash Trading Number was not retrieved successfully. | ADSM | tradingAccountCreation returned no number |
| Error - ADX Margin Trading Number was not retrieved successfully. | ADSM | marginAccountCreation returned no number |
| Error - <error> | DFM / ADSM | Exception path: market requested but not completed |

## 6. Implementation Notes

Legacy-source gotchas worth knowing so they are not silently reproduced (or silently changed) in the target:

- **HTTP status is always 200 in legacy.** The business outcome is only in `responseCode`. Decide with consumers whether the target keeps HTTP 200 (backward compatible) or adopts the mapping in Section 2.4; if HTTP statuses are introduced, `responseCode`/`responseMessage` must still be returned unchanged.
- **Accounts are driven by portfolioOptions, not markets[].accountType.** The flow stores `markets[].accountType`/`accountNumber` into `dfm/adsmCash/MarginAccountNumber` variables that are never used. Values in `portfolioOptions` other than exactly `cash` or `margin` (case-sensitive, after trim) are silently ignored.
- **Missing responseCode edge cases.** (a) A market list without `DFM`/`ADSM` (e.g. `dfm`) processes nothing and returns no `responseCode`. (b) A `200`/`201` NIN response with a blank NIN leaves the flag unset, so no entry and no code are produced. Target must return an explicit error (recommend `1069`/400 for (a) and a FAILED entry + `1070`/`1071` for (b)).
- **IBAN routing uses "contains AE", not "starts with AE".** A foreign IBAN containing the letters `AE` anywhere is sent as an AED IBAN. Recommend `startsWith("AE")` in the target — confirm with the business before changing.
- **Fields accepted but dropped:** `telephoneNumber`, `familyId`, `payPrintname`, `custSignatureImage`, `userCode`, `fitNumber`, `csr[].reasonBDetails`, `markets[].accountType`, `markets[].accountNumber`. In particular the customer signature image is never sent to DFM — confirm whether this is intended.
- **Implicit pipeline mappings** (Sections 4.2–4.4) must become explicit mappings in the target: `pay_method`, `pay_aed_iban`, `pay_frn_iban`, `pay_frn_swift`, `portfolio_options`, `cust_signatureimage_type`, `pp_attachment_type` (DFM) and `gender`, `city`, `email`, `correlationID` (ADX).
- **DFM vs ADX success codes differ:** DFM accepts `200` or `201`; ADX NIN accepts only `200`; ADX account calls ignore the code entirely.
- **No compensation / idempotency.** If ADX creates the NIN but the account call fails, nothing is rolled back and a retry will call NINCreation again. DFM and ADSM are processed sequentially (DFM first); a failure in one does not stop the other. Consider an idempotency key (e.g. `correlationID`) in the target.
- **Exception handling keeps partial results — and has quirks.** The catch block re-reads the `*Onboarded` flags from the pipeline at the moment of failure. A flag is only set *after* a market call returns, so an exception thrown inside a market call leaves that flag unset: no FAILED entry is added for that market and the code stays `500`. Conversely, if DFM had already failed (`N`) and ADX then throws, the catch path yields `1071` ("some succeeded") although nothing succeeded, and adds a second DFM FAILED entry. If both markets had already succeeded, the result is `500` with only SUCCESS entries. The target should build the result from an explicit per-market state (NOT_REQUESTED / SUCCESS / FAILED) set in a `finally` around each market call.
- **Validation reports one error only** and the message is built by replacing the `1069` prefix, giving a double space after the colon. The target may return all violations, but should keep the `1069` code and message prefix.
- **ISO-3 vs ISO-2:** DFM gets ISO-2 (lookup), ADX gets the ISO-3 values as received. City: DFM gets the name, ADX gets the code. Mobile: DFM gets `00` prefix, ADX gets `+`.
- **correlationID** is not part of the request document type but is honoured if present in the body. Keep this behaviour and also accept an `X-Correlation-ID` header.
- **PII and logging:** attachments/signature are excluded from the audit request body, but names, Emirates ID, passport, IBAN and mobile are logged in clear text. Apply the programme masking standard in the target.
- **No authentication and no timeouts** exist in the legacy flow — confirm gateway security and set client timeouts in the target.
- **Timestamps** use timezone `GMT+4` and pattern `yyyy-MM-dd HH:mm:ss.SSS`.
- **Documentation convention:** nested schema rows are shaded by nesting depth (Sections 2.2 and 2.3), consistent with the programme standard.

### 6.1 Suggested Spring Boot Structure

| Component | Responsibility |
|---|---|
| `MarketOnboardingController` | `POST /marketOnboarding`; `@Valid` request DTO; correlation ID resolution |
| `MarketOnboardingRequest` / `MarketDto` / `CrsDto` | Request DTOs with Bean Validation (Section 3.1); JSON names as in Section 2.2 |
| `MarketOnboardingResponse` / `MarketResult` | Response DTOs, `@JsonInclude(NON_NULL)` |
| `OnboardingDataPreparer` | Derived fields and defaults (Section 3.2) |
| `DfmOnboardingHandler` / `AdxOnboardingHandler` | Per-market logic and outcome rules (Section 3.4) |
| `DfmClient` / `AdxClient` | Downstream REST clients with timeouts (Sections 4.2–4.4) |
| `ReferenceDataService` | Country ISO-3→ISO-2 and city lookups on FIT DB, cached |
| `OnboardingResultAggregator` | Overall code determination (Section 3.5) |
| `GlobalExceptionHandler` | `1069` for validation, `500` with partial results for unexpected errors |
| `AuditLogPublisher` | Async Seq/Datalust ingestion with PII masking (Section 4.6) |
