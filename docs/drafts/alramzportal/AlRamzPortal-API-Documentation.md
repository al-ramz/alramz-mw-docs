***AL RAMZ CAPITAL***

***MIDDLEWARE MIGRATION PROGRAMME***

**AlRamzPortal Service**

API Documentation & Integration Reference

*Software AG webMethods → Spring Boot 3.x / Java 21 Migration*

**Document Control**

| **Attribute**    | **Detail**                                                                 |
|------------------|----------------------------------------------------------------------------|
| Source package   | AlRamzPortal (Software AG webMethods Integration Server), built 2023-07-20 |
| Services covered | getRelationshipManagers, getCommissionsByRelationshipManager               |
| Document version | v2.1 — No-Data Responses Reclassified from 404 to 200 OK                   |
| Prepared for     | Software AG webMethods → Azure Cloud / Spring Boot migration               |

## Table of Contents

- [1. Overview](#1-overview)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Scope](#12-scope)
  - [1.3 Executive Summary](#13-executive-summary)
  - [1.4 Key Migration Notes](#14-key-migration-notes)
- [2. Solution Architecture](#2-solution-architecture)
  - [2.1 As-Built Service Map](#21-as-built-service-map)
  - [2.2 Target Architecture — Spring Boot 3.x on Azure](#22-target-architecture-spring-boot-3x-on-azure)
  - [2.3 Target Response & Result Model](#23-target-response-result-model)
    - [Design decision — "no data" is 200 OK, not 404](#design-decision-no-data-is-200-ok-not-404)
- [3. Prerequisites & Static Configuration](#3-prerequisites-static-configuration)
  - [3.1 Integration Server Global Variables](#31-integration-server-global-variables)
  - [3.2 Static/Feature-Flag Configuration](#32-staticfeature-flag-configuration)
  - [3.3 Upstream/Downstream Dependencies](#33-upstreamdownstream-dependencies)
  - [3.4 Security Notes](#34-security-notes)
- [4. Primary API — Get Relationship Managers](#4-primary-api-get-relationship-managers)
  - [4.1 Endpoint Summary](#41-endpoint-summary)
  - [4.2 Request Schema](#42-request-schema)
  - [4.3 Business Logic Summary](#43-business-logic-summary)
  - [4.4 Sample Request](#44-sample-request)
  - [4.5 Response Schema](#45-response-schema)
  - [4.6 HTTP Status Code Reference](#46-http-status-code-reference)
    - [4.6.1 Client Input Errors](#461-client-input-errors)
    - [4.6.2 Backend/Provider Errors](#462-backendprovider-errors)
  - [4.7 Example Target Response Envelopes](#47-example-target-response-envelopes)
    - [Success — Records Found (200)](#success-records-found-200)
    - [Success — Empty Result (200)](#success-empty-result-200)
    - [Backend/Provider Error (500)](#backendprovider-error-500)
  - [4.8 Target Process Flow (Spring Boot)](#48-target-process-flow-spring-boot)
- [5. Primary API — Get Commissions By Relationship Manager](#5-primary-api-get-commissions-by-relationship-manager)
  - [5.1 Endpoint Summary](#51-endpoint-summary)
  - [5.2 Request Schema](#52-request-schema)
  - [5.3 Business Logic Summary](#53-business-logic-summary)
  - [5.4 Sample Request](#54-sample-request)
  - [5.5 Response Schema](#55-response-schema)
  - [5.6 HTTP Status Code Reference](#56-http-status-code-reference)
    - [5.6.1 Client Input Errors](#561-client-input-errors)
    - [5.6.2 Backend/Provider Errors](#562-backendprovider-errors)
  - [5.7 Example Target Response Envelopes](#57-example-target-response-envelopes)
    - [Success — Records Found (200)](#success-records-found-200)
    - [Success — Empty Result (200)](#success-empty-result-200)
    - [Backend/Provider Error (500)](#backendprovider-error-500)
  - [5.8 Target Process Flow (Spring Boot)](#58-target-process-flow-spring-boot)
- [6. Downstream Integration — Database Adapters](#6-downstream-integration-database-adapters)
  - [6.1 getRelationshipManagers Adapter](#61-getrelationshipmanagers-adapter)
    - [Table Columns (CB_RELATION_MANAGER)](#table-columns-cb_relation_manager)
  - [6.2 getCommissionsByRelationshipManager Adapter](#62-getcommissionsbyrelationshipmanager-adapter)
- [7. Data Mapping Reference](#7-data-mapping-reference)
  - [7.1 getRelationshipManagers](#71-getrelationshipmanagers)
  - [7.2 getCommissionsByRelationshipManager](#72-getcommissionsbyrelationshipmanager)
- [8. Appendix](#8-appendix)
  - [Appendix A — Pseudocode: Condition-Builder Logic](#appendix-a-pseudocode-condition-builder-logic)
  - [Appendix B — Glossary](#appendix-b-glossary)
  - [Appendix C — Source Table & Column Reference](#appendix-c-source-table-column-reference)
    - [C.1 CB_RELATION_MANAGER — fully known](#c1-cb_relation_manager-fully-known)
    - [C.2 INVOICE_HEADER, CB_CLIENT, CB_MAIN_CLIENT, CB_SEC_COMP — referenced columns only](#c2-invoice_header-cb_client-cb_main_client-cb_sec_comp-referenced-columns-only)
  - [Appendix D — Findings & Recommendations](#appendix-d-findings-recommendations)

# 1. Overview

## 1.1 Purpose

This document defines the Application Programming Interface (API) contract, business rules, and integration behaviour of the **AlRamzPortal** service package — two reporting endpoints that expose relationship-manager reference data and relationship-manager commission/trading-volume summaries — as implemented in Software AG webMethods. It is intended to serve as the authoritative technical reference for the engineering team migrating this service to a Spring Boot 3.x / Java 21 implementation on Azure Cloud.

## 1.2 Scope

- The REST contract for both APIs exposed by the AlRamzPortal.restAPIs:restAPIs resource: GET /getRelationshipManagers and POST /getCommissionsByRelationshipManager.

- The functional and validation business rules enforced by the existing Flow services, including the relationship-manager code special-casing (RM 3031, the Islamic trading office).

- The two JDBC database adapters invoked by these services, including a cross-package dependency discovered during analysis (Section 2.1, Section 6.2).

- Request/response schemas, sample payloads, and the error-handling contract for each API.

- Data mapping between the underlying Oracle database columns and the JSON response fields.

- Findings and recommendations surfaced during source analysis, including one source-verified logic defect and one SQL-injection-shaped construction pattern (Appendix D).

## 1.3 Executive Summary

The package exposes two read-only reporting APIs backed by the Broker Insight Oracle schema (connection alias RMZ:RMZ, schema INSIGHT). getRelationshipManagers (GET) takes no parameters and returns the full list of relationship-manager records from CB_RELATION_MANAGER — identifier and English/Arabic names. getCommissionsByRelationshipManager (POST) accepts an optional date range and an optional comma-separated list of relationship-manager codes, and returns per-client trading-volume and commission totals aggregated from INVOICE_HEADER joined against CB_CLIENT, CB_MAIN_CLIENT, and CB_SEC_COMP, plus grand totals across all returned clients.

Both services follow the same response envelope and error pattern: a literal responseCode/responseMessage pair, with 1012/"No Data Available" when the underlying query returns no rows, and 500/"Internal Server Error" as a generic exception fallback — there is no other legacy error-code scheme in either service (Section 4.6, 5.6). The commissions endpoint applies one piece of non-trivial business logic: relationship-manager code 3031 is treated as the Islamic trading office and is filtered using a dedicated SC_ISLAMIC = 'Y' clause rather than a plain code match. Analysis of the underlying SQL found that this special case is combined with the general relationship-manager filter using AND rather than OR — a source-verified defect that silently produces an empty result whenever 3031 is requested alongside any other relationship-manager code (Section 5.3).

The commissions adapter that the live Flow actually invokes, AlgoIntegrations.adapters:getCommissionsByRelationshipManager, lives in a different Integration Server package that is not included in this export. An identically-shaped adapter of the same name is bundled inside AlRamzPortal itself but is never invoked by the Flow — it is presented here as a high-confidence reconstruction of the live query, not as directly verified source (Section 2.1, Section 6.2).

**v2.0 update**: this revision restates both APIs' target responses against this migration programme's standardized envelope — responseCode/responseMessage carrying the actual HTTP status and reason phrase, plus a nullable errorCode/errorMsg pair populated only for client-facing conditions (Section 2.3) — and splits each HTTP Status Code Reference into separate Client Input Errors and Backend/Provider Errors tables (Sections 4.6, 5.6). It also restructures Section 3 into the programme's standard four Prerequisites subsections, including a new Security Notes subsection, and standardizes several request/response field formats against the legacy all-string Flow pipeline (Sections 3.4, 5.2, 7.1).

**v2.1 update**: the legacy 1012/"No Data Available" condition — set by both services when the underlying query returns zero rows — is reclassified in the target design from HTTP 404 to HTTP 200 with an empty result (relationshipManagers: \[\], or results: \[\] with zero totals). Both endpoints are collection/report queries, not single-resource lookups, and a valid query matching zero rows is a normal successful outcome, not an error — see the design rationale in Section 2.3. As a direct consequence, neither endpoint has any remaining client-input-error condition to document (Sections 4.6, 5.6); errorCode/errorMsg stay part of the fixed envelope but are never populated by either service in practice.

## 1.4 Key Migration Notes

> **Important — behaviours to confirm or preserve during migration:**
>
> **Islamic-office filter defect.** Requesting relationship-manager code 3031 together with any other code in the same call produces a self-contradictory WHERE clause and silently returns 200/empty result instead of the union of both relationship managers' commissions — with no status-code signal that anything is wrong (see the v2.1 note below). The adapter's own SQL retains a commented-out original condition using OR, confirming this is a regression, not the intended design — see Section 5.3 and the Section 6.2 callout.
>
> **Cross-package adapter dependency.** The commissions API's real database dependency is AlgoIntegrations.adapters:getCommissionsByRelationshipManager, not a service inside this package. Locate and analyze the AlgoIntegrations package before treating this migration as complete — the SQL reproduced in Section 6.2 is a reconstruction from an unused, identically-shaped local copy, not the verified live source.
>
> **SQL built by textual substitution, not bind variables.** All three inputs to the dynamic commissions query (condition, startDate, endDate) use webMethods' ${var} textual-substitution syntax rather than :var bind parameters, and none are format-validated before substitution. This is a SQL-injection-shaped construction pattern that should not be carried into the Spring Boot target — see Section 6.2 and Appendix D.
>
> **`RM_DISABLES` is never filtered.** CB_RELATION_MANAGER carries a disabled/inactive flag that getRelationshipManagers never applies — confirm with business whether disabled relationship managers should be excluded from the target API (Section 6.1).
>
> **Response envelope has no `correlationID`.** Unlike the org API standard used elsewhere in this migration programme, neither endpoint returns a correlation/trace identifier — confirm whether these two reporting endpoints should be aligned to that standard (Section 2.3).
>
> **No access control enforced at the Integration Server layer.** Both services declare check_internal_acls = no, and the package manifest leaves listACL unset — there is no evidence of authentication or authorization at this layer for either endpoint. Confirm what (if anything) currently sits in front of Integration Server for these two calls, and carry equivalent enforcement into the Azure API Management / Spring Boot target explicitly rather than by omission (Section 3.4).
>
> **Two request fields are recommended for standardization, not verbatim carry-over.** relationshipManager is a comma-delimited string of codes in source and should become a proper array/list type in the target request; startDate/endDate are legacy YYYYMMDD strings and should become ISO 8601 dates. Both are flagged inline with a "Legacy vs. target field format" note under the affected field (Section 5.2) rather than carried forward as-is.
>
> **No-data reclassified from 404 to 200.** The legacy 1012/"No Data Available" condition is no longer mapped to an HTTP error in the target design — both endpoints return 200 with an empty result instead (Section 2.3). This is a deliberate behavior change from the legacy Flow, not a documentation-only reclassification: any existing consumer that branches on HTTP status to detect "no results" will need to switch to checking the array length instead.

# 2. Solution Architecture

## 2.1 As-Built Service Map

The package defines a single REST resource (restAPIs, 2 operations) mapping directly onto two Flow services, each invoking one JDBC adapter. getRelationshipManagers calls a Select-template adapter bundled in this same package. getCommissionsByRelationshipManager calls a Dynamic-SQL adapter — but the live INVOKE reference in the Flow targets AlgoIntegrations.adapters:getCommissionsByRelationshipManager, a different package not present in this export. An identically-shaped adapter of the same name **is** bundled under AlRamzPortal.adapters, but nothing in either Flow invokes it — it appears to be an unused leftover copy.

![Figure 1 — Source Flow (As-Built), Software AG webMethods](images/fig1-as-built-service-map.png)

*Figure 1 — Source Flow (As-Built), Software AG webMethods*

A separate end-to-end journey diagram is not included: unlike multi-system services elsewhere in this migration programme (CRM hops, notification dispatch, eTradeFIT calls), this package's complete journey is the single REST → Flow → Adapter → Oracle DB chain already shown above — Figure 1 **is** the journey diagram for this package. This is a deliberate adaptation of the document shape to a genuinely single-hop service, not an omission.

> **As-built finding — likely clone origin**
>
> getCommissionsByRelationshipManager's success-path cleanup deletes several pipeline variables that never otherwise appear in this Flow — getMarketMakingTradesOutput/Input, userCode, type, RM1/RM2/RM3, RM. Combined with the cross-package adapter reference above, this suggests the service was cloned from an existing AlgoIntegrations "market-making trades"–style service and adapted for relationship-manager commissions, without the clone being fully cleaned up. No functional effect was observed, but it is useful context when locating the real adapter dependency.

## 2.2 Target Architecture — Spring Boot 3.x on Azure

The target design consolidates both endpoints into a single Spring Boot service behind Azure API Management, reading directly from the same Broker Insight Oracle schema via Spring Data JPA / JdbcTemplate. No other system is involved — unlike other services in this migration programme, this package has no downstream CRM, eTradeFIT, or notification dependencies; it is a pure read/reporting service once the AlgoIntegrations adapter dependency (Section 2.1) is resolved.

![Figure 2 — Target Architecture, Spring Boot 3.x on Azure](images/fig2-target-architecture.png)

*Figure 2 — Target Architecture, Spring Boot 3.x on Azure*

## 2.3 Target Response & Result Model

Both APIs already use a simple, self-contained response envelope with no downstream orchestration and no internal-only service boundary inside the request — materially simpler than services elsewhere in this migration programme that chain multiple internal calls (and therefore need a typed OperationResult\<T\> to separate transport from domain result — see the DFM Onboarding API Documentation, Section 2.4, for that pattern). No OperationResult\<T\> wrapper is needed here for the same reason as before: there is no internal call chain to separate transport from domain result.

**v2.0 — standardized envelope.** The legacy envelope's responseCode/responseMessage pair carries webMethods-internal literals ("1012"/"No Data Available", "200"/"OK", "500"/"Internal Server Error" — Sections 4.6, 5.6) that do not consistently line up with actual HTTP semantics. Per this migration programme's standardized convention, the target envelope is restated as four fixed fields on every response, success or error:

- **\`responseCode\` / \`responseMessage\`** — always present; the actual HTTP status code and its reason phrase (e.g. "500" / "Internal Server Error"), not the legacy literal.

- **\`errorCode\` / \`errorMsg\`** — nullable. Populated only for client-facing conditions the caller can act on (a code like \<PREFIX\>\<NNN\> — the pattern used by services elsewhere in this migration programme that do have genuine client-input-error conditions); left null on success and on backend/provider errors, where the actual failure detail is logged server-side only, keyed by correlation ID, and never returned to the caller. **Neither of AlRamzPortal's own two endpoints ever populates this pair in practice** — see the Section 2.3 design decision below.

```
public class RelationshipManagersResponse {
private String responseCode; // HTTP status, e.g. "200" / "500" (no 4xx case for this endpoint — see below)
private String responseMessage; // HTTP reason phrase, e.g. "OK" / "Internal Server Error"
private String errorCode; // unused in practice by this package's endpoints; null always
private String errorMsg; // unused in practice by this package's endpoints; null always
private RelationshipManagersData response; // null on error
}
public class CommissionsResponse {
private String responseCode;
private String responseMessage;
private String errorCode;
private String errorMsg;
private CommissionsData response; // totals + results[], null on error
}
```

**Migration note**: neither response includes a correlationID, unlike the org API standard used for the dual-exposure/vendor-facing services documented elsewhere in this programme. Confirm with the API owner whether these two internal reporting endpoints should adopt the same standard, or are intentionally out of scope for it.

### Design decision — "no data" is 200 OK, not 404

Both endpoints are collection/query endpoints — getRelationshipManagers returns a list, getCommissionsByRelationshipManager is a filtered report — not single-resource lookups addressed by an identifier (contrast a hypothetical GET /relationship-managers/{id}, where a non-existent {id} genuinely would be 404). For an endpoint shaped like these two, a valid query that matches zero rows is a normal, successful outcome, not an error: the resource being addressed — the query itself — exists and executed correctly. Returning 404 for an empty search/report result is a well-documented REST anti-pattern (it conflates "wrong endpoint" with "right endpoint, no matches", and forces every caller to special-case a routine outcome as an error).

> **Design decision — no-data reclassified from legacy 404 to target 200**
>
> The legacy Flow sets responseCode 1012/"No Data Available" when a query returns zero rows, and the project's Error-Code-to-HTTP-Status-Mapping registry generically maps 1012 → 404 ("Query returned nothing for the given criteria") — a mapping this document followed in an earlier revision. On reflection, that generic mapping is a better fit for single-resource lookup codes elsewhere in the registry (e.g. 1021 User Does Not Exist, 1029 Record not found) than for these two collection/report endpoints, where an empty result is not an exceptional condition.
>
> **Target design**: an empty result set is 200 OK with an empty array (relationshipManagers: [], or results: [] with totalTradingVolume/totalReceivedCommission at 0.0) — not 404. This is a deliberate, documented deviation from the shared registry's generic 1012 → 404 mapping for these two specific services; the registry itself is unchanged, since the same code (1012) is used correctly as 404 for other, single-resource-shaped services elsewhere in this migration programme.
>
> **Consequence for this document**: neither endpoint retains a client-input-error condition to document (Sections 4.6, 5.6) — the only condition that previously used errorCode/errorMsg (RMG001/CBR001, "no data") is now a normal success case. errorCode/errorMsg remain part of the fixed envelope for consistency with the org standard, but neither service populates them in practice.
>
> **Trade-off worth flagging**: for getCommissionsByRelationshipManager specifically, this makes the Section 5.3 AND/OR defect *more* silent, not less — a request combining RM 3031 with another code now returns an unremarkable 200/empty result indistinguishable from a legitimate zero-match query, rather than a 404 that at least signals something unusual happened. This strengthens, rather than weakens, the case for fixing the underlying defect (Appendix D, Finding 2) instead of relying on the response code to surface it.

# 3. Prerequisites & Static Configuration

## 3.1 Integration Server Global Variables

Neither service references an Integration Server global variable anywhere in its Flow — confirmed by grepping both flow.xml files for pub.flow:getGlobalVariable and %variableName%-style substitution tokens. The one %value% token present in source (Section 6.2's condition-builder template) is a literal SQL-substitution placeholder authored inside the adapter's own dynamic query text, not an Integration Server global variable reference. There is nothing to migrate into Spring configuration under this heading.

## 3.2 Static/Feature-Flag Configuration

No feature flags, toggles, or static configuration files (beyond the JDBC connection alias itself, covered under Section 3.3) are read by either service. There is no branch in either Flow that is gated on an environment- or configuration-driven condition.

## 3.3 Upstream/Downstream Dependencies

Both adapters connect through the same connection alias, resolved per environment via the Integration Server connection pool configuration:

|                                                  |                                                                                                                                                                                                                                                                              |
|--------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Connection alias**                             | RMZ:RMZ                                                                                                                                                                                                                                                                      |
| **Schema (getRelationshipManagers)**             | INSIGHT — Broker Insight schema, table CB_RELATION_MANAGER                                                                                                                                                                                                                   |
| **Schema (getCommissionsByRelationshipManager)** | Not explicitly qualified in the reconstructed SQL (Section 6.2); tables referenced (INVOICE_HEADER, CB_CLIENT, CB_MAIN_CLIENT, CB_SEC_COMP) are consistent with the same Broker Insight schema — confirm the resolved default schema for connection RMZ:RMZ per environment. |
| **Credentials**                                  | Adapter-level overrideCredentials.\$dbUser / \$dbPassword inputs are declared but unused by either Flow in this package — both calls run under the pooled connection's own credentials.                                                                                      |
| **Adapter timeout**                              | timeoutPeriod = 60 (seconds) on both adapters, source-verified — a reasonable starting point for the target JDBC/Hikari pool's query timeout.                                                                                                                                |

- **Database connectivity to the Broker Insight schema (candidate health-check dependency).** Both APIs require a live, correctly-permissioned JDBC connection (RMZ:RMZ) to the Oracle schema hosting CB_RELATION_MANAGER, INVOICE_HEADER, CB_CLIENT, CB_MAIN_CLIENT, and CB_SEC_COMP in every environment — the natural readiness/liveness dependency for the target Spring Boot service.

- **Resolution of the \`AlgoIntegrations\` package dependency.** getCommissionsByRelationshipManager's live adapter call targets a package not present in this export (Section 2.1). The target migration cannot be validated end-to-end against the real query until that package is located and reconciled against the reconstruction in Section 6.2.

- **No external service, CRM, or messaging dependency.** Unlike other services in this migration programme, neither API in this package makes an outbound HTTP call, invokes a CRM, or sends email/SMS — the only external dependency is the Oracle database connection above.

## 3.4 Security Notes

Source-verified: neither service enforces access control at the Integration Server layer. Both getRelationshipManagers/node.ndf and getCommissionsByRelationshipManager/node.ndf declare check_internal_acls = "no", and the package manifest (manifest.v3) leaves listACL unset (null) — there is no service-level or package-level ACL restricting who can invoke either endpoint once a caller can reach Integration Server. No API-key, token, or credential check of any kind appears in either Flow.

> **Finding — no authentication or authorization enforced in-package**
>
> This does not necessarily mean the endpoints are unprotected in practice — many webMethods deployments rely entirely on a network perimeter (a reverse proxy, VPN-only IS exposure, or an API Gateway in front of Integration Server) rather than IS-level ACLs. But nothing in this export evidences what that perimeter is, or confirms one exists at all for this package specifically.
>
> For the target design, this absence must be closed explicitly rather than carried forward by omission: Azure API Management should terminate authentication (API key or OAuth2, per the org standard used elsewhere in this migration programme) ahead of the Spring Boot service, and the service itself should not assume network placement alone is sufficient. Confirm with the security/platform team what currently fronts this package in each environment before finalizing the target's auth model.

# 4. Primary API — Get Relationship Managers

## 4.1 Endpoint Summary

|                    |                                                                             |
|--------------------|-----------------------------------------------------------------------------|
| **HTTP Method**    | GET                                                                         |
| **Endpoint**       | /getRelationshipManagers                                                    |
| **Content Type**   | application/json                                                            |
| **Request Body**   | None — no query parameters or body fields are declared or read by the Flow. |
| **Source service** | AlRamzPortal.services:getRelationshipManagers                               |

## 4.2 Request Schema

This endpoint takes no request parameters. The Flow's declared input signature is empty, and no query-string or path parameters are read anywhere in the service.

## 4.3 Business Logic Summary

**1.** Invoke the getRelationshipManagers adapter — an unconditional query of RM_NO, RM_NAME_EN, RM_NAME_AR from CB_RELATION_MANAGER (INSIGHT schema); no WHERE clause, no pagination (Section 6.1).

**2.** If the result set is empty, the legacy Flow sets responseCode 1012 / "No Data Available", clears the response object, and returns immediately. **Target design (Section 2.3)**: this is reclassified as a normal success — HTTP 200, response.relationshipManagers returned as an empty array \[\], errorCode/errorMsg null. Not 404 — see the design-decision callout in Section 2.3 for why.

**3.** Otherwise, set responseCode 200 / "OK" and return the mapped relationshipManagers array — target envelope: HTTP 200, errorCode/errorMsg null.

**4.** Any adapter/database exception is caught and converted to responseCode 500 / "Internal Server Error" — target envelope: HTTP 500, errorCode/errorMsg null (Section 4.6.2).

## 4.4 Sample Request

```
GET /getRelationshipManagers HTTP/1.1
Accept: application/json
```

## 4.5 Response Schema

Standardized envelope (Section 2.3) plus the payload fields specific to this endpoint:

| **Field**                         | **Type**                                  | **Present When** | **Description**                                                                                                                                                                                                                                                                                                                                                           |
|-----------------------------------|-------------------------------------------|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| responseCode                      | String                                    | Always           | HTTP status as a string: "200" or "500" — see Section 2.3 for why this endpoint has no 4xx case.                                                                                                                                                                                                                                                                          |
| responseMessage                   | String                                    | Always           | HTTP reason phrase: "OK" or "Internal Server Error".                                                                                                                                                                                                                                                                                                                      |
| errorCode                         | String                                    | Never            | Part of the fixed envelope for consistency with the org standard, but this endpoint has no client-input-error condition to populate it with (Section 4.6) — always null.                                                                                                                                                                                                  |
| errorMsg                          | String                                    | Never            | Always null, for the same reason as errorCode.                                                                                                                                                                                                                                                                                                                            |
| response.relationshipManagers\[\] | Array                                     | 200 (always)     | One entry per row returned by the adapter (Section 6.1); an **empty array**, not an error, when no rows match (Section 2.3). null/absent only on 500.                                                                                                                                                                                                                     |
| ↳ relationshipManagerID           | String (source) → **Integer recommended** | —                | Source column RM_NO is NUMBER(4) (Appendix C.1), but both the adapter and the service's own declared output signature type this field as string — source-verified. **Legacy vs. target field format**: carry this as a numeric type (Integer/int) in the target DTO rather than the legacy all-string convention; there is no non-numeric value this field can ever hold. |
| ↳ relationshipManagerNameEN       | String                                    | —                | Source RM_NAME_EN, VARCHAR2(50).                                                                                                                                                                                                                                                                                                                                          |
| ↳ relationshipManagerNameAR       | String                                    | —                | Source RM_NAME_AR, VARCHAR2(50).                                                                                                                                                                                                                                                                                                                                          |

## 4.6 HTTP Status Code Reference

### 4.6.1 Client Input Errors

None. This endpoint takes no parameters (Section 4.2), and the one condition that previously produced a client-facing error — an empty result set — is now documented as a normal 200 response with an empty array, not an error (Section 2.3). There is no remaining client-input-error condition for getRelationshipManagers.

### 4.6.2 Backend/Provider Errors

| **HTTP Status** | **Service Error Code**      | **Description**                                                                                                                                | **Legacy Error Code** |
|-----------------|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| 500             | — (errorCode/errorMsg null) | Unhandled fallback failure (adapter/database exception). Detail is not returned to the caller — log server-side only, keyed by correlation ID. | —                     |

*Source-verification note: getRelationshipManagers' flow.xml sets exactly two literal response codes beyond "200" — "1012" (target-mapped to HTTP 200/empty result, not 404 — see the Section 2.3 design decision) and "500" (already an HTTP-shaped literal, not a distinct legacy scheme). No other codes exist in source.*

## 4.7 Example Target Response Envelopes

### Success — Records Found (200)

```json
{
"responseCode": "200",
"responseMessage": "OK",
"errorCode": null,
"errorMsg": null,
"response": {
"relationshipManagers": [
{
"relationshipManagerID": 3030,
"relationshipManagerNameEN": "Ahmed Al Suwaidi",
"relationshipManagerNameAR": "أحمد السويدي"
},
{
"relationshipManagerID": 3031,
"relationshipManagerNameEN": "Islamic Trading Desk",
"relationshipManagerNameAR": "مكتب التداول الإسلامي"
}
]
}
}
```

### Success — Empty Result (200)

```json
{
"responseCode": "200",
"responseMessage": "OK",
"errorCode": null,
"errorMsg": null,
"response": {
"relationshipManagers": []
}
}
```

### Backend/Provider Error (500)

```json
{
"responseCode": "500",
"responseMessage": "Internal Server Error",
"errorCode": null,
"errorMsg": null,
"response": null
}
```

## 4.8 Target Process Flow (Spring Boot)

Reduced to its essential orchestration stages, the migrated Get Relationship Managers endpoint should implement:

![Figure 3 — Target Process Flow, Get Relationship Managers, Spring Boot 3.x](images/fig3-rm-process-flow.png)

*Figure 3 — Target Process Flow, Get Relationship Managers, Spring Boot 3.x*

# 5. Primary API — Get Commissions By Relationship Manager

## 5.1 Endpoint Summary

|                    |                                                           |
|--------------------|-----------------------------------------------------------|
| **HTTP Method**    | POST                                                      |
| **Endpoint**       | /getCommissionsByRelationshipManager                      |
| **Content Type**   | application/json                                          |
| **Idempotency**    | Read-only reporting call; safe to retry.                  |
| **Source service** | AlRamzPortal.services:getCommissionsByRelationshipManager |

## 5.2 Request Schema

| **Field**           | **Type**                                                      | **Required** | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|---------------------|---------------------------------------------------------------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| startDate           | String (date, YYYYMMDD) → **ISO 8601 recommended**            | No           | Inclusive start of the invoice date range. Defaults to 19000101 only when the field is entirely absent from the request — see the Finding below. **Legacy vs. target field format**: source is the ad-hoc YYYYMMDD string substituted directly into TO_DATE(\${startDate},'YYYYMMDD') (Section 6.2); document/accept the target field as an ISO 8601 date (YYYY-MM-DD, e.g. "2026-01-01") and convert server-side, rather than carrying the legacy format forward.                                                                        |
| endDate             | String (date, YYYYMMDD) → **ISO 8601 recommended**            | No           | Inclusive end of the invoice date range. Defaults to 29990101 only when entirely absent. Same legacy-vs-target format note as startDate.                                                                                                                                                                                                                                                                                                                                                                                                  |
| relationshipManager | String (comma-separated) → **\`List\<String\>\` recommended** | No           | One or more relationship-manager codes. Omitted or empty ⇒ commissions for all relationship managers. Code 3031 is treated specially — see Business Logic Summary below. **Legacy vs. target field format**: source crams multiple codes into one comma-delimited string (e.g. "3030,3032") — a legacy encoding inconsistency, not a deliberate design (Appendix D, Finding 10). Document/accept the target field as a proper JSON array ("relationshipManagerCodes": \["3030","3032"\]) instead of replicating the delimiter convention. |

> **Finding — empty string bypasses the date default**
>
> The 19000101 / 29990101 defaults are applied with OVERWRITE="false", which only fires when the field is **absent** from the pipeline — a caller-supplied empty string ("startDate": "") is left as-is and substituted directly into TO_DATE(${startDate}, 'YYYYMMDD') (Section 6.2), which raises an Oracle date-conversion error. That error is caught generically and surfaces as 500/Internal Server Error rather than a targeted 400 validation message. Recommend explicit blank-string handling in the target design.

Both forms shown together, per the standardization convention (legacy source shape as evidence, target shape as the documented standard):

```
// Legacy source shape (as accepted by the existing REST resource today)
{
"startDate": "20260101",
"endDate": "20260630",
"relationshipManager": "3030,3032"
}
// Recommended target shape
{
"startDate": "2026-01-01",
"endDate": "2026-06-30",
"relationshipManagerCodes": ["3030", "3032"]
}
```

## 5.3 Business Logic Summary

**1.** Default startDate to 19000101 and endDate to 29990101 when either field is entirely absent from the request (Section 5.2).

**2.** Split relationshipManager on , into a list of relationship-manager codes; an absent/empty value produces a zero-length list.

**3.** If the list is empty, build the query condition as a single blank space — i.e. apply no relationship-manager filter at all; commissions are aggregated across all relationship managers.

**4.** Otherwise, iterate the code list: for the code 3031 specifically, add the clause ( CL_RELATION_MANG = 3031 and CB_SEC_COMP.SC_ISLAMIC = 'Y' ) AND and remove 3031 from the list — this is the Islamic-office carve-out (RM 3031 identifies the Islamic trading desk, whose commissions must also match SC_ISLAMIC = 'Y').

**5.** After the loop, if any codes remain in the list, join them with commas and append CL_RELATION_MANG in (\<codes\>) and to whatever condition step 4 already built.

**6.** Invoke the commissions adapter (AlgoIntegrations.adapters:getCommissionsByRelationshipManager — a cross-package dependency not included in this export, Section 2.1, 6.2) with startDate, endDate, and the built condition, all substituted as raw text into the dynamic SQL (Section 6.2 — flagged as a SQL-injection-shaped construction pattern in Appendix D).

**7.** If the result set is empty, the legacy Flow sets responseCode 1012 / "No Data Available", clears the response object, and returns immediately. **Target design (Section 2.3)**: reclassified as a normal success — HTTP 200, response.results returned as an empty array \[\], totals at 0.0, errorCode/errorMsg null. Not 404 — see the design-decision callout in Section 2.3, which also flags this as making the AND/OR defect below harder to notice operationally.

**8.** Otherwise, for each result row, default a null tradingVolume/receivedCommission to 0.0, then accumulate running totals via string-based float addition (pub.string:objectToString → pub.math:addFloats → pub.math:toNumber — see Appendix D for a recommendation to use BigDecimal in the target design instead).

**9.** Set responseCode 200 / "OK", populate response.totalTradingVolume / response.totalReceivedCommission from the accumulated sums, and return response.results\[\] — target envelope: HTTP 200, errorCode/errorMsg null.

**10.** Any adapter/database exception — including a malformed startDate/endDate that fails Oracle's TO_DATE conversion (Section 5.2 Finding) — is caught, response is cleared, and responseCode is set to 500 / "Internal Server Error" — target envelope: HTTP 500, errorCode/errorMsg null (Section 5.6.2).

> **⚠ Source-verified defect — steps 4–5 combine with AND, not OR**
>
> Step 4's Islamic-office clause and step 5's IN (...) clause are joined with AND, not OR. A request for relationshipManager = "3030,3031" therefore builds ( CL_RELATION_MANG = 3031 and SC_ISLAMIC = 'Y' ) AND CL_RELATION_MANG in (3030) and ... — a WHERE clause no single row can satisfy, since CL_RELATION_MANG cannot equal both 3031 and 3030 at once. The call silently returns 200/empty result instead of the union of both relationship managers' commissions, with no error raised.
>
> This is verifiably a regression rather than the intended design: the adapter's own SQL (Section 6.2) retains a commented-out original condition — (CL_RELATION_MANG = 3030 or ( CL_RELATION_MANG = 3031 and CB_SEC_COMP.SC_ISLAMIC = 'Y' )) — which used OR. Recommend the target implementation OR the two predicates together (or issue one query per relationship-manager group and merge results) rather than reproducing the AND.
>
> **Note (v2.1)**: now that an empty result set is 200 OK rather than 404 (Section 2.3), this defect is *more* silent than before — a caller combining 3031 with another RM code sees an ordinary-looking empty success response, indistinguishable from a legitimate zero-match query, with no status-code signal that anything unusual happened. This makes fixing the underlying AND/OR defect more important, not less.

## 5.4 Sample Request

```
POST /getCommissionsByRelationshipManager HTTP/1.1
Content-Type: application/json
{
"startDate": "20260101",
"endDate": "20260630",
"relationshipManager": "3030,3032"
}
```

## 5.5 Response Schema

Standardized envelope (Section 2.3) plus the payload fields specific to this endpoint:

| **Field**                        | **Type**         | **Present When** | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|----------------------------------|------------------|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| responseCode                     | String           | Always           | HTTP status as a string: "200" or "500" — see Section 2.3 for why this endpoint has no 4xx case.                                                                                                                                                                                                                                                                                                                                                                         |
| responseMessage                  | String           | Always           | HTTP reason phrase: "OK" or "Internal Server Error".                                                                                                                                                                                                                                                                                                                                                                                                                     |
| errorCode                        | String           | Never            | Part of the fixed envelope for consistency with the org standard, but this endpoint has no client-input-error condition to populate it with (Section 5.6) — always null.                                                                                                                                                                                                                                                                                                 |
| errorMsg                         | String           | Never            | Always null, for the same reason as errorCode.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| response.totalTradingVolume      | Number (decimal) | 200 (always)     | Sum of tradingVolume across results\[\] (Section 5.3, step 8); 0.0 when results\[\] is empty.                                                                                                                                                                                                                                                                                                                                                                            |
| response.totalReceivedCommission | Number (decimal) | 200 (always)     | Sum of receivedCommission across results\[\]; 0.0 when results\[\] is empty.                                                                                                                                                                                                                                                                                                                                                                                             |
| response.results\[\]             | Array            | 200 (always)     | One entry per client row returned by the adapter (Section 6.2); an **empty array**, not an error, when no rows match (Section 2.3). null/absent only on 500.                                                                                                                                                                                                                                                                                                             |
| ↳ clientNumber                   | String           | —                | Source CB_MAIN_CLIENT.CL_MAIN_CLIENT_ID, declared string on the adapter's own output signature (source-verified). Likely a numeric key given its naming and its join to CL_CLIENT_ID, but CB_MAIN_CLIENT's real Oracle column type is not available in this export (Appendix C.2 lists it as "referenced columns only") — documented here as String, consistent with the declared source type, with numeric-type candidacy flagged as an open item rather than asserted. |
| ↳ clientName                     | String           | —                | Source CB_MAIN_CLIENT.CLE_CLIENT_NAME.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ↳ tradingVolume                  | Number (decimal) | —                | Source SUM(TOTAL), declared object/Double on the adapter.                                                                                                                                                                                                                                                                                                                                                                                                                |
| ↳ receivedCommission             | Number (decimal) | —                | Source SUM(LOC_OFFICE_COMM / 2), declared object/Double on the adapter.                                                                                                                                                                                                                                                                                                                                                                                                  |

## 5.6 HTTP Status Code Reference

### 5.6.1 Client Input Errors

None. The one condition that previously produced a client-facing error — an empty result set, including the case where relationshipManager combines RM code 3031 with any other code (Section 5.3) — is now documented as a normal 200 response with an empty array and zero totals, not an error (Section 2.3). There is no remaining client-input-error condition for getCommissionsByRelationshipManager.

### 5.6.2 Backend/Provider Errors

| **HTTP Status** | **Service Error Code**      | **Description**                                                                                                                                                                                                                              | **Legacy Error Code** |
|-----------------|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| 500             | — (errorCode/errorMsg null) | Unhandled fallback failure (adapter/database exception, including a malformed startDate/endDate that fails Oracle's TO_DATE conversion — Section 5.2). Detail is not returned to the caller — log server-side only, keyed by correlation ID. | —                     |

*Source-verification note: as with getRelationshipManagers, getCommissionsByRelationshipManager's flow.xml sets exactly two literal response codes beyond "200" — "1012" (target-mapped to HTTP 200/empty result, not 404 — see the Section 2.3 design decision) and "500". No other legacy code scheme exists in source.*

> **Finding — possible internal exception leak on 500**
>
> The declared output signature for this service includes a lastError field (pub.event:exceptionInfo) that is never cleared on the success path and is unconditionally repopulated by pub.flow:getLastError after the try/catch block completes. If the REST binding serializes the full declared output signature, a 500 response can include internal exception class names and messages in lastError, alongside the intended standardized envelope shown in Section 5.7. Confirm the actual REST-binding serialization behaviour; do not carry a raw exception object into the Spring Boot target's error response regardless.

## 5.7 Example Target Response Envelopes

### Success — Records Found (200)

```json
{
"responseCode": "200",
"responseMessage": "OK",
"errorCode": null,
"errorMsg": null,
"response": {
"totalTradingVolume": 4523980.50,
"totalReceivedCommission": 18760.25,
"results": [
{
"clientNumber": "100234",
"clientName": "Acme Trading LLC",
"tradingVolume": 2500000.00,
"receivedCommission": 9500.00
},
{
"clientNumber": "100567",
"clientName": "Gulf Investments FZE",
"tradingVolume": 2023980.50,
"receivedCommission": 9260.25
}
]
}
}
```

### Success — Empty Result (200)

```json
{
"responseCode": "200",
"responseMessage": "OK",
"errorCode": null,
"errorMsg": null,
"response": {
"totalTradingVolume": 0.0,
"totalReceivedCommission": 0.0,
"results": []
}
}
```

### Backend/Provider Error (500)

```json
{
"responseCode": "500",
"responseMessage": "Internal Server Error",
"errorCode": null,
"errorMsg": null,
"response": null
}
```

## 5.8 Target Process Flow (Spring Boot)

Reduced to its essential orchestration stages, the migrated Get Commissions By Relationship Manager endpoint should implement:

![Figure 4 — Target Process Flow, Get Commissions By Relationship Manager, Spring Boot 3.x](images/fig4-cbr-process-flow.png)

*Figure 4 — Target Process Flow, Get Commissions By Relationship Manager, Spring Boot 3.x*

# 6. Downstream Integration — Database Adapters

Neither API in this package calls another REST service, CRM, or messaging system — the only downstream integration in scope is the Oracle database, reached through two JDBC adapters. This section documents both, including the cross-package discrepancy discovered for the commissions adapter.

## 6.1 getRelationshipManagers Adapter

|                      |                                                     |
|----------------------|-----------------------------------------------------|
| **Service type**     | AdapterService                                      |
| **Adapter type**     | JDBC                                                |
| **Adapter template** | Select (com.wm.adapter.wmjdbc.services.Select)      |
| **Connection**       | RMZ:RMZ                                             |
| **Schema / Table**   | INSIGHT.CB_RELATION_MANAGER (table type TABLE)      |
| **Input record**     | getRelationshipManagersInput (no bound fields used) |
| **Output record**    | getRelationshipManagersOutput.results\[\]           |

This is a Select-template adapter: the query is generated by the adapter framework from table/column metadata rather than authored as literal SQL text. Reconstructed from that metadata (column list, selected-column mapping, and the absence of any WHERE/join/filter metadata):

```sql
-- Reconstructed from Select-adapter metadata (Designer table/column mapping),
-- not literal source SQL text.
SELECT t1.RM_NO, t1.RM_NAME_EN, t1.RM_NAME_AR
FROM INSIGHT.CB_RELATION_MANAGER t1
-- no WHERE clause; no pagination (select.maxRows unset); queryTimeOut = -1 (unbounded)
```

### Table Columns (CB_RELATION_MANAGER)

The adapter's Designer metadata carries the full column list for this table, though only three columns are actually selected (marked below):

| **Column**     | **Oracle Type** | **Selected by this adapter?**   |
|----------------|-----------------|---------------------------------|
| RM_NO          | NUMBER(4)       | Yes → relationshipManagerID     |
| RM_NAME_AR     | VARCHAR2(50)    | Yes → relationshipManagerNameAR |
| RM_NAME_EN     | VARCHAR2(50)    | Yes → relationshipManagerNameEN |
| RM_BR_CODE     | NUMBER(4)       | No                              |
| RM_CID         | VARCHAR2(10)    | No                              |
| RM_EMPLOYEE_ID | VARCHAR2(16)    | No                              |
| UPD_TIME       | DATE            | No                              |
| RM_DISABLES    | VARCHAR2(1)     | No — see Finding below          |

> **Finding — RM_DISABLES is never filtered**
>
> CB_RELATION_MANAGER carries an RM_DISABLES flag, but the query applies no WHERE clause at all — every row is returned regardless of this flag. If RM_DISABLES marks a relationship manager as inactive/retired, this API currently returns inactive relationship managers to callers indistinguishably from active ones. Confirm with business whether the target query should add a filter such as WHERE RM_DISABLES <> 'Y' (exact semantics of the flag's values were not determinable from the adapter metadata alone).

## 6.2 getCommissionsByRelationshipManager Adapter

> **Finding — the live adapter is not in this export**
>
> The Flow's INVOKE targets AlgoIntegrations.adapters:getCommissionsByRelationshipManager — a different Integration Server package, not included in this AlRamzPortal export (Section 2.1). This package separately bundles an adapter of the identical name under AlRamzPortal.adapters, with an identical input/output field signature (startDate, endDate, condition → clientNumber, clientName, tradingVolume, receivedCommission), but nothing in either Flow invokes it. The SQL below is decoded directly from that unused local copy and is presented as a **high-confidence reconstruction** of the live query — not as directly verified source. Confirm it byte-for-byte against the real AlgoIntegrations package before finalizing the target implementation.

|                      |                                                                                                                                      |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| **Service type**     | AdapterService                                                                                                                       |
| **Adapter type**     | JDBC                                                                                                                                 |
| **Adapter template** | DynamicSQL (com.wm.adapter.wmjdbc.services.DynamicSQL)                                                                               |
| **Connection**       | RMZ:RMZ                                                                                                                              |
| **Input record**     | new_adapterServiceInput — startDate, endDate, condition (all textual-substitution SQL variables, \${...} syntax — see Finding below) |
| **Output record**    | new_adapterServiceOutput.results\[\] — clientNumber, clientName, tradingVolume (Double), receivedCommission (Double)                 |

Literal SQL text, decoded from the Dynamic SQL adapter's stored query (this **is** authored source text, unlike Section 6.1's Select-template reconstruction):

```sql
SELECT
CB_MAIN_CLIENT.CL_MAIN_CLIENT_ID,
CB_MAIN_CLIENT.CLE_CLIENT_NAME,
SUM(TOTAL) AS tradingVolume,
SUM((LOC_OFFICE_COMM) / 2) AS receivedCommission
FROM
INVOICE_HEADER
LEFT JOIN
CB_CLIENT ON CB_CLIENT.CL_CLIENT_ID = INVOICE_HEADER.CLIENT_ID
LEFT JOIN
CB_MAIN_CLIENT ON CB_CLIENT.CL_MAIN_CLIENT_ID = CB_MAIN_CLIENT.CL_MAIN_CLIENT_ID
LEFT JOIN
CB_SEC_COMP ON INVOICE_HEADER.comp_id = CB_SEC_COMP.SC_COMP_ID
WHERE ${condition}
--(CL_RELATION_MANG = 3030 or ( CL_RELATION_MANG = 3031 and CB_SEC_COMP.SC_ISLAMIC = 'Y' )) and
(total_comm <> 0.0 )
AND (TRUNC(INV_DATE) BETWEEN TO_DATE(${startDate},'YYYYMMDD') AND TO_DATE(${endDate},'YYYYMMDD'))
GROUP BY
CB_MAIN_CLIENT.CL_MAIN_CLIENT_ID, CB_MAIN_CLIENT.CLE_CLIENT_NAME
order by CB_MAIN_CLIENT.CLE_CLIENT_NAME
```

The commented-out line is reproduced verbatim from source — it is the original, OR-based condition the query was designed around, and is the direct evidence behind the Section 5.3 defect finding: the Flow's condition-builder no longer reproduces this OR for the general case.

> **⚠ Finding — SQL built by textual substitution, not bind variables**
>
> All three inputs — condition, startDate, endDate — use webMethods' ${var} textual-substitution syntax, which is replaced directly into the SQL text before the statement is sent to the database. None use the :var bind-parameter syntax the same adapter framework also supports. The adapter declares no separate bound input fields at all (sqlInputField is empty in the adapter metadata) — every value reaching this query is substituted as raw text.
>
> No format validation or allow-listing occurs on relationshipManager, startDate, or endDate anywhere in the calling Flow (Section 5.2, 5.3) before they reach this substitution. While the current condition-builder only ever concatenates numeric-looking codes from a comma split, the construction pattern itself is SQL-injection-shaped and must not be carried into the Spring Boot target as-is — use parameterized queries (JPA @Query with bind parameters, or a Criteria/Querydsl IN predicate) for both the date range and the relationship-manager filter.

# 7. Data Mapping Reference

## 7.1 getRelationshipManagers

| **Source Column (\`CB_RELATION_MANAGER\`)** | **Response Field**                                          |
|---------------------------------------------|-------------------------------------------------------------|
| RM_NO                                       | response.relationshipManagers\[\].relationshipManagerID     |
| RM_NAME_EN                                  | response.relationshipManagers\[\].relationshipManagerNameEN |
| RM_NAME_AR                                  | response.relationshipManagers\[\].relationshipManagerNameAR |

*RM_BR_CODE, RM_CID, RM_EMPLOYEE_ID, UPD_TIME, and RM_DISABLES exist on the table but are not selected or returned by this API (Section 6.1). Target-type note: relationshipManagerID is recommended as Integer in the target, not the legacy all-string type — see Section 4.5.*

## 7.2 getCommissionsByRelationshipManager

| **SQL Expression / Request Field**             | **Response Field**                                                                                                                                                                                                                                             |
|------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CB_MAIN_CLIENT.CL_MAIN_CLIENT_ID               | response.results\[\].clientNumber                                                                                                                                                                                                                              |
| CB_MAIN_CLIENT.CLE_CLIENT_NAME                 | response.results\[\].clientName                                                                                                                                                                                                                                |
| SUM(TOTAL) AS tradingVolume                    | response.results\[\].tradingVolume (also summed into response.totalTradingVolume)                                                                                                                                                                              |
| SUM(LOC_OFFICE_COMM / 2) AS receivedCommission | response.results\[\].receivedCommission (also summed into response.totalReceivedCommission)                                                                                                                                                                    |
| request.startDate / request.endDate            | \${startDate} / \${endDate} — TRUNC(INV_DATE) BETWEEN ... (textual substitution, Section 6.2). Target-type note: ISO 8601 in the target request, converted server-side before substitution — Section 5.2.                                                      |
| request.relationshipManager                    | \${condition} — CL_RELATION_MANG predicate, built per Section 5.3 (textual substitution, Section 6.2). Target-type note: target request field is relationshipManagerCodes (array), not the legacy comma-delimited string — Section 5.2, Appendix D Finding 10. |

*Column-name note: the query filters on total_comm (lower-case, as it appears in source) while summing TOTAL (upper-case) as tradingVolume — these are read here as two distinct columns on INVOICE_HEADER, consistent with how they are used (a non-zero-commission filter vs. a trading-value aggregate); their exact business definitions were not independently confirmable from the adapter metadata alone.*

# 8. Appendix

## Appendix A — Pseudocode: Condition-Builder Logic

The only non-trivial business logic in this package is the WHERE-clause condition builder inside getCommissionsByRelationshipManager. Pseudocode, annotated with the Section 5.3 defect:

```
function buildCondition(relationshipManagerParam):
codes = split(relationshipManagerParam, ",") // empty/absent -> []
if length(codes) == 0:
return " " // no RM filter at all
condition = ""
for code in codes:
if code == "3031":
condition += "( CL_RELATION_MANG = 3031 and SC_ISLAMIC = 'Y' ) AND "
remove "3031" from codes
// any other code: no special handling here — stays in `codes`
if length(codes) > 0:
inList = join(codes, ",")
condition += "CL_RELATION_MANG in (" + inList + ") and"
// BUG: this appends with the same string concatenation used for the
// 3031 clause above -> the two predicates end up AND-ed together.
// Source SQL's own comment shows the intended relationship was OR:
// (CL_RELATION_MANG = 3030 or (CL_RELATION_MANG = 3031 and SC_ISLAMIC = 'Y'))
return condition
```

## Appendix B — Glossary

| **Term**                        | **Definition**                                                                                                                                                                                                                                                                                                                                                                                |
|---------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| RM                              | Relationship Manager — a broker-side staff member (or the Islamic trading desk, code 3031) associated with one or more client accounts.                                                                                                                                                                                                                                                       |
| Flow service                    | A webMethods Integration Server service authored visually in Designer (flow.xml) — the equivalent of a Java/Spring service method.                                                                                                                                                                                                                                                            |
| Adapter service                 | A webMethods service that executes a database (or other resource) operation — here, JDBC Select and Dynamic SQL adapters against Oracle.                                                                                                                                                                                                                                                      |
| restResource                    | The webMethods artifact (node.ndf, node_type=restResource) that maps HTTP method + URL template pairs onto Flow services — the source-side equivalent of a Spring @RestController mapping.                                                                                                                                                                                                    |
| \${var} vs :var                 | webMethods Dynamic SQL syntax: \${var} is a textual substitution performed before the SQL reaches the driver; :var is a true JDBC bind parameter. This package uses \${var} exclusively (Section 6.2).                                                                                                                                                                                        |
| TRY / CATCH sequence            | webMethods' structured exception handling — a SEQUENCE FORM="TRY" paired with a sibling SEQUENCE FORM="CATCH", analogous to a Java try { } catch (Exception e) { } block.                                                                                                                                                                                                                     |
| EXIT SIGNAL="SUCCESS"           | An early-return statement inside a Flow — exits the enclosing scope while marking the service as having completed successfully (as opposed to SIGNAL="FAILURE", which would raise an exception).                                                                                                                                                                                              |
| Broker Insight / INSIGHT schema | The Oracle schema hosting the brokerage's core client, invoice, and relationship-manager reference data, queried read-only by this package.                                                                                                                                                                                                                                                   |
| responseCode / responseMessage  | This migration programme's standardized envelope fields, always present on every target response: the actual HTTP status code and its reason phrase — not a legacy webMethods literal (Section 2.3).                                                                                                                                                                                          |
| errorCode / errorMsg            | The standardized envelope's nullable, service-specific error pair — populated only for client-facing conditions (a \<PREFIX\>\<NNN\>-style code, as used by services elsewhere in this migration programme) and left null on success and on backend/provider errors, whose detail is logged server-side only. Neither of AlRamzPortal's own endpoints ever populates this pair — Section 2.3. |

## Appendix C — Source Table & Column Reference

This package owns no database table of its own — both APIs are read-only reports against existing Broker Insight tables. No target DDL is proposed for this reason (contrast with services elsewhere in this migration programme that persist their own records and therefore require a target-schema translation). The tables below are documented at the level of confidence the source metadata actually supports.

### C.1 CB_RELATION_MANAGER — fully known

Full column list and Oracle types, sourced directly from the Select-adapter's Designer table metadata (Section 6.1):

```sql
-- INSIGHT.CB_RELATION_MANAGER (column list/types per adapter metadata;
-- constraints, keys, and indexes were not present in that metadata and
-- are not asserted here)
RM_NO NUMBER(4)
RM_NAME_AR VARCHAR2(50)
RM_NAME_EN VARCHAR2(50)
RM_BR_CODE NUMBER(4)
RM_CID VARCHAR2(10)
RM_EMPLOYEE_ID VARCHAR2(16)
UPD_TIME DATE
RM_DISABLES VARCHAR2(1)
```

### C.2 INVOICE_HEADER, CB_CLIENT, CB_MAIN_CLIENT, CB_SEC_COMP — referenced columns only

These four tables are joined by the commissions query (Section 6.2), but only the columns actually referenced in that query are known from this export — full table definitions (all columns, keys, constraints) are not available and are not fabricated here:

| **Table**      | **Referenced Columns**                                           |
|----------------|------------------------------------------------------------------|
| INVOICE_HEADER | CLIENT_ID, comp_id, TOTAL, LOC_OFFICE_COMM, total_comm, INV_DATE |
| CB_CLIENT      | CL_CLIENT_ID, CL_MAIN_CLIENT_ID                                  |
| CB_MAIN_CLIENT | CL_MAIN_CLIENT_ID, CLE_CLIENT_NAME                               |
| CB_SEC_COMP    | SC_COMP_ID, SC_ISLAMIC                                           |

## Appendix D — Findings & Recommendations

Consolidated from the callouts throughout this document, ranked by severity:

| **\#** | **Severity**    | **Finding**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | **Section** |
|--------|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| 1      | High            | SQL is built by textual substitution (\${condition}, \${startDate}, \${endDate}) with no format validation upstream — a SQL-injection-shaped pattern. Replace with bound/parameterized queries in the target design.                                                                                                                                                                                                                                                                                                                | 5.2, 6.2    |
| 2      | High            | The Islamic-office clause and the general RM-code IN(...) clause are AND-ed instead of OR-ed, so requesting 3031 with any other RM code silently returns 200/empty result instead of the union of results — and, since no-data is no longer mapped to 404 (Finding 12), there is no status-code signal that anything is wrong. Source SQL's own comment shows the originally-intended OR.                                                                                                                                           | 5.3, 6.2    |
| 3      | Medium          | The live commissions adapter (AlgoIntegrations.adapters:...) is not in this export; the SQL documented here is reconstructed from an unused, identically-shaped local copy and should be confirmed against the real package.                                                                                                                                                                                                                                                                                                        | 2.1, 6.2    |
| 4      | Medium          | A declared lastError field (pub.event:exceptionInfo) is never cleared on success and is repopulated unconditionally after every call — a possible internal-exception leak on 500 responses if the REST binding serializes it.                                                                                                                                                                                                                                                                                                       | 5.6.2       |
| 5      | Medium          | CB_RELATION_MANAGER's RM_DISABLES flag is never filtered — disabled/inactive relationship managers are returned identically to active ones.                                                                                                                                                                                                                                                                                                                                                                                         | 6.1         |
| 6      | Medium          | Neither service enforces access control at the Integration Server layer (check_internal_acls=no on both; package listACL unset). No authentication/authorization is evidenced at this layer — confirm what perimeter security exists today and carry equivalent enforcement into Azure API Management / Spring Boot explicitly.                                                                                                                                                                                                     | 3.4         |
| 7      | Low             | Commission/volume totals are summed via a string round-trip (objectToString → addFloats → toNumber) rather than native decimal arithmetic. Recommend BigDecimal aggregation in the target design.                                                                                                                                                                                                                                                                                                                                   | 5.3         |
| 8      | Low             | Neither response envelope includes a correlationID, unlike the org API standard used for dual-exposure services elsewhere in this migration programme. Confirm intended alignment.                                                                                                                                                                                                                                                                                                                                                  | 2.3         |
| 9      | Low             | startDate/endDate defaults only apply when the field is entirely absent; an empty-string value bypasses the default and reaches Oracle's TO_DATE unconverted, surfacing as an untargeted 500 rather than a 400.                                                                                                                                                                                                                                                                                                                     | 5.2         |
| 10     | Low             | relationshipManager packs multiple RM codes into one comma-delimited string — an inconsistent legacy encoding for a multi-value field. Recommend the target request use a proper array (relationshipManagerCodes: List\<String\>) instead.                                                                                                                                                                                                                                                                                          | 5.2         |
| 11     | Contextual      | Pipeline cleanup in the commissions service's success path deletes fields (getMarketMakingTradesOutput/Input, userCode, type, RM1–RM3, RM) that never otherwise appear in this Flow — evidence the service was cloned from an AlgoIntegrations "market-making trades"–style service and not fully cleaned up. No functional effect observed.                                                                                                                                                                                        | 2.1         |
| 12     | Design decision | The legacy 1012/"No Data Available" condition is reclassified from HTTP 404 (the project registry's generic mapping) to HTTP 200 with an empty result — both endpoints are collection/report queries where a zero-row match is a normal outcome, not a single-resource lookup. Deliberate deviation from the shared Error-Code-to-HTTP-Status-Mapping registry for these two services specifically; the registry itself is unchanged. Documented, not fixed in source (there is no source to fix — this is a target-design choice). | 2.3         |
