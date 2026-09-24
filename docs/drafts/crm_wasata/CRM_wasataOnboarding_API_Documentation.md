**AL RAMZ CAPITAL**

**MIDDLEWARE MIGRATION PROGRAMME**

**CRM Wasata Onboarding Services**

**API Specification — Spring Boot Implementation Guide**

*Software AG webMethods → Spring Boot 3.x / Java 21 Migration*

## Document Control

| **Document Title** | CRM Wasata Onboarding Services — API Specification |
| --- | --- |
| **Package/Folder** | CRM.wasataOnboarding |
| **Services covered** | createCustomer · updateCustomer · createSubAccounts · updateSubAccounts · generateOnlineTradingAccess · finalizeMigration |
| **Source** | webMethods Integration Server export (CRM.zip — ns/CRM/services/wasataOnboarding) |
| **Audience** | Java development team performing the Spring Boot 3.x / Java 21 rewrite |

## Table of Contents

- [1. Overview](#1-overview)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Services/API’s in Scope](#12-servicesapis-in-scope)
  - [1.3 Common Response Envelope & Conventions](#13-common-response-envelope-conventions)
- [2. Shared Platform Components](#2-shared-platform-components)
  - [2.1 Shared Configuration](#21-shared-configuration)
  - [2.2 Shared Utility Services](#22-shared-utility-services)
    - [CRM.services.utils:getFITToken](#crmservicesutilsgetfittoken)
    - [CRM.services.utils:checkAndThrowError](#crmservicesutilscheckandthrowerror)
    - [commonUtility.services:getStaticData  /  commonUtility.v2.services:getStaticData](#commonutilityservicesgetstaticdata-commonutilityv2servicesgetstaticdata)
    - [commonUtility.java:GenerateGUID](#commonutilityjavagenerateguid)
    - [SEQDatalust.services:asynchronousIngestion](#seqdatalustservicesasynchronousingestion)
    - [CRM.services.wasataOnboarding.utils:datesValidation](#crmserviceswasataonboardingutilsdatesvalidation)
- [3. Service Specifications](#3-service-specifications)
  - [3.1 createCustomer](#31-createcustomer)
    - [3.1.1 Endpoint](#311-endpoint)
    - [3.1.2 Request Body](#312-request-body)
    - [3.1.3 Response Body](#313-response-body)
    - [3.1.4 Response Headers — HTTP Status Codes](#314-response-headers-http-status-codes)
    - [3.1.5 Business & Validation Logic](#315-business-validation-logic)
    - [3.1.6 Validation Rules](#316-validation-rules)
    - [3.1.7 Field-Level Mapping](#317-field-level-mapping)
    - [3.1.8 External Dependency & Configuration](#318-external-dependency-configuration)
    - [3.1.9 Error Code Reference](#319-error-code-reference)
    - [3.1.10 Implementation Notes](#3110-implementation-notes)
  - [3.2 updateCustomer](#32-updatecustomer)
    - [3.2.1 Endpoint](#321-endpoint)
    - [3.2.2 Request Body](#322-request-body)
    - [3.2.3 Response Body](#323-response-body)
    - [3.2.4 Response Headers — HTTP Status Codes](#324-response-headers-http-status-codes)
    - [3.2.5 Business & Validation Logic](#325-business-validation-logic)
    - [3.2.6 Validation Rules](#326-validation-rules)
    - [3.2.7 Field-Level Mapping](#327-field-level-mapping)
    - [3.2.8 External Dependency & Configuration](#328-external-dependency-configuration)
    - [3.2.9 Error Code Reference](#329-error-code-reference)
    - [3.2.10 Implementation Notes](#3210-implementation-notes)
  - [3.3 createSubAccounts](#33-createsubaccounts)
    - [3.3.1 Endpoint](#331-endpoint)
    - [3.3.2 Request Body](#332-request-body)
    - [3.3.3 Response Body](#333-response-body)
    - [3.3.4 Response Headers — HTTP Status Codes](#334-response-headers-http-status-codes)
    - [3.3.5 Business & Validation Logic](#335-business-validation-logic)
    - [3.3.6 Validation Rules](#336-validation-rules)
    - [3.3.7 Field-Level Mapping](#337-field-level-mapping)
    - [3.3.8 External Dependency & Configuration](#338-external-dependency-configuration)
    - [3.3.9 Error Code Reference](#339-error-code-reference)
    - [3.3.10 Implementation Notes](#3310-implementation-notes)
  - [3.4 updateSubAccounts](#34-updatesubaccounts)
    - [3.4.1 Endpoint](#341-endpoint)
    - [3.4.2 Request Body](#342-request-body)
    - [3.4.3 Response Body](#343-response-body)
    - [3.4.4 Response Headers — HTTP Status Codes](#344-response-headers-http-status-codes)
    - [3.4.5 Business & Validation Logic](#345-business-validation-logic)
    - [3.4.6 Validation Rules](#346-validation-rules)
    - [3.4.7 Field-Level Mapping](#347-field-level-mapping)
    - [3.4.8 External Dependency & Configuration](#348-external-dependency-configuration)
    - [3.4.9 Error Code Reference](#349-error-code-reference)
    - [3.4.10 Implementation Notes](#3410-implementation-notes)
  - [3.5 generateOnlineTradingAccess](#35-generateonlinetradingaccess)
    - [3.5.1 Endpoint](#351-endpoint)
    - [3.5.2 Request Body](#352-request-body)
    - [3.5.3 Response Body](#353-response-body)
    - [3.5.4 Response Headers — HTTP Status Codes](#354-response-headers-http-status-codes)
    - [3.5.5 Business & Validation Logic](#355-business-validation-logic)
    - [3.5.6 Validation Rules](#356-validation-rules)
    - [3.5.7 Field-Level Mapping](#357-field-level-mapping)
    - [3.5.8 External Dependency & Configuration](#358-external-dependency-configuration)
    - [3.5.9 Error Code Reference](#359-error-code-reference)
    - [3.5.10 Implementation Notes](#3510-implementation-notes)
  - [3.6 finalizeMigration](#36-finalizemigration)
    - [3.6.1 Endpoint](#361-endpoint)
    - [3.6.2 Request Body](#362-request-body)
    - [3.6.3 Response Body](#363-response-body)
    - [3.6.4 Response Headers — HTTP Status Codes](#364-response-headers-http-status-codes)
    - [3.6.5 Business & Validation Logic](#365-business-validation-logic)
    - [3.6.6 Validation Rules](#366-validation-rules)
    - [3.6.7 Field-Level Mapping](#367-field-level-mapping)
    - [3.6.8 External Dependency & Configuration](#368-external-dependency-configuration)
    - [3.6.9 Error Code Reference](#369-error-code-reference)
    - [3.6.10 Implementation Notes](#3610-implementation-notes)
- [4. Appendix](#4-appendix)
  - [4.1 Shared Document Types Referenced](#41-shared-document-types-referenced)
  - [4.2 Open Items to Confirm Before Rewrite Sign-off](#42-open-items-to-confirm-before-rewrite-sign-off)
  - [4.3 Documentation Conventions](#43-documentation-conventions)

# 1. Overview

## 1.1 Purpose

This document specifies, for each of the six services/API’s in the CRM.wasataOnboarding folder, the target Spring Boot REST contract and the business/validation logic the implementation must reproduce, so the Java development team can perform a 1:1 functional rewrite. Every field, endpoint URL, static-configuration key and validation rule below was extracted directly from the exported flow.xml / node.ndf source files in the package, not inferred.

All request and response field names use camelCase, regardless of the casing used internally by the legacy system or by FIT (the downstream core-banking/trading integration layer). responseCode and responseMessage are designed to mirror the actual HTTP status code and reason phrase (see each service's “Response Headers” table) — they are a body-level echo of the header, not an independently-maintained value. errorCode and errorMsg carry the specific reason, but only when the error is caused by the caller's own input; for backend/provider failures both are left null in the response and the specific detail stays server-log-only. This convention matches the programme-wide pattern established in the IBAN Validation Service specification.

## 1.2 Services/API’s in Scope

| **#** | **Service** | **REST Endpoint** | **Purpose** |
| --- | --- | --- | --- |
| 1 | createCustomer | /wasataOnboarding/createCustomer | Creates (onboards) a new main client/customer record in the core system. |
| 2 | updateCustomer | /wasataOnboarding/updateCustomer | Updates an existing customer's KYC/profile data in the core system. |
| 3 | createSubAccounts | /wasataOnboarding/createSubAccounts  (alias: /wasataOnboarding/createOrUpdateSubAccounts) | Creates a trading sub-account under an already-onboarded client. |
| 4 | updateSubAccounts | /wasataOnboarding/updateSubAccounts | Updates an existing sub-account. |
| 5 | generateOnlineTradingAccess | /wasataOnboarding/generateOnlineTradingAccess  (alias: /generateOnlineUserCode) | Enables a client for online trading and generates their online-trading portal credentials (user ID, username, password) in FIT, given a clientId, onBoardingStatus and a numeric userCode. |
| 6 | finalizeMigration | /wasataOnboarding/finalizeMigration | Finalizes a client-migration record by invoking a database stored procedure (via a JDBC Adapter service) for a given clientID, and returns a simple success/error response. |

## 1.3 Common Response Envelope & Conventions

```json
{
  "responseCode": string,
  "responseMessage": string,
  "errorCode": string | null,
  "errorMsg": string | null,
  "correlationID": string,
  "response": { ...service-specific... }
}
```

> **Note:** The legacy webMethods flows do not have separate errorCode/errorMsg fields — responseCode/responseMessage serve both the HTTP-status-echo role and the specific-reason role today, and the legacy service always returns HTTP 200 at the transport level regardless of business outcome. The errorCode/errorMsg split and the status-mirroring behaviour specified in this document are deliberate modernizations, made consistent with other services in this migration programme (see the IBAN Validation Service specification). Confirm with API consumers before changing legacy transport-level status codes.

# 2. Shared Platform Components

The following configuration and services are used by multiple (or all) of the six APIs. Implement each exactly once as a shared Spring component and reuse across all service implementations.

## 2.1 Shared Configuration

| **Key** | **Purpose** |
| --- | --- |
| ETRADE_BASE_URL | Base URL of the FIT / core-banking integration host used to build every outbound REST call and the token endpoint. |
| CRM_FIT_IMEI | Device/IMEI identifier value sent in the FIT authentication (token) request. |
| CRM_FIT_BUILDVERSION | Build/version string sent in the FIT authentication request. |
| CRM_FIT_CLIENTID | OAuth/API client ID used to authenticate against FIT. |
| CRM_FIT_LOGINDEVICE | Login-device identifier sent in the FIT authentication request. |
| CRM_FIT_OS | Operating-system identifier sent in the FIT authentication request. |
| CRM_FIT_REFERENCENO | Reference number sent in the FIT authentication request. |
| CRM_FIT_SOURCE | Source-system identifier sent in the FIT authentication request. |
| CRM_FIT_LANG | Language code sent in the FIT authentication request. |
| CRM_FIT_ISLAMICMODE | Islamic-banking-mode flag sent in the FIT authentication request. |
| CRM_FIT_TOKENPATH | Relative path (appended to ETRADE_BASE_URL) of the FIT token endpoint. |

> **Note:** CRM_FIT_CLIENT_SECRET is read from a protected/global flow variable, not from static configuration, and is redacted before being logged. Treat it as a secret (Vault / Config Server), not a plain property, in the target design.

## 2.2 Shared Utility Services

### CRM.services.utils:getFITToken

Obtains an OAuth-style bearer access token from FIT (the core-banking / trading-platform integration layer). Generates a correlationID if missing, pulls 11 static configuration values (device/build/client identifiers, language, source, reference no., Islamic-mode flag, token path, base URL — application='MIDDLEWARE') plus a client secret from a protected global variable (%CRM_FIT_CLIENT_SECRET%), assembles a getClientTokenRequest document, POSTs it as JSON to '<host><getTokenPath>', and parses the response: if resDoc.Error_code indicates success, returns statusCode='200' and response.accessToken; otherwise statusCode='500' and a failure message. Also writes a redacted copy of the request (client secret masked as '**********') to an audit log.

**Input: **

```text
client_ID, client_Secret, imei, buildversion, loginDevice, os, source, reference_No, islamicMode, lang, host, getTokenPath, correlationID  (all sourced internally from static config + the protected secret — no external caller inputs)
```

**Output: **

```text
statusCode (string, '200' or '500'), responseMessage, response.accessToken
```

**Java rewrite note: **

Implement as a single reusable FitTokenService / FitTokenProvider component (ideally with short-lived in-memory caching honoring the token's expiry, if FIT tokens are time-bounded) rather than re-authenticating on every request. Store CRM_FIT_CLIENT_SECRET in a secrets manager / environment variable — never in application config in plaintext — mirroring the flow's use of a protected/global variable and its explicit redaction before logging.

### CRM.services.utils:checkAndThrowError

Generic validation-failure helper. If errorMessage is non-empty, raises a flow EXIT with SIGNAL=FAILURE using errorMessage as the failure text (this is what every mandatory-field check in every API above calls). If errorMessage is empty, it is a no-op.

**Input: **

```text
errorMessage (string)
```

**Output: **

```text
(none — either throws or returns silently)
```

**Java rewrite note: **

Replace with a small static helper (e.g. Validate.require(condition, message)) that throws a custom ValidationException(message), OR simply throw ValidationException directly at each call site — either is acceptable in Java; a helper mainly reproduces the webMethods idiom of centralizing the 'throw' mechanics.

### commonUtility.services:getStaticData  /  commonUtility.v2.services:getStaticData

Configuration lookup service(s) that read one (v1, single 'key') or many (v2, 'keys' array) named configuration values for a given application ('MIDDLEWARE' throughout this package) from what is presumably a database-backed or cached configuration store, returning value(s) by key.

**Input: **

```text
application (string), key (string) — v1;  application (string), keys (string[]) — v2
```

**Output: **

```text
v1: response.value (string).  v2: response.staticData[] (array of {key?, value}), read here via response.staticData[0].value
```

**Java rewrite note: **

Implement as a single ConfigurationService (Spring @ConfigurationProperties, a DB-backed settings table, or a config/secret service client) with a getValue(application, key) method; consider caching (e.g. Caffeine) since these are looked up on every single API invocation across all 6 flows. Standardize on one method signature in Java even though webMethods used two variants (v1 single-key, v2 multi-key).

### commonUtility.java:GenerateGUID

Generates a new GUID/UUID, used as correlationID whenever the caller does not supply one.

**Input: **

```text
(none)
```

**Output: **

```text
guidID (string)
```

**Java rewrite note: **

java.util.UUID.randomUUID().toString().

### SEQDatalust.services:asynchronousIngestion

Fire-and-forget audit/observability logging call sent to a Seq (Datalust) structured-log sink at the end of every flow (in the 'Finally' block, and also from getFITToken), recording serviceName, requestBody, responseBody, responseCode/timestamps as applicable.

**Input: **

```text
serviceName, requestBody, responseBody, (responseCode in getFITToken's usage)
```

**Output: **

```text
(none of interest — fire-and-forget)
```

**Java rewrite note: **

Implement as an async (e.g. @Async or a message-queue-backed) audit logger writing structured events to Seq or an equivalent log-aggregation sink (e.g. via Serilog-style structured logging, an ELK/OpenSearch pipeline, or the existing enterprise logging standard) — must not block or fail the main request/response flow.

### CRM.services.wasataOnboarding.utils:datesValidation

Internal helper (not exposed as a REST API) that validates a from/to date pair: each supplied date string is validated against pattern MM/dd/yyyy (via commonValidator.date:validateDate); if both dates are present they are additionally compared (pub.date:compareDates) to ensure fromDate <= toDate, raising isValid=false / errorMessage='fromDate should be less or equal to toDate' otherwise.

**Input: **

```text
fromDateString, toDateString (both string, both optional)
```

**Output: **

```text
isValid (string 'true'/'false'), errorMessage (string)
```

**Java rewrite note: **

Implement as a small reusable DateRangeValidator utility using java.time.LocalDate.parse(..., DateTimeFormatter.ofPattern("MM/dd/yyyy")) with try/catch for format errors, plus an isBefore/isEqual comparison. Not currently called by any of the 6 primary onboarding APIs analyzed above (it is defined under wasataOnboarding/utils and is presumably invoked by other flows in the broader package), but should be ported as a shared utility since the pattern likely recurs.

# 3. Service Specifications

## 3.1 createCustomer

Creates (onboards) a new main client/customer record in the core system. Accepts the full customer KYC profile (personal/legal information, address, identification documents, chamber-of-commerce and board-resolution data for corporate clients, background-check and face-verification results, client classification, suitability/appropriateness questionnaire answers, CRS tax data, and selected products) and forwards it to the FIT core-banking system, returning the newly created client ID.

### 3.1.1 Endpoint

| **Attribute** | **Detail** |
| --- | --- |
| HTTP Method | POST |
| Path | /wasataOnboarding/createCustomer |
| Content Type | application/json |
| Authentication | Not enforced by the legacy service itself — confirm the gateway/API Manager policy layer in front of this endpoint. |
| webMethods service | CRM.services.wasataOnboarding:createCustomer |

### 3.1.2 Request Body

| **Field (indentation shows nesting)** | **Notes** |
| --- | --- |
| `(entire signature = doc ref) CRM.documents.wasata.nativeDocs:createCustomerNativeRequest` |  |
| `    ClientInformation: CRM.documents.wasata.nativeDocs:clientInformation  (ref)` | Nested group |
| `        businessline: string` |  |
| `        clientId: string` |  |
| `        fundAgreement: string` |  |
| `        fundAgreementSavings: string` |  |
| `        emailAddress: string` |  |
| `        mobileNumber: string` |  |
| `        Residency: string` |  |
| `        preventTrading: string` |  |
| `        gender: string` |  |
| `        etihadGuestNumber: string` |  |
| `        cityOfBirth: string` |  |
| `        dateOfBirth: string` |  |
| `        placeOfBirth: string` |  |
| `        countryOfResidency: string` |  |
| `        relationshipWithBank: string` |  |
| `        secondNationality: string` |  |
| `        thirdNationality: string` |  |
| `        nationality: string` |  |
| `        typeOfInvestment: string` |  |
| `        expectedDepositAmount: string` |  |
| `        expectedCurrency: string` |  |
| `        createdUser: string` |  |
| `        createdDate: string` |  |
| `        contractNo: string` |  |
| `        NationalNo: string` |  |
| `        mainRelationshipManager: string` |  |
| `        lastUpdateDate: string` |  |
| `        importantNote: string` |  |
| `        residentialTelephone: string` |  |
| `        fax: string` |  |
| `        mobileNo2: string[]` |  |
| `        motherName: string` |  |
| `        zipCode: string` |  |
| `        officeAddressEn: string` |  |
| `        officeAddressAr: string` |  |
| `        remarks: string` |  |
| `        useOverAllFacilityLimit: string` |  |
| `        legalStatus: string` |  |
| `        accountsInOtherSecurityfirms: string` |  |
| `        accountInOtherSecurityFirmsm: string` |  |
| `        region: string` |  |
| `        taxRegistrationNumber: string` |  |
| `        blackListed: string` |  |
| `        preventTrading: string` |  |
| `        groupClient: string` |  |
| `        nomineeClient: string` |  |
| `        language: string` |  |
| `        consolidatedStatementDaily: string` |  |
| `        consolidatedStatementMonthly: string` |  |
| `        consolidatedDailyEPL: string` |  |
| `        consolidatedDailySOA: string` |  |
| `        consolidatedDailyInvoice: string` |  |
| `        consolidatedWeeklyEPL: string` |  |
| `        consolidatedWeeklySOA: string` |  |
| `        useSingleAccountConcept: string` |  |
| `        entitlAdvancedcomission: string` |  |
| `        preventWithdrawing: string` |  |
| `        onlineAgreement: string` |  |
| `        proofEmploymentProvided: string` |  |
| `        proofAddressProvided: string` |  |
| `        proofIdProvided: string` |  |
| `        proofBankProvided: string` |  |
| `        accountOpenFormAvaliable: string` |  |
| `        readyIPO: string` |  |
| `        isCRS: string` |  |
| `        useRiskMngAccounts: string` |  |
| `        isMigrationEligible: string` |  |
| `        clientClassificationExpiry: string` |  |
| `        clientClassificationDate: string` |  |
| `        screeningReference: string` |  |
| `        monitoringID: string` |  |
| `        pep: string` |  |
| `        sanction: string` |  |
| `        overallClass: string` |  |
| `        enableFacility: string` |  |
| `        branch: string` |  |
| `        clientType: string` |  |
| `        communicationCompany: string[]` |  |
| `        potentialPEPSanctionFlag: string` |  |
| `        title: string` |  |
| `        status: string` |  |
| `        nameEn: string` |  |
| `        nameAr: string` |  |
| `        hasPOA: string` |  |
| `        poaenglish: string` |  |
| `        poaarabic: string` |  |
| `        isFinoux: string` |  |
| `        is_DFM_Client: string` |  |
| `    Address: CRM.documents.wasata.nativeDocs:address  (ref)` | Nested group |
| `        country: string` |  |
| `        city: string` |  |
| `        residentialAddressEn: string` |  |
| `        residentialAddressAr: string` |  |
| `        pobox: string` |  |
| `        flatBuildingNo: string` |  |
| `    BoardResolution: CRM.documents.wasata.nativeDocs:boardResolution[]  (ref)` | Nested group |
| `        bResolutionIssueDate: string` |  |
| `        bResolutionExpiryDate: string` |  |
| `    ChamberOfCommerce: CRM.documents.wasata.nativeDocs:chamberOfCommerce  (ref)` | Nested group |
| `        ccMembershipNo: string` |  |
| `        ccExpiryDate: string` |  |
| `        ccIssueDate: string` |  |
| `    ClientClassification: CRM.documents.wasata.nativeDocs:clientClassification  (ref)` | Nested group |
| `        systemGeneratedClientClassification: string` |  |
| `        selectedClientClassification: string` |  |
| `        isCreditFacility: string` |  |
| `        isLicensedByAuthority: string` |  |
| `    BackgroundCheck: CRM.documents.wasata.nativeDocs:backgroundCheck  (ref)` | Nested group |
| `        bcsMatch: string` |  |
| `        bcsMonitoringID: string` |  |
| `        bcsSessionID: string` |  |
| `    FaceVerification: CRM.documents.wasata.nativeDocs:faceVerification  (ref)` | Nested group |
| `        fvAuditTrailImageID: string` |  |
| `        fvMatch: string` |  |
| `        fvMatchLevel: string` |  |
| `        fvSessionID: string` |  |
| `    IDType: CRM.documents.wasata.nativeDocs:idTypes  (ref)` | Nested group |
| `        EIDmrzText: string` |  |
| `        EIDfrontAnalysis: string` |  |
| `        EIDbackAnalysis: string` |  |
| `        EIDsessionID: string` |  |
| `        PPanalysis: string` |  |
| `        PPmrzText: string` |  |
| `        PPsessionID: string` |  |
| `        ID1Type: string` |  |
| `        ID1No: string` |  |
| `        ID1IssuePlace: string` |  |
| `        ID1Issuance: string` |  |
| `        ID1Validity: string` |  |
| `        ID2Type: string` |  |
| `        ID2No: string` |  |
| `        ID2IssuePlace: string` |  |
| `        ID2Issuance: string` |  |
| `        ID2Validity: string` |  |
| `        nationality: string` |  |
| `    ClientSuitabilityAppropriateness: CRM.documents.wasata.nativeDocs:clientSuitabilityAppropriateness  (ref)` | Nested group |
| `        equitiesExperience: string` |  |
| `        fixedIncomeExperience1: string` |  |
| `        leveragedProductsExperience: string` |  |
| `        financialDerivativesExperience: string` |  |
| `        financialInstruments: string[]` |  |
| `        investmentExtent: string` |  |
| `        investmentFrequency: string` |  |
| `        attitudeToFinancialInstruments: string` |  |
| `        industry: string` |  |
| `        currentOccupation: string` |  |
| `        currentEmployerDetails: string` |  |
| `        otherOccupation: string` |  |
| `        previousOccupation: string` |  |
| `        previousEmployerDetails: string` |  |
| `        sourceOfFund: string[]` |  |
| `        otherSourceOfFund: string` |  |
| `        annualIncome: string` |  |
| `        annualIncomeCurrency: string` |  |
| `        netAssets: string` |  |
| `        netAssetsCurrency: string` |  |
| `        financialObligations: string` |  |
| `        riskTolerance: string` |  |
| `        netWorthToInvest: string` |  |
| `        investmentAttitude: string` |  |
| `        investmentObjectives: string[]` |  |
| `        fixedIncomeExperience: string` |  |
| `        structuredProductsExperience: string` |  |
| `        futureFinancialInstruments: string[]` |  |
| `        futinvestmentHorizon: string` |  |
| `        futureInvestmentStrategy: string` |  |
| `        investmentExperienceExtent: string` |  |
| `        investmentHorizon: string` |  |
| `        systemGeneratedRiskAppetite: string` |  |
| `        selectedRiskAppetite: string` |  |
| `        futureEquitiesExperience: string` |  |
| `        futureFinancialDerivativesExperience: string` |  |
| `        investmentAmount: string` |  |
| `        currentEmployerAddress: string` |  |
| `        percentageForInvestment: string` |  |
| `    CRS: CRM.documents.wasata.nativeDocs:crs  (ref)` | Nested group |
| `        TIN: string` |  |
| `        whynotin: string` |  |
| `        reasonwhynotin: string` |  |
| `        country: string` |  |
| `    ProductSelection: CRM.documents.wasata.nativeDocs:productSelection  (ref)` | Nested group |
| `        systemGeneratedProductsSelection: string[]` |  |
| `        selectedProducts: string[]` |  |

**Sample:**

```json
{
  "ClientInformation": { "clientId": "", "emailAddress": "jane.doe@example.com",
    "mobileNumber": "9715xxxxxxx", "Residency": "Y", "nameAr": "جين", "gender": "F",
    "dateOfBirth": "1990-05-14", "createdUser": "onboarding.portal" /* ...additional fields, see table */ },
  "Address": { "residentialAddressEn": "123 Sheikh Zayed Rd, Dubai" /* ... */ },
  "IDType": { "ID1Type": "PASSPORT", "ID1No": "A1234567", "ID1Validity": "2030-01-01" },
  "ProductSelection": { "selectedProducts": ["TRADING"], "systemGeneratedProductsSelection": [] },
  "ClientSuitabilityAppropriateness": { "financialInstruments": [], "sourceOfFund": [], "investmentObjectives": [] },
  "BoardResolution": { }, "ChamberOfCommerce": { }, "ClientClassification": { },
  "BackgroundCheck": { }, "FaceVerification": { }, "CRS": { }
}
```

### 3.1.3 Response Body

Rows are shaded by nesting depth: a field of Type “Document” is itself a nested object, and its children are the rows immediately below it at the next depth.

| **Field** | **Type** | **Notes** |
| --- | --- | --- |
| `responseCode` | string | Mirrors the actual HTTP status code returned in the header, as a string. Always present. |
| `responseMessage` | string | Mirrors the actual HTTP reason phrase. Always present. |
| `errorCode` | string \| null | App-level error code, populated only for client-input errors (see Error Code Reference); null on success and null on backend/provider errors. |
| `errorMsg` | string \| null | Human-readable client-input error description; null on success and null on backend/provider errors (server-log-only in that case). |
| `correlationID` | string | Request correlation ID (caller-supplied or generated). Always present. |
| `    ↳ response` | *Document* | Wrapper object holding the domain payload. Always present; its child fields are null on any error. |
| `        ↳ clientId` | string | Populated on success; null on any error. |

**Sample — Success:**

```json
{
  "responseCode": "200",
  "responseMessage": "OK",
  "errorCode": null,
  "errorMsg": null,
  "correlationID": "a1b2c3d4-...",
  "response": { "clientId": "CL0001234" }
}
```

**Sample — Client Input Error:**

```json
{
  "responseCode": "400",
  "responseMessage": "Bad Request",
  "errorCode": "CUC-V-002",
  "errorMsg": "emailAddress is mandatory",
  "correlationID": "a1b2c3d4-...",
  "response": { "clientId": null }
}
```

**Sample — Backend/Provider Error:**

```json
{
  "responseCode": "502",
  "responseMessage": "Bad Gateway",
  "errorCode": null,
  "errorMsg": null,
  "correlationID": "a1b2c3d4-...",
  "response": { "clientId": null }
}
```

### 3.1.4 Response Headers — HTTP Status Codes

| **HTTP Status** | **Reason Phrase** | **Meaning** |
| --- | --- | --- |
| 200 | OK | Customer created; response.clientId is populated. |
| 400 | Bad Request | A mandatory KYC field failed validation (CUC-V-001..007). |
| 502 | Bad Gateway | FIT rejected the request or returned a business error, or the FIT token could not be obtained (CUC-B-001/002). |
| 503 | Service Unavailable | An unhandled internal exception occurred (CUC-B-003). |

### 3.1.5 Business & Validation Logic

1. Generate a correlationID via commonUtility.java:GenerateGUID if the caller did not supply one; capture the request timestamp (pattern yyyy-MM-dd HH:mm:ss.SSS, timezone GMT+4).
1. Re-wrap the flat top-level input groups (ClientInformation, Address, BoardResolution, ChamberOfCommerce, ClientClassification, BackgroundCheck, FaceVerification, IDType, CRS, ProductSelection, ClientSuitabilityAppropriateness) into a single nested 'customerRequest' document that mirrors the FIT createCustomerNativeRequest shape, then delete the original top-level variables.
1. Validate mandatory fields (see Validation Rules) using CRM.services.utils:checkAndThrowError, which aborts the flow with a '1069 ...' message on the first failing rule.
1. Data normalization/preparation: truncate customerRequest.ClientInformation.createdUser to its first 20 characters (pub.string:substring, beginIndex=0, endIndex=20) if present.
1. For each of the following list/array fields, if the array is empty/absent, explicitly initialize it to an empty list so it always serializes as [] rather than being omitted: ClientInformation.mobileNo2, ClientInformation.communicationCompany, ClientSuitabilityAppropriateness.financialInstruments, ClientSuitabilityAppropriateness.futureFinancialInstruments, ClientSuitabilityAppropriateness.sourceOfFund, ClientSuitabilityAppropriateness.investmentObjectives, ProductSelection.systemGeneratedProductsSelection.
1. Serialize the assembled customerRequest document to a JSON string (requestString) via pub.json:documentToJSONString; if that fails or produces nothing, default requestString to '{ }'.
1. Call CRM.services.utils:getFITToken to obtain a bearer access token from FIT (see Shared Services section).
1. If the token call returned statusCode=200: look up the FIT base URL from static configuration (application=MIDDLEWARE, key=ETRADE_BASE_URL), then issue an HTTP POST to '<baseUrl>/IntegrationAPI/IntegrationWServices/CRM_CreateMainCustomer' with header Content-Type: application/json and header access-token: <token>, body = requestString.
1. Convert the raw HTTP response bytes to a string (responseString).
1. If the HTTP response status header = 200: parse responseString as JSON (resDoc). If resDoc contains no errors, set responseCode='200', responseMessage='success', and map resDoc.mainClientId → response.clientId. If resDoc contains an 'errors' array, join all error strings with ',' into responseMessage and set responseCode='1018'.
1. If the HTTP response status header != 200: copy the HTTP response header's status/statusMessage into responseCode/responseMessage.
1. If the token call did NOT return statusCode=200: set responseCode='1018', responseMessage='Failed To Get Token from FIT', and copy the token error message into responseString.
1. Catch block (any uncaught FAILURE): if the exception message contains '1069', strip the literal prefix 'Middleware system validation error : ' from it and use the remainder as responseMessage with responseCode='1069'; otherwise set responseCode='500', responseMessage='Internal Server Error'.
1. Finally block (always executes): capture responseTimestamp, fire-and-forget async audit log to SEQDatalust.services:asynchronousIngestion with serviceName='CRM.services.wasataOnboarding:createCustomer', requestBody=requestString, responseBody=responseString; then clear the pipeline, preserving only correlationID.

### 3.1.6 Validation Rules

| **Field / condition** | **Error code** | **Message / rule** |
| --- | --- | --- |
| customerRequest.ClientInformation present | - | Block only entered if ClientInformation is non-null. |
| customerRequest.ClientInformation.nameAr | 1069 | "1069 nameAr is mandatory when Residency is Y" — only enforced when ClientInformation.Residency = 'Y'. |
| customerRequest.ClientInformation.emailAddress | 1069 | "1069 emailAddress is mandatory" |
| customerRequest.Address.residentialAddressEn | 1069 | "1069 residentialAddressEn is mandatory" |
| customerRequest.IDType.ID1Type | 1069 | "1069 ID1Type is mandatory" |
| customerRequest.IDType.ID1No | 1069 | "1069 ID1No is mandatory" |
| customerRequest.IDType.ID1Validity | 1069 | "1069 ID1Validity is mandatory" |
| customerRequest.ProductSelection.selectedProducts[0] | 1069 | "1069 selectedProducts is mandatory" — checks the first array element exists. |

### 3.1.7 Field-Level Mapping

Because the input document (createCustomerNativeRequest) already has the same field/group names as the FIT payload, the mapping is effectively a structural re-nest under a 'customerRequest' wrapper plus the specific normalizations listed in the steps above — there is no large field-renaming table as there is for the sub-account APIs.

### 3.1.8 External Dependency & Configuration

| **Attribute** | **Value** |
| --- | --- |
| Purpose | Create main customer in FIT |
| Method | POST |
| URL | {ETRADE_BASE_URL}/IntegrationAPI/IntegrationWServices/CRM_CreateMainCustomer |
| Headers | Content-Type: application/json; access-token: <FIT bearer token> |
| Body | JSON-serialized customerRequest |
| Success mapping | mainClientId → response.clientId |

### 3.1.9 Error Code Reference

**_Client Input Errors — errorCode/errorMsg returned_**

*Caused by the caller's own input; the specific reason is safe to return.*

| **errorCode** | **responseCode / responseMessage** | **errorMsg (returned)** |
| --- | --- | --- |
| CUC-V-001 | 400 / Bad Request | nameAr is mandatory |
| CUC-V-002 | 400 / Bad Request | emailAddress is mandatory |
| CUC-V-003 | 400 / Bad Request | residentialAddressEn is mandatory |
| CUC-V-004 | 400 / Bad Request | ID1Type is mandatory |
| CUC-V-005 | 400 / Bad Request | ID1No is mandatory |
| CUC-V-006 | 400 / Bad Request | ID1Validity is mandatory |
| CUC-V-007 | 400 / Bad Request | selectedProducts is mandatory |

**_Backend / Provider Errors — errorCode/errorMsg left null_**

*Caused by this service's own infrastructure or its upstream dependency, not the caller's input — never surfaced via errorCode/errorMsg; detail is written to the server log only, keyed by correlationID.*

| **Internal code** | **responseCode / responseMessage** | **Logged detail only — never returned** |
| --- | --- | --- |
| CUC-B-001 | 502 / Bad Gateway | FIT returned a business error (errors[] array) or a non-200 downstream status while creating the customer. |
| CUC-B-002 | 502 / Bad Gateway | Unable to obtain a FIT bearer access token (see getFITToken, §2.2). |
| CUC-B-003 | 503 / Service Unavailable | Unhandled exception in the create-customer flow. |

### 3.1.10 Implementation Notes

- The legacy flow already produces a rich '1069 <field> is mandatory' message per rule; the CUC-V-00x codes above are new stable identifiers introduced for this migration so client code can branch on errorCode rather than parsing errorMsg text — confirm this scheme with the API-consumer team before implementation.
- createdUser is silently truncated to 20 characters before being sent to FIT (pub.string:substring) — preserve this truncation in the target unless FIT's own field length has since changed.
- Several array fields (mobileNo2, communicationCompany, financialInstruments, futureFinancialInstruments, sourceOfFund, investmentObjectives, systemGeneratedProductsSelection) are explicitly forced to '[]' rather than omitted when empty — Jackson's default (de)serialization already does this for empty Java collections, so no special-casing should be needed in the target, but verify FIT does not distinguish '[]' from an absent field.
- The legacy service always returns HTTP 200 at the transport level regardless of the business outcome (no explicit HTTP-status-setting step exists in the flow) — the target design above (responseCode/responseMessage mirroring the real HTTP status) is a deliberate modernization; confirm with API consumers before changing the transport-level status code, since existing legacy callers may only inspect the body.

## 3.2 updateCustomer

Updates an existing customer's KYC/profile data in the core system. Structurally identical request and processing logic to createCustomer — same input document shape (re-based on updateCustomerNativeRequest, same field names) and the same validation, normalization, token, and response-handling logic — the only functional differences are the downstream FIT endpoint invoked and the fact that no CRS/ProductSelection re-nesting step is required for the update wrapper (ClientInformation/Address/BoardResolution/ChamberOfCommerce/ClientClassification/BackgroundCheck/FaceVerification/IDType/ClientSuitabilityAppropriateness/CRS/ProductSelection are copied the same way).

### 3.2.1 Endpoint

| **Attribute** | **Detail** |
| --- | --- |
| HTTP Method | POST |
| Path | /wasataOnboarding/updateCustomer |
| Content Type | application/json |
| Authentication | Not enforced by the legacy service itself — confirm the gateway/API Manager policy layer in front of this endpoint. |
| webMethods service | CRM.services.wasataOnboarding:updateCustomer |

### 3.2.2 Request Body

| **Field (indentation shows nesting)** | **Notes** |
| --- | --- |
| `(entire signature = doc ref) CRM.documents.wasata.nativeDocs:updateCustomerNativeRequest` |  |
| `    ClientInformation: CRM.documents.wasata.nativeDocs:clientInformation  (ref)` | Nested group |
| `        businessline: string` |  |
| `        clientId: string` |  |
| `        fundAgreement: string` |  |
| `        fundAgreementSavings: string` |  |
| `        emailAddress: string` |  |
| `        mobileNumber: string` |  |
| `        Residency: string` |  |
| `        preventTrading: string` |  |
| `        gender: string` |  |
| `        etihadGuestNumber: string` |  |
| `        cityOfBirth: string` |  |
| `        dateOfBirth: string` |  |
| `        placeOfBirth: string` |  |
| `        countryOfResidency: string` |  |
| `        relationshipWithBank: string` |  |
| `        secondNationality: string` |  |
| `        thirdNationality: string` |  |
| `        nationality: string` |  |
| `        typeOfInvestment: string` |  |
| `        expectedDepositAmount: string` |  |
| `        expectedCurrency: string` |  |
| `        createdUser: string` |  |
| `        createdDate: string` |  |
| `        contractNo: string` |  |
| `        NationalNo: string` |  |
| `        mainRelationshipManager: string` |  |
| `        lastUpdateDate: string` |  |
| `        importantNote: string` |  |
| `        residentialTelephone: string` |  |
| `        fax: string` |  |
| `        mobileNo2: string[]` |  |
| `        motherName: string` |  |
| `        zipCode: string` |  |
| `        officeAddressEn: string` |  |
| `        officeAddressAr: string` |  |
| `        remarks: string` |  |
| `        useOverAllFacilityLimit: string` |  |
| `        legalStatus: string` |  |
| `        accountsInOtherSecurityfirms: string` |  |
| `        accountInOtherSecurityFirmsm: string` |  |
| `        region: string` |  |
| `        taxRegistrationNumber: string` |  |
| `        blackListed: string` |  |
| `        preventTrading: string` |  |
| `        groupClient: string` |  |
| `        nomineeClient: string` |  |
| `        language: string` |  |
| `        consolidatedStatementDaily: string` |  |
| `        consolidatedStatementMonthly: string` |  |
| `        consolidatedDailyEPL: string` |  |
| `        consolidatedDailySOA: string` |  |
| `        consolidatedDailyInvoice: string` |  |
| `        consolidatedWeeklyEPL: string` |  |
| `        consolidatedWeeklySOA: string` |  |
| `        useSingleAccountConcept: string` |  |
| `        entitlAdvancedcomission: string` |  |
| `        preventWithdrawing: string` |  |
| `        onlineAgreement: string` |  |
| `        proofEmploymentProvided: string` |  |
| `        proofAddressProvided: string` |  |
| `        proofIdProvided: string` |  |
| `        proofBankProvided: string` |  |
| `        accountOpenFormAvaliable: string` |  |
| `        readyIPO: string` |  |
| `        isCRS: string` |  |
| `        useRiskMngAccounts: string` |  |
| `        isMigrationEligible: string` |  |
| `        clientClassificationExpiry: string` |  |
| `        clientClassificationDate: string` |  |
| `        screeningReference: string` |  |
| `        monitoringID: string` |  |
| `        pep: string` |  |
| `        sanction: string` |  |
| `        overallClass: string` |  |
| `        enableFacility: string` |  |
| `        branch: string` |  |
| `        clientType: string` |  |
| `        communicationCompany: string[]` |  |
| `        potentialPEPSanctionFlag: string` |  |
| `        title: string` |  |
| `        status: string` |  |
| `        nameEn: string` |  |
| `        nameAr: string` |  |
| `        hasPOA: string` |  |
| `        poaenglish: string` |  |
| `        poaarabic: string` |  |
| `        isFinoux: string` |  |
| `        is_DFM_Client: string` |  |
| `    Address: CRM.documents.wasata.nativeDocs:address  (ref)` | Nested group |
| `        country: string` |  |
| `        city: string` |  |
| `        residentialAddressEn: string` |  |
| `        residentialAddressAr: string` |  |
| `        pobox: string` |  |
| `        flatBuildingNo: string` |  |
| `    BoardResolution: CRM.documents.wasata.nativeDocs:boardResolution[]  (ref)` | Nested group |
| `        bResolutionIssueDate: string` |  |
| `        bResolutionExpiryDate: string` |  |
| `    ChamberOfCommerce: CRM.documents.wasata.nativeDocs:chamberOfCommerce  (ref)` | Nested group |
| `        ccMembershipNo: string` |  |
| `        ccExpiryDate: string` |  |
| `        ccIssueDate: string` |  |
| `    ClientClassification: CRM.documents.wasata.nativeDocs:clientClassification  (ref)` | Nested group |
| `        systemGeneratedClientClassification: string` |  |
| `        selectedClientClassification: string` |  |
| `        isCreditFacility: string` |  |
| `        isLicensedByAuthority: string` |  |
| `    BackgroundCheck: CRM.documents.wasata.nativeDocs:backgroundCheck  (ref)` | Nested group |
| `        bcsMatch: string` |  |
| `        bcsMonitoringID: string` |  |
| `        bcsSessionID: string` |  |
| `    FaceVerification: CRM.documents.wasata.nativeDocs:faceVerification  (ref)` | Nested group |
| `        fvAuditTrailImageID: string` |  |
| `        fvMatch: string` |  |
| `        fvMatchLevel: string` |  |
| `        fvSessionID: string` |  |
| `    IDType: CRM.documents.wasata.nativeDocs:idTypes  (ref)` | Nested group |
| `        EIDmrzText: string` |  |
| `        EIDfrontAnalysis: string` |  |
| `        EIDbackAnalysis: string` |  |
| `        EIDsessionID: string` |  |
| `        PPanalysis: string` |  |
| `        PPmrzText: string` |  |
| `        PPsessionID: string` |  |
| `        ID1Type: string` |  |
| `        ID1No: string` |  |
| `        ID1IssuePlace: string` |  |
| `        ID1Issuance: string` |  |
| `        ID1Validity: string` |  |
| `        ID2Type: string` |  |
| `        ID2No: string` |  |
| `        ID2IssuePlace: string` |  |
| `        ID2Issuance: string` |  |
| `        ID2Validity: string` |  |
| `        nationality: string` |  |
| `    ClientSuitabilityAppropriateness: CRM.documents.wasata.nativeDocs:clientSuitabilityAppropriateness  (ref)` | Nested group |
| `        equitiesExperience: string` |  |
| `        fixedIncomeExperience1: string` |  |
| `        leveragedProductsExperience: string` |  |
| `        financialDerivativesExperience: string` |  |
| `        financialInstruments: string[]` |  |
| `        investmentExtent: string` |  |
| `        investmentFrequency: string` |  |
| `        attitudeToFinancialInstruments: string` |  |
| `        industry: string` |  |
| `        currentOccupation: string` |  |
| `        currentEmployerDetails: string` |  |
| `        otherOccupation: string` |  |
| `        previousOccupation: string` |  |
| `        previousEmployerDetails: string` |  |
| `        sourceOfFund: string[]` |  |
| `        otherSourceOfFund: string` |  |
| `        annualIncome: string` |  |
| `        annualIncomeCurrency: string` |  |
| `        netAssets: string` |  |
| `        netAssetsCurrency: string` |  |
| `        financialObligations: string` |  |
| `        riskTolerance: string` |  |
| `        netWorthToInvest: string` |  |
| `        investmentAttitude: string` |  |
| `        investmentObjectives: string[]` |  |
| `        fixedIncomeExperience: string` |  |
| `        structuredProductsExperience: string` |  |
| `        futureFinancialInstruments: string[]` |  |
| `        futinvestmentHorizon: string` |  |
| `        futureInvestmentStrategy: string` |  |
| `        investmentExperienceExtent: string` |  |
| `        investmentHorizon: string` |  |
| `        systemGeneratedRiskAppetite: string` |  |
| `        selectedRiskAppetite: string` |  |
| `        futureEquitiesExperience: string` |  |
| `        futureFinancialDerivativesExperience: string` |  |
| `        investmentAmount: string` |  |
| `        currentEmployerAddress: string` |  |
| `        percentageForInvestment: string` |  |
| `    CRS: CRM.documents.wasata.nativeDocs:crs  (ref)` | Nested group |
| `        TIN: string` |  |
| `        whynotin: string` |  |
| `        reasonwhynotin: string` |  |
| `        country: string` |  |
| `    ProductSelection: CRM.documents.wasata.nativeDocs:productSelection  (ref)` | Nested group |
| `        systemGeneratedProductsSelection: string[]` |  |
| `        selectedProducts: string[]` |  |

**Sample:**

```text
Identical shape to createCustomer's request body (§3.1.2) — same groups and field names, sent to a different FIT endpoint. See the Input Structure table below for the complete field list.
```

### 3.2.3 Response Body

Rows are shaded by nesting depth: a field of Type “Document” is itself a nested object, and its children are the rows immediately below it at the next depth.

| **Field** | **Type** | **Notes** |
| --- | --- | --- |
| `responseCode` | string | Mirrors the actual HTTP status code returned in the header, as a string. Always present. |
| `responseMessage` | string | Mirrors the actual HTTP reason phrase. Always present. |
| `errorCode` | string \| null | App-level error code, populated only for client-input errors (see Error Code Reference); null on success and null on backend/provider errors. |
| `errorMsg` | string \| null | Human-readable client-input error description; null on success and null on backend/provider errors (server-log-only in that case). |
| `correlationID` | string | Request correlation ID (caller-supplied or generated). Always present. |
| `    ↳ response` | *Document* | Wrapper object holding the domain payload. Always present; its child fields are null on any error. |
| `        ↳ clientId` | string | Populated on success; null on any error. |

**Sample — Success:**

```json
{
  "responseCode": "200", "responseMessage": "OK", "errorCode": null, "errorMsg": null,
  "correlationID": "a1b2c3d4-...", "response": { "clientId": "CL0001234" }
}
```

**Sample — Client Input Error:**

```json
{
  "responseCode": "400", "responseMessage": "Bad Request", "errorCode": "UPC-V-003",
  "errorMsg": "residentialAddressEn is mandatory", "correlationID": "a1b2c3d4-...",
  "response": { "clientId": null }
}
```

**Sample — Backend/Provider Error:**

```json
{
  "responseCode": "502", "responseMessage": "Bad Gateway", "errorCode": null, "errorMsg": null,
  "correlationID": "a1b2c3d4-...", "response": { "clientId": null }
}
```

### 3.2.4 Response Headers — HTTP Status Codes

| **HTTP Status** | **Reason Phrase** | **Meaning** |
| --- | --- | --- |
| 200 | OK | Customer updated; response.clientId is populated. |
| 400 | Bad Request | A mandatory KYC field failed validation (UPC-V-001..006). |
| 502 | Bad Gateway | FIT rejected the request or returned a business error, or the FIT token could not be obtained (UPC-B-001/002). |
| 503 | Service Unavailable | An unhandled internal exception occurred (UPC-B-003). |

### 3.2.5 Business & Validation Logic

1. Identical flow to createCustomer steps 1–7 (correlationID/timestamp, re-nest into 'customerRequest', mandatory-field validation, createdUser truncation, empty-array normalization, JSON serialization).
1. Call CRM.services.utils:getFITToken to obtain a bearer token.
1. If token call returned statusCode=200: look up ETRADE_BASE_URL from static configuration, then POST the JSON body to '<baseUrl>/IntegrationAPI/IntegrationWServices/CRM_UPDATEMainCustomer' with headers Content-Type: application/json and access-token: <token>.
1. Convert response bytes to string; if HTTP status = 200, parse as JSON. If no errors, responseCode='200', responseMessage='success', map resDoc.mainClientId → response.clientId. If an 'errors' array is present, join with ',' into responseMessage, responseCode='1018'.
1. If HTTP status != 200, copy header status/statusMessage into responseCode/responseMessage.
1. If token acquisition failed, responseCode='1018', responseMessage='Failed To Get Token from FIT', responseString = token error message.
1. Same catch/finally handling as createCustomer, with serviceName='CRM.services.wasataOnboarding:updateCustomer' in the audit log.

### 3.2.6 Validation Rules

| **Field / condition** | **Error code** | **Message / rule** |
| --- | --- | --- |
| customerRequest.ClientInformation.nameAr | 1069 | "1069 nameAr is mandatory when Residency is Y" — only when Residency = 'Y'. |
| customerRequest.ClientInformation.emailAddress | 1069 | "1069 emailAddress is mandatory" |
| customerRequest.Address.residentialAddressEn | 1069 | "1069 residentialAddressEn is mandatory" |
| customerRequest.IDType.ID1Type | 1069 | "1069 ID1Type is mandatory" |
| customerRequest.IDType.ID1No | 1069 | "1069 ID1No is mandatory" |
| customerRequest.IDType.ID1Validity | 1069 | "1069 ID1Validity is mandatory" |

### 3.2.7 Field-Level Mapping

Identical structural re-nesting to createCustomer — see that section's mapping note. The only DTO difference is the outer FIT document type name (updateCustomerNativeRequest vs createCustomerNativeRequest); field names and nesting are otherwise identical.

### 3.2.8 External Dependency & Configuration

| **Attribute** | **Value** |
| --- | --- |
| Purpose | Update main customer in FIT |
| Method | POST |
| URL | {ETRADE_BASE_URL}/IntegrationAPI/IntegrationWServices/CRM_UPDATEMainCustomer |
| Headers | Content-Type: application/json; access-token: <FIT bearer token> |
| Body | JSON-serialized customerRequest |
| Success mapping | mainClientId → response.clientId |

### 3.2.9 Error Code Reference

**_Client Input Errors — errorCode/errorMsg returned_**

*Caused by the caller's own input; the specific reason is safe to return.*

| **errorCode** | **responseCode / responseMessage** | **errorMsg (returned)** |
| --- | --- | --- |
| UPC-V-001 | 400 / Bad Request | nameAr is mandatory |
| UPC-V-002 | 400 / Bad Request | emailAddress is mandatory |
| UPC-V-003 | 400 / Bad Request | residentialAddressEn is mandatory |
| UPC-V-004 | 400 / Bad Request | ID1Type is mandatory |
| UPC-V-005 | 400 / Bad Request | ID1No is mandatory |
| UPC-V-006 | 400 / Bad Request | ID1Validity is mandatory |

**_Backend / Provider Errors — errorCode/errorMsg left null_**

*Caused by this service's own infrastructure or its upstream dependency, not the caller's input — never surfaced via errorCode/errorMsg; detail is written to the server log only, keyed by correlationID.*

| **Internal code** | **responseCode / responseMessage** | **Logged detail only — never returned** |
| --- | --- | --- |
| UPC-B-001 | 502 / Bad Gateway | FIT returned a business error (errors[] array) or a non-200 downstream status while updating the customer. |
| UPC-B-002 | 502 / Bad Gateway | Unable to obtain a FIT bearer access token (see getFITToken, §2.2). |
| UPC-B-003 | 503 / Service Unavailable | Unhandled exception in the update-customer flow. |

### 3.2.10 Implementation Notes

- Shares its request/response DTOs and mapping logic with createCustomer (§3.1) — implement as one shared mapper/DTO pair, not a duplicate.
- The legacy flow validates the same 6 mandatory fields as createCustomer minus 'selectedProducts is mandatory' (that rule is create-only) — confirm this asymmetry is intentional and not a legacy gap before finalizing UPC-V-00x.
- Same HTTP-200-always transport caveat as createCustomer (§3.1, Implementation Notes) applies here.

## 3.3 createSubAccounts

Creates a trading sub-account under an already-onboarded client. Accepts sub-account information, shareholding disclosure, market-access details, bank details, board-member/insider disclosures, FATCA status, portfolio-management/commission setup, power-of-attorney validity, related parties and access-group permissions, and forwards a re-mapped payload to FIT, returning the new sub-account number.

### 3.3.1 Endpoint

| **Attribute** | **Detail** |
| --- | --- |
| HTTP Method | POST |
| Path | /wasataOnboarding/createSubAccounts  (alias: /wasataOnboarding/createOrUpdateSubAccounts) |
| Content Type | application/json |
| Authentication | Not enforced by the legacy service itself — confirm the gateway/API Manager policy layer in front of this endpoint. |
| webMethods service | CRM.services.wasataOnboarding:createSubAccounts |

### 3.3.2 Request Body

| **Field (indentation shows nesting)** | **Notes** |
| --- | --- |
| `subAccountInformation: CRM.documents.wasata:subAccountInformation  (ref)` | Nested group |
| `    clientID: string` |  |
| `    businessLine: string` |  |
| `    accountNo: string` |  |
| `    clientAr: string` |  |
| `    clientEn: string` |  |
| `    accountType: string` |  |
| `    currency: string` |  |
| `    accNameAr: string` |  |
| `    accNameEn: string` |  |
| `    birthDate: string` |  |
| `    residentialAddressAr: string` |  |
| `    residentialAddressEn: string` |  |
| `    mobileNo: string` |  |
| `    faxNo: string` |  |
| `    poBox: string` |  |
| `    email: string` |  |
| `    sendEmail: string` |  |
| `    sendResearch: string` |  |
| `    sendSms: string` |  |
| `    sendTradeConfirmationSms: string` |  |
| `    tradingType: string` |  |
| `    defaultAccount: string` |  |
| `    dormantAccount: string` |  |
| `    remarks: string` |  |
| `    internationalTrading: string` |  |
| `    status: string` |  |
| `    subAccountType: string` |  |
| `    crmSubAccountNo: string` |  |
| `    commtemplate: string` |  |
| `    enableSweepFacility: string` |  |
| `    mmfAccount: string` |  |
| `    marginTemplate: string` |  |
| `shareHolding: CRM.documents.wasata:shareHolding[]  (ref)` | Nested group |
| `    companyName: string` |  |
| `    holds5PercentOrMore: string` |  |
| `accessGroup: CRM.documents.wasata:accessGroup[]  (ref)` | Nested group |
| `    accessGroup: string` |  |
| `    accessGroup1: string` |  |
| `    accessGroup2: string` |  |
| `    accessGroup3: string` |  |
| `    accessGroup4: string` |  |
| `    accessGroup5: string` |  |
| `    accessGroup6: string` |  |
| `    accessGroup7: string` |  |
| `    accessGroup8: string` |  |
| `    accessGroup9: string` |  |
| `    accessGroup10: string` |  |
| `accessMarket: CRM.documents.wasata:accessMarket[]  (ref)` | Nested group |
| `    market: string` |  |
| `    NINNumber: string` |  |
| `    tradingNumber: string` |  |
| `    accountName: string` |  |
| `    accountType: string` |  |
| `bankInterface: CRM.documents.wasata:bankInterface  (ref)` | Nested group |
| `    bankName: string` |  |
| `    accountBank: string` |  |
| `    bankAccHolderName: string` |  |
| `    branchName: string` |  |
| `    isClientConsentedToShareData: string` |  |
| `    swiftCode: string` |  |
| `    iban: string` |  |
| `    city: string` |  |
| `    country: string` |  |
| `    bankAccAddress: string` |  |
| `    cashDividendPaymentMethod: string` |  |
| `    printName: string` |  |
| `    routeCode: string` |  |
| `    currentSavingAccount: string` |  |
| `    currentSavingAccountCurrency: string` |  |
| `boardMember: CRM.documents.wasata:boardMember  (ref)` | Nested group |
| `    isBoardMember: string` |  |
| `    companyName: string` |  |
| `fatca: CRM.documents.wasata:fatca  (ref)` | Nested group |
| `    isUSPerson: string` |  |
| `    isLiableToPayTaxesInTheUs: string` |  |
| `    isUSIndiciaFound: string` |  |
| `    isDocumentCollected: string` |  |
| `    isDocumentType: string` |  |
| `    customerFatcaClassification: string` |  |
| `portfolioManagement: CRM.documents.wasata:portfolioManagement  (ref)` | Nested group |
| `    portfolioManagement: string` |  |
| `    relationshipManagerBroker: string` |  |
| `    relationManager: string` |  |
| `    classification: string` |  |
| `    reportsLanguage: string` |  |
| `    frequencyOfReports: string[]` |  |
| `    smsLanguage: string` |  |
| `    allowDerivativesTrading: string` |  |
| `    separateFrequencyPosting: string` |  |
| `    custodian: string` |  |
| `    portfolioManagementComission: string` |  |
| `    relationshipManagerComission: string` |  |
| `    tradingType: string` |  |
| `    accountInitiationDate: string` |  |
| `    tradingCategory: string` |  |
| `    investmentAmount: string` |  |
| `    derivativesAccountType: string` |  |
| `    rebateFlag: string` |  |
| `    rebatePercentage: string` |  |
| `    separateFrequencyPosting: string` |  |
| `    lpReportsForms: string` |  |
| `    preformanceFees: string` |  |
| `    minimumFees: string` |  |
| `    accumulatedValue: string` |  |
| `    contractDate: string` |  |
| `    contractEndingDate: string` |  |
| `    contractNo: string` |  |
| `    rebateComissionTemplate: string` |  |
| `    frequencyofRebateComission: string` |  |
| `    eStatement: string` |  |
| `    printStatement: string` |  |
| `    rejectionAccount: string` |  |
| `    sponsorEmailID: string` |  |
| `    guardian: string` |  |
| `    relatedPartyID: string` |  |
| `    buysideBroker: string` |  |
| `    internationalBrokerName: string` |  |
| `    internationalBrokerCustodian: string` |  |
| `    settlementDays: string` |  |
| `    frequencyofPosting: string` |  |
| `    relationshipManagerExpiryDate: string` |  |
| `insider: CRM.documents.wasata:insider  (ref)` | Nested group |
| `    crmId: string` |  |
| `    type: string` |  |
| `    companyName: string` |  |
| `    isBoardMember: string` |  |
| `poa: CRM.documents.wasata:poa  (ref)` | Nested group |
| `    poaValidity: string` |  |
| `relatedParties: CRM.documents.wasata:relatedParties  (ref)` | Nested group |
| `    relatedParty: string` |  |
| `    relatedPartyType: string` |  |
| `    occupation: string` |  |
| `    relationship: string` |  |
| `    relatedStaff: string` |  |

**Sample:**

```json
{
  "subAccountInformation": { "clientID": "CL0001234", "subAccountType": "INDIVIDUAL" /* ... */ },
  "shareHolding": [ { /* ... */ } ],
  "accessMarket": [ { /* ... */ } ],
  "accessGroup": [ { /* ... */ } ],
  "bankInterface": { "iban": "AE070331234567890123456", "swiftCode": "BOMLAEAD", "poBox": "12345" /* ... */ },
  "boardMember": { /* ... */ }, "fatca": { /* ... */ }, "insider": { /* ... */ }, "poa": { /* ... */ },
  "portfolioManagement": { "frequencyOfReports": [] /* ... */ }, "relatedParties": { /* ... */ }
}
```

### 3.3.3 Response Body

Rows are shaded by nesting depth: a field of Type “Document” is itself a nested object, and its children are the rows immediately below it at the next depth.

| **Field** | **Type** | **Notes** |
| --- | --- | --- |
| `responseCode` | string | Mirrors the actual HTTP status code returned in the header, as a string. Always present. |
| `responseMessage` | string | Mirrors the actual HTTP reason phrase. Always present. |
| `errorCode` | string \| null | App-level error code, populated only for client-input errors (see Error Code Reference); null on success and null on backend/provider errors. |
| `errorMsg` | string \| null | Human-readable client-input error description; null on success and null on backend/provider errors (server-log-only in that case). |
| `correlationID` | string | Request correlation ID (caller-supplied or generated). Always present. |
| `    ↳ response` | *Document* | Wrapper object holding the domain payload. Always present; its child fields are null on any error. |
| `        ↳ accountNo` | string | Populated on success; null on any error. |

**Sample — Success:**

```json
{
  "responseCode": "200", "responseMessage": "OK", "errorCode": null, "errorMsg": null,
  "correlationID": "a1b2c3d4-...", "response": { "accountNo": "SA00098765" }
}
```

**Sample — Client Input Error:**

```json
{
  "responseCode": "400", "responseMessage": "Bad Request", "errorCode": "CSA-V-001",
  "errorMsg": "IBAN is mandatory", "correlationID": "a1b2c3d4-...", "response": { "accountNo": null }
}
```

**Sample — Backend/Provider Error:**

```json
{
  "responseCode": "502", "responseMessage": "Bad Gateway", "errorCode": null, "errorMsg": null,
  "correlationID": "a1b2c3d4-...", "response": { "accountNo": null }
}
```

### 3.3.4 Response Headers — HTTP Status Codes

| **HTTP Status** | **Reason Phrase** | **Meaning** |
| --- | --- | --- |
| 200 | OK | Sub-account created; response.accountNo is populated. |
| 400 | Bad Request | IBAN missing while bank-interface data was supplied (CSA-V-001). |
| 502 | Bad Gateway | FIT rejected the request / returned a business error, or the FIT token could not be obtained (CSA-B-001/002). |
| 503 | Service Unavailable | An unhandled internal exception occurred (CSA-B-003). |

### 3.3.5 Business & Validation Logic

1. Generate correlationID (if absent) and capture requestTimestamp, as in createCustomer.
1. Normalize portfolioManagement.frequencyOfReports to an empty list if empty/absent.
1. Validate: bankInterface.iban is mandatory when the bankInterface group is present ("1069 IBAN is mandatory").
1. Call CRM.services.utils:getFITToken.
1. If token call returns statusCode=200: build the 'createSubAccountRequest' document by copying ~119 discrete fields from the 11 flat input groups (subAccountInformation, shareHolding, accessMarket, bankInterface, boardMember, fatca, portfolioManagement, insider, poa, relatedParties, accessGroup) into the nested FIT structure (SubAccountInformation, ShareHolding, AccessMarket, BankDetails, BoardMember, Fatca, PortfolioManagement, POA, RelatedParties, Insider, AccessGroups) — see the Field-Level Mapping Table below for the full source→target list; note several fields are renamed (e.g. clientID→ClientID, poBox→POBox, iban→IBAN, swiftCode→SWIFTCode) and accessGroup1..10 are copied twice under two different target names (accessGroupN and, for group 1 only, also as 'accessGroup').
1. Serialize createSubAccountRequest to JSON (requestBody) via pub.json:documentToJSONString.
1. Look up ETRADE_BASE_URL from static configuration (application=MIDDLEWARE).
1. POST requestBody to '<baseUrl>/IntegrationAPI/IntegrationWServices/CRM_CREATE_SUBACCOUNT', headers Content-Type: application/json and access-token: <token>, loadAs=bytes.
1. Convert response bytes to string (responseBody, UTF-8).
1. If the response Content-Type header indicates JSON (application/json, with or without '; charset=utf-8', case-insensitive on the header name): parse responseBody as JSON, extracting message, status, subaccount, and errors[] (errorList). If status indicates success: responseCode='200', responseMessage='OK', map subaccount → response.accountNo. Otherwise: responseCode='1018', responseMessage = errorList joined with ','.
1. If the response is not JSON: responseCode='1018', responseMessage = raw responseBody.
1. If token acquisition failed: responseCode='1018', responseMessage='Failed To Get Token from FIT', responseBody = token error message.
1. Catch block: on a FAILURE, first recover requestBody/requestTimestamp/correlationID from the exception's captured pipeline snapshot (pub.flow:getLastError → lastError.pipeline), then apply the same '1069' vs '500' classification as createCustomer.
1. Finally block: capture responseTimestamp, async-log to SEQDatalust with serviceName='CRM.services.wasataOnboarding:createSubAccounts', clear pipeline preserving correlationID.

### 3.3.6 Validation Rules

| **Field / condition** | **Error code** | **Message / rule** |
| --- | --- | --- |
| bankInterface.iban | 1069 | "1069 IBAN is mandatory" — only enforced when the bankInterface group is present. |

### 3.3.7 Field-Level Mapping

Full source → target field mapping performed while assembling the outbound FIT payload (119 discrete copies), extracted directly from the flow's MAP step. Implement as an explicit mapper, not a reflective/automatic copy.

| **Source field (inbound request)** | **Target field (FIT payload)** |
| --- | --- |
| `/subAccountInformation/clientID` | `/createSubAccountRequest/SubAccountInformation/ClientID` |
| `/subAccountInformation/clientAr` | `/createSubAccountRequest/SubAccountInformation/clientAr` |
| `/subAccountInformation/clientEn` | `/createSubAccountRequest/SubAccountInformation/clientEn` |
| `/subAccountInformation/accountType` | `/createSubAccountRequest/SubAccountInformation/accountType` |
| `/subAccountInformation/currency` | `/createSubAccountRequest/SubAccountInformation/currency` |
| `/subAccountInformation/accNameAr` | `/createSubAccountRequest/SubAccountInformation/accNameAr` |
| `/subAccountInformation/accNameEn` | `/createSubAccountRequest/SubAccountInformation/accNameEn` |
| `/subAccountInformation/birthDate` | `/createSubAccountRequest/SubAccountInformation/birthDate` |
| `/subAccountInformation/residentialAddressAr` | `/createSubAccountRequest/SubAccountInformation/residentialAddressAr` |
| `/subAccountInformation/residentialAddressEn` | `/createSubAccountRequest/SubAccountInformation/residentialAddressEn` |
| `/subAccountInformation/mobileNo` | `/createSubAccountRequest/SubAccountInformation/mobileNo` |
| `/subAccountInformation/faxNo` | `/createSubAccountRequest/SubAccountInformation/faxNo` |
| `/subAccountInformation/poBox` | `/createSubAccountRequest/SubAccountInformation/POBox` |
| `/subAccountInformation/email` | `/createSubAccountRequest/SubAccountInformation/email` |
| `/subAccountInformation/sendEmail` | `/createSubAccountRequest/SubAccountInformation/sendEmail` |
| `/subAccountInformation/sendResearch` | `/createSubAccountRequest/SubAccountInformation/sendResearch` |
| `/subAccountInformation/sendSms` | `/createSubAccountRequest/SubAccountInformation/sendSms` |
| `/subAccountInformation/sendTradeConfirmationSms` | `/createSubAccountRequest/SubAccountInformation/sendTradeConfirmationSms` |
| `/subAccountInformation/tradingType` | `/createSubAccountRequest/SubAccountInformation/tradingType` |
| `/subAccountInformation/dormantAccount` | `/createSubAccountRequest/SubAccountInformation/dormantAccount` |
| `/subAccountInformation/remarks` | `/createSubAccountRequest/SubAccountInformation/remarks` |
| `/subAccountInformation/internationalTrading` | `/createSubAccountRequest/SubAccountInformation/internationalTrading` |
| `/subAccountInformation/status` | `/createSubAccountRequest/SubAccountInformation/status` |
| `/shareHolding/companyName` | `/createSubAccountRequest/ShareHolding/companyName` |
| `/shareHolding/holds5PercentOrMore` | `/createSubAccountRequest/ShareHolding/holds5PercentOrMore` |
| `/accessMarket/market` | `/createSubAccountRequest/AccessMarket/market` |
| `/accessMarket/NINNumber` | `/createSubAccountRequest/AccessMarket/NINNumber` |
| `/accessMarket/tradingNumber` | `/createSubAccountRequest/AccessMarket/tradingNumber` |
| `/accessMarket/accountName` | `/createSubAccountRequest/AccessMarket/accountName` |
| `/accessMarket/accountType` | `/createSubAccountRequest/AccessMarket/accountType` |
| `/bankInterface/bankName` | `/createSubAccountRequest/BankDetails/bankName` |
| `/bankInterface/accountBank` | `/createSubAccountRequest/BankDetails/accountBank` |
| `/bankInterface/bankAccHolderName` | `/createSubAccountRequest/BankDetails/bankAccHolderName` |
| `/bankInterface/branchName` | `/createSubAccountRequest/BankDetails/branchName` |
| `/bankInterface/isClientConsentedToShareData` | `/createSubAccountRequest/BankDetails/isClientConsentedToShareData` |
| `/bankInterface/iban` | `/createSubAccountRequest/BankDetails/IBAN` |
| `/bankInterface/city` | `/createSubAccountRequest/BankDetails/city` |
| `/bankInterface/country` | `/createSubAccountRequest/BankDetails/country` |
| `/bankInterface/bankAccAddress` | `/createSubAccountRequest/BankDetails/bankAccAddress` |
| `/bankInterface/cashDividendPaymentMethod` | `/createSubAccountRequest/BankDetails/cashDividendPaymentMethod` |
| `/bankInterface/printName` | `/createSubAccountRequest/BankDetails/printName` |
| `/bankInterface/routeCode` | `/createSubAccountRequest/BankDetails/routeCode` |
| `/boardMember/isBoardMember` | `/createSubAccountRequest/BoardMember/isBoardMember` |
| `/boardMember/companyName` | `/createSubAccountRequest/BoardMember/companyName` |
| `/fatca/isUSPerson` | `/createSubAccountRequest/Fatca/isUSPerson` |
| `/fatca/isLiableToPayTaxesInTheUs` | `/createSubAccountRequest/Fatca/isLiableToPayTaxesInTheUs` |
| `/fatca/isUSIndiciaFound` | `/createSubAccountRequest/Fatca/isUSIndiciaFound` |
| `/fatca/isDocumentCollected` | `/createSubAccountRequest/Fatca/isDocumentCollected` |
| `/fatca/isDocumentType` | `/createSubAccountRequest/Fatca/isDocumentType` |
| `/fatca/customerFatcaClassification` | `/createSubAccountRequest/Fatca/customerFatcaClassification` |
| `/portfolioManagement/portfolioManagement` | `/createSubAccountRequest/PortfolioManagement/portfolioManagement` |
| `/portfolioManagement/relationshipManagerBroker` | `/createSubAccountRequest/PortfolioManagement/relationshipManagerBroker` |
| `/portfolioManagement/relationManager` | `/createSubAccountRequest/PortfolioManagement/relationManager` |
| `/portfolioManagement/portfolioManagementComission` | `/createSubAccountRequest/PortfolioManagement/portfolioManagementComission` |
| `/portfolioManagement/relationshipManagerComission` | `/createSubAccountRequest/PortfolioManagement/relationshipManagerComission` |
| `/portfolioManagement/classification` | `/createSubAccountRequest/PortfolioManagement/classification` |
| `/portfolioManagement/reportsLanguage` | `/createSubAccountRequest/PortfolioManagement/reportsLanguage` |
| `/portfolioManagement/smsLanguage` | `/createSubAccountRequest/PortfolioManagement/smsLanguage` |
| `/portfolioManagement/allowDerivativesTrading` | `/createSubAccountRequest/PortfolioManagement/allowDerivativesTrading` |
| `/portfolioManagement/separateFrequencyPosting(0)` | `/createSubAccountRequest/PortfolioManagement/separateFrequencyPosting` |
| `/portfolioManagement/custodian` | `/createSubAccountRequest/PortfolioManagement/custodian` |
| `/portfolioManagement/tradingType` | `/createSubAccountRequest/PortfolioManagement/tradingType` |
| `/portfolioManagement/tradingCategory` | `/createSubAccountRequest/PortfolioManagement/tradingCategory` |
| `/portfolioManagement/investmentAmount` | `/createSubAccountRequest/PortfolioManagement/investmentAmount` |
| `/portfolioManagement/derivativesAccountType` | `/createSubAccountRequest/PortfolioManagement/derivativesAccountType` |
| `/portfolioManagement/rebateFlag` | `/createSubAccountRequest/PortfolioManagement/rebateFlag` |
| `/portfolioManagement/rebatePercentage` | `/createSubAccountRequest/PortfolioManagement/rebatePercentage` |
| `/portfolioManagement/lpReportsForms` | `/createSubAccountRequest/PortfolioManagement/lpReportsForms` |
| `/portfolioManagement/preformanceFees` | `/createSubAccountRequest/PortfolioManagement/preformanceFees` |
| `/portfolioManagement/minimumFees` | `/createSubAccountRequest/PortfolioManagement/minimumFees` |
| `/portfolioManagement/accumulatedValue` | `/createSubAccountRequest/PortfolioManagement/accumulatedValue` |
| `/portfolioManagement/contractDate` | `/createSubAccountRequest/PortfolioManagement/contractDate` |
| `/portfolioManagement/contractEndingDate` | `/createSubAccountRequest/PortfolioManagement/contractEndingDate` |
| `/portfolioManagement/contractNo` | `/createSubAccountRequest/PortfolioManagement/contractNo` |
| `/portfolioManagement/rebateComissionTemplate` | `/createSubAccountRequest/PortfolioManagement/rebateComissionTemplate` |
| `/portfolioManagement/frequencyofRebateComission` | `/createSubAccountRequest/PortfolioManagement/frequencyofRebateComission` |
| `/portfolioManagement/eStatement` | `/createSubAccountRequest/PortfolioManagement/eStatement` |
| `/portfolioManagement/printStatement` | `/createSubAccountRequest/PortfolioManagement/printStatement` |
| `/portfolioManagement/rejectionAccount` | `/createSubAccountRequest/PortfolioManagement/rejectionAccount` |
| `/portfolioManagement/sponsorEmailID` | `/createSubAccountRequest/PortfolioManagement/sponsorEmailID` |
| `/portfolioManagement/relatedPartyID` | `/createSubAccountRequest/PortfolioManagement/relatedPartyID` |
| `/portfolioManagement/buysideBroker` | `/createSubAccountRequest/PortfolioManagement/buysideBroker` |
| `/portfolioManagement/guardian` | `/createSubAccountRequest/PortfolioManagement/guardian` |
| `/portfolioManagement/internationalBrokerName` | `/createSubAccountRequest/PortfolioManagement/internationalBrokerName` |
| `/portfolioManagement/internationalBrokerCustodian` | `/createSubAccountRequest/PortfolioManagement/internationalBrokerCustodian` |
| `/portfolioManagement/settlementDays` | `/createSubAccountRequest/PortfolioManagement/settlementDays` |
| `/portfolioManagement/accountInitiationDate` | `/createSubAccountRequest/PortfolioManagement/accountInitiationDate` |
| `/portfolioManagement/separateFrequencyPosting(1)` | `/createSubAccountRequest/PortfolioManagement/separateFrequencyPosting(1)` |
| `/poa/poaValidity` | `/createSubAccountRequest/POA/POAValidity` |
| `/relatedParties/relatedParty` | `/createSubAccountRequest/RelatedParties/relatedParty` |
| `/relatedParties/relatedPartyType` | `/createSubAccountRequest/RelatedParties/relatedPartyType` |
| `/relatedParties/occupation` | `/createSubAccountRequest/RelatedParties/occupation` |
| `/relatedParties/relationship` | `/createSubAccountRequest/RelatedParties/relationship` |
| `/subAccountInformation/businessLine` | `/createSubAccountRequest/SubAccountInformation/businessline` |
| `/subAccountInformation/subAccountType` | `/createSubAccountRequest/SubAccountInformation/subAccountType` |
| `/bankInterface/currentSavingAccount` | `/createSubAccountRequest/BankDetails/currentSavingAccount` |
| `/bankInterface/currentSavingAccountCurrency` | `/createSubAccountRequest/BankDetails/currentSavingAccountCurrency` |
| `/bankInterface/swiftCode` | `/createSubAccountRequest/BankDetails/SWIFTCode` |
| `/portfolioManagement/frequencyOfReports` | `/createSubAccountRequest/PortfolioManagement/frequencyOfReports` |
| `/insider/isBoardMember` | `/createSubAccountRequest/Insider/isBoardMember` |
| `/insider/companyName` | `/createSubAccountRequest/Insider/companyName` |
| `/accessGroup/accessGroup1` | `/createSubAccountRequest/AccessGroups/accessGroup1` |
| `/accessGroup/accessGroup2` | `/createSubAccountRequest/AccessGroups/accessGroup2` |
| `/accessGroup/accessGroup3` | `/createSubAccountRequest/AccessGroups/accessGroup3` |
| `/accessGroup/accessGroup4` | `/createSubAccountRequest/AccessGroups/accessGroup4` |
| `/accessGroup/accessGroup5` | `/createSubAccountRequest/AccessGroups/accessGroup5` |
| `/accessGroup/accessGroup6` | `/createSubAccountRequest/AccessGroups/accessGroup6` |
| `/accessGroup/accessGroup7` | `/createSubAccountRequest/AccessGroups/accessGroup7` |
| `/accessGroup/accessGroup8` | `/createSubAccountRequest/AccessGroups/accessGroup8` |
| `/accessGroup/accessGroup9` | `/createSubAccountRequest/AccessGroups/accessGroup9` |
| `/accessGroup/accessGroup10` | `/createSubAccountRequest/AccessGroups/accessGroup10` |
| `/accessGroup/accessGroup1` | `/createSubAccountRequest/AccessGroups/accessGroup` |
| `/subAccountInformation/enableSweepFacility` | `/createSubAccountRequest/SubAccountInformation/enableSweepFacility` |
| `/subAccountInformation/mmfAccount` | `/createSubAccountRequest/SubAccountInformation/mmfAccount` |
| `/portfolioManagement/frequencyofPosting` | `/createSubAccountRequest/PortfolioManagement/frequencyofPosting` |
| `/portfolioManagement/relationshipManagerExpiryDate` | `/createSubAccountRequest/PortfolioManagement/relationshipManagerExpiryDate` |
| `/relatedParties/relatedStaff` | `/createSubAccountRequest/RelatedParties/relatedStaff` |
| `/subAccountInformation/commtemplate` | `/createSubAccountRequest/SubAccountInformation/commtemplate` |
| `/subAccountInformation/defaultAccount` | `/createSubAccountRequest/SubAccountInformation/defaultAccount` |

### 3.3.8 External Dependency & Configuration

| **Attribute** | **Value** |
| --- | --- |
| Purpose | Create sub-account in FIT |
| Method | POST |
| URL | {ETRADE_BASE_URL}/IntegrationAPI/IntegrationWServices/CRM_CREATE_SUBACCOUNT |
| Headers | Content-Type: application/json; access-token: <FIT bearer token> |
| Body | JSON-serialized createSubAccountRequest |
| Success mapping | subaccount → response.accountNo |

### 3.3.9 Error Code Reference

**_Client Input Errors — errorCode/errorMsg returned_**

*Caused by the caller's own input; the specific reason is safe to return.*

| **errorCode** | **responseCode / responseMessage** | **errorMsg (returned)** |
| --- | --- | --- |
| CSA-V-001 | 400 / Bad Request | IBAN is mandatory |

**_Backend / Provider Errors — errorCode/errorMsg left null_**

*Caused by this service's own infrastructure or its upstream dependency, not the caller's input — never surfaced via errorCode/errorMsg; detail is written to the server log only, keyed by correlationID.*

| **Internal code** | **responseCode / responseMessage** | **Logged detail only — never returned** |
| --- | --- | --- |
| CSA-B-001 | 502 / Bad Gateway | FIT returned a non-success status and/or an errors[] list while creating the sub-account. |
| CSA-B-002 | 502 / Bad Gateway | Unable to obtain a FIT bearer access token. |
| CSA-B-003 | 503 / Service Unavailable | Unhandled exception in the create-sub-account flow. |

### 3.3.10 Implementation Notes

- The full field-level mapping from the 11 inbound groups to the FIT createSubAccountRequest payload is large (119 discrete fields) — see the Field-Level Mapping table in §3.3.9; implement as an explicit mapper (MapStruct or hand-written), not a reflective/automatic copy, since several fields are renamed (clientID→ClientID, poBox→POBox, iban→IBAN, swiftCode→SWIFTCode, etc.).
- accessGroup1 is written to two different target fields (accessGroup1 and, for group 1 only, also a field literally named accessGroup) — reproduce this duplication only if confirmed intentional; it may be a legacy artifact worth collapsing in the target.
- portfolioManagement.frequencyOfReports is explicitly normalized to '[]' when empty — no special handling needed in Java given default empty-collection serialization.
- Same HTTP-200-always transport caveat as createCustomer applies here (see §3.1 Implementation Notes).

## 3.4 updateSubAccounts

Updates an existing sub-account. Same 11 input groups and same field-level mapping as createSubAccounts, with two differences: (1) an additional field, subAccountInformation.accountNo, is mapped to SubAccountInformation.Subaccount to identify which sub-account to update, and (2) the response includes both the updated account number and the client ID from the FIT response.

### 3.4.1 Endpoint

| **Attribute** | **Detail** |
| --- | --- |
| HTTP Method | POST |
| Path | /wasataOnboarding/updateSubAccounts |
| Content Type | application/json |
| Authentication | Not enforced by the legacy service itself — confirm the gateway/API Manager policy layer in front of this endpoint. |
| webMethods service | CRM.services.wasataOnboarding:updateSubAccounts |

### 3.4.2 Request Body

| **Field (indentation shows nesting)** | **Notes** |
| --- | --- |
| `subAccountInformation: CRM.documents.wasata:subAccountInformation  (ref)` | Nested group |
| `    clientID: string` |  |
| `    businessLine: string` |  |
| `    accountNo: string` |  |
| `    clientAr: string` |  |
| `    clientEn: string` |  |
| `    accountType: string` |  |
| `    currency: string` |  |
| `    accNameAr: string` |  |
| `    accNameEn: string` |  |
| `    birthDate: string` |  |
| `    residentialAddressAr: string` |  |
| `    residentialAddressEn: string` |  |
| `    mobileNo: string` |  |
| `    faxNo: string` |  |
| `    poBox: string` |  |
| `    email: string` |  |
| `    sendEmail: string` |  |
| `    sendResearch: string` |  |
| `    sendSms: string` |  |
| `    sendTradeConfirmationSms: string` |  |
| `    tradingType: string` |  |
| `    defaultAccount: string` |  |
| `    dormantAccount: string` |  |
| `    remarks: string` |  |
| `    internationalTrading: string` |  |
| `    status: string` |  |
| `    subAccountType: string` |  |
| `    crmSubAccountNo: string` |  |
| `    commtemplate: string` |  |
| `    enableSweepFacility: string` |  |
| `    mmfAccount: string` |  |
| `    marginTemplate: string` |  |
| `shareHolding: CRM.documents.wasata:shareHolding[]  (ref)` | Nested group |
| `    companyName: string` |  |
| `    holds5PercentOrMore: string` |  |
| `accessGroup: CRM.documents.wasata:accessGroup[]  (ref)` | Nested group |
| `    accessGroup: string` |  |
| `    accessGroup1: string` |  |
| `    accessGroup2: string` |  |
| `    accessGroup3: string` |  |
| `    accessGroup4: string` |  |
| `    accessGroup5: string` |  |
| `    accessGroup6: string` |  |
| `    accessGroup7: string` |  |
| `    accessGroup8: string` |  |
| `    accessGroup9: string` |  |
| `    accessGroup10: string` |  |
| `accessMarket: CRM.documents.wasata:accessMarket[]  (ref)` | Nested group |
| `    market: string` |  |
| `    NINNumber: string` |  |
| `    tradingNumber: string` |  |
| `    accountName: string` |  |
| `    accountType: string` |  |
| `bankInterface: CRM.documents.wasata:bankInterface  (ref)` | Nested group |
| `    bankName: string` |  |
| `    accountBank: string` |  |
| `    bankAccHolderName: string` |  |
| `    branchName: string` |  |
| `    isClientConsentedToShareData: string` |  |
| `    swiftCode: string` |  |
| `    iban: string` |  |
| `    city: string` |  |
| `    country: string` |  |
| `    bankAccAddress: string` |  |
| `    cashDividendPaymentMethod: string` |  |
| `    printName: string` |  |
| `    routeCode: string` |  |
| `    currentSavingAccount: string` |  |
| `    currentSavingAccountCurrency: string` |  |
| `boardMember: CRM.documents.wasata:boardMember  (ref)` | Nested group |
| `    isBoardMember: string` |  |
| `    companyName: string` |  |
| `fatca: CRM.documents.wasata:fatca  (ref)` | Nested group |
| `    isUSPerson: string` |  |
| `    isLiableToPayTaxesInTheUs: string` |  |
| `    isUSIndiciaFound: string` |  |
| `    isDocumentCollected: string` |  |
| `    isDocumentType: string` |  |
| `    customerFatcaClassification: string` |  |
| `portfolioManagement: CRM.documents.wasata:portfolioManagement  (ref)` | Nested group |
| `    portfolioManagement: string` |  |
| `    relationshipManagerBroker: string` |  |
| `    relationManager: string` |  |
| `    classification: string` |  |
| `    reportsLanguage: string` |  |
| `    frequencyOfReports: string[]` |  |
| `    smsLanguage: string` |  |
| `    allowDerivativesTrading: string` |  |
| `    separateFrequencyPosting: string` |  |
| `    custodian: string` |  |
| `    portfolioManagementComission: string` |  |
| `    relationshipManagerComission: string` |  |
| `    tradingType: string` |  |
| `    accountInitiationDate: string` |  |
| `    tradingCategory: string` |  |
| `    investmentAmount: string` |  |
| `    derivativesAccountType: string` |  |
| `    rebateFlag: string` |  |
| `    rebatePercentage: string` |  |
| `    separateFrequencyPosting: string` |  |
| `    lpReportsForms: string` |  |
| `    preformanceFees: string` |  |
| `    minimumFees: string` |  |
| `    accumulatedValue: string` |  |
| `    contractDate: string` |  |
| `    contractEndingDate: string` |  |
| `    contractNo: string` |  |
| `    rebateComissionTemplate: string` |  |
| `    frequencyofRebateComission: string` |  |
| `    eStatement: string` |  |
| `    printStatement: string` |  |
| `    rejectionAccount: string` |  |
| `    sponsorEmailID: string` |  |
| `    guardian: string` |  |
| `    relatedPartyID: string` |  |
| `    buysideBroker: string` |  |
| `    internationalBrokerName: string` |  |
| `    internationalBrokerCustodian: string` |  |
| `    settlementDays: string` |  |
| `    frequencyofPosting: string` |  |
| `    relationshipManagerExpiryDate: string` |  |
| `insider: CRM.documents.wasata:insider  (ref)` | Nested group |
| `    crmId: string` |  |
| `    type: string` |  |
| `    companyName: string` |  |
| `    isBoardMember: string` |  |
| `poa: CRM.documents.wasata:poa  (ref)` | Nested group |
| `    poaValidity: string` |  |
| `relatedParties: CRM.documents.wasata:relatedParties  (ref)` | Nested group |
| `    relatedParty: string` |  |
| `    relatedPartyType: string` |  |
| `    occupation: string` |  |
| `    relationship: string` |  |
| `    relatedStaff: string` |  |

**Sample:**

```text
Identical shape to createSubAccounts' request body (§3.3.2), plus subAccountInformation.accountNo to identify the sub-account being updated. See the Input Structure table below.
```

### 3.4.3 Response Body

Rows are shaded by nesting depth: a field of Type “Document” is itself a nested object, and its children are the rows immediately below it at the next depth.

| **Field** | **Type** | **Notes** |
| --- | --- | --- |
| `responseCode` | string | Mirrors the actual HTTP status code returned in the header, as a string. Always present. |
| `responseMessage` | string | Mirrors the actual HTTP reason phrase. Always present. |
| `errorCode` | string \| null | App-level error code, populated only for client-input errors (see Error Code Reference); null on success and null on backend/provider errors. |
| `errorMsg` | string \| null | Human-readable client-input error description; null on success and null on backend/provider errors (server-log-only in that case). |
| `correlationID` | string | Request correlation ID (caller-supplied or generated). Always present. |
| `    ↳ response` | *Document* | Wrapper object holding the domain payload. Always present; its child fields are null on any error. |
| `        ↳ accountNo` | string | Populated on success; null on any error. |

**Sample — Success:**

```json
{
  "responseCode": "200", "responseMessage": "OK", "errorCode": null, "errorMsg": null,
  "correlationID": "a1b2c3d4-...", "response": { "accountNo": "SA00098765" }
}
```

**Sample — Client Input Error:**

```json
{
  "responseCode": "400", "responseMessage": "Bad Request", "errorCode": "USA-V-001",
  "errorMsg": "IBAN is mandatory", "correlationID": "a1b2c3d4-...", "response": { "accountNo": null }
}
```

**Sample — Backend/Provider Error:**

```json
{
  "responseCode": "502", "responseMessage": "Bad Gateway", "errorCode": null, "errorMsg": null,
  "correlationID": "a1b2c3d4-...", "response": { "accountNo": null }
}
```

### 3.4.4 Response Headers — HTTP Status Codes

| **HTTP Status** | **Reason Phrase** | **Meaning** |
| --- | --- | --- |
| 200 | OK | Sub-account updated; response.accountNo is populated. |
| 400 | Bad Request | IBAN missing while bank-interface data was supplied (USA-V-001). |
| 502 | Bad Gateway | FIT rejected the request or returned a business error, or the FIT token could not be obtained (USA-B-001/002). |
| 503 | Service Unavailable | An unhandled internal exception occurred (USA-B-003). |

### 3.4.5 Business & Validation Logic

1. Identical steps 1–3 to createSubAccounts (correlationID/timestamp, frequencyOfReports normalization, IBAN mandatory check).
1. Call CRM.services.utils:getFITToken.
1. If token call returns statusCode=200: build 'updateSubAccountRequest' using the same field mapping as createSubAccountRequest, PLUS subAccountInformation.accountNo → SubAccountInformation.Subaccount (identifies the sub-account being updated).
1. Serialize to JSON, look up ETRADE_BASE_URL, POST to '<baseUrl>/IntegrationAPI/IntegrationWServices/CRM_UPDATE_SUBACCOUNT' with the same headers as createSubAccounts (no explicit loadAs=bytes override is set here — default loading applies).
1. Convert response to string; on JSON content-type, parse response extracting message, status, subaccount, ClientID (note: update response additionally exposes ClientID, unlike create). On success map subaccount → response.accountNo and (implicitly) capture ClientID; on failure the entire raw responseBody is used directly as responseMessage (no errors[] join step is present here, unlike createSubAccounts).
1. If not JSON or token failed, same fallback handling as createSubAccounts.
1. Same catch (pipeline recovery + 1069/500 classification) and finally (audit log with serviceName='CRM.services.wasataOnboarding:updateSubAccounts', clear pipeline preserving correlationID) as createSubAccounts.

### 3.4.6 Validation Rules

| **Field / condition** | **Error code** | **Message / rule** |
| --- | --- | --- |
| bankInterface.iban | 1069 | "1069 IBAN is mandatory" — only enforced when the bankInterface group is present. |

### 3.4.7 Field-Level Mapping

Full source → target field mapping performed while assembling the outbound FIT payload (120 discrete copies), extracted directly from the flow's MAP step. Implement as an explicit mapper, not a reflective/automatic copy.

| **Source field (inbound request)** | **Target field (FIT payload)** |
| --- | --- |
| `/subAccountInformation/clientID` | `/updateSubAccountRequest/SubAccountInformation/ClientID` |
| `/subAccountInformation/businessLine` | `/updateSubAccountRequest/SubAccountInformation/businessline` |
| `/subAccountInformation/clientAr` | `/updateSubAccountRequest/SubAccountInformation/clientAr` |
| `/subAccountInformation/clientEn` | `/updateSubAccountRequest/SubAccountInformation/clientEn` |
| `/subAccountInformation/accountType` | `/updateSubAccountRequest/SubAccountInformation/accountType` |
| `/subAccountInformation/currency` | `/updateSubAccountRequest/SubAccountInformation/currency` |
| `/subAccountInformation/accNameAr` | `/updateSubAccountRequest/SubAccountInformation/accNameAr` |
| `/subAccountInformation/accNameEn` | `/updateSubAccountRequest/SubAccountInformation/accNameEn` |
| `/subAccountInformation/birthDate` | `/updateSubAccountRequest/SubAccountInformation/birthDate` |
| `/subAccountInformation/residentialAddressAr` | `/updateSubAccountRequest/SubAccountInformation/residentialAddressAr` |
| `/subAccountInformation/residentialAddressEn` | `/updateSubAccountRequest/SubAccountInformation/residentialAddressEn` |
| `/subAccountInformation/mobileNo` | `/updateSubAccountRequest/SubAccountInformation/mobileNo` |
| `/subAccountInformation/faxNo` | `/updateSubAccountRequest/SubAccountInformation/faxNo` |
| `/subAccountInformation/poBox` | `/updateSubAccountRequest/SubAccountInformation/POBox` |
| `/subAccountInformation/email` | `/updateSubAccountRequest/SubAccountInformation/email` |
| `/subAccountInformation/sendEmail` | `/updateSubAccountRequest/SubAccountInformation/sendEmail` |
| `/subAccountInformation/sendResearch` | `/updateSubAccountRequest/SubAccountInformation/sendResearch` |
| `/subAccountInformation/sendSms` | `/updateSubAccountRequest/SubAccountInformation/sendSms` |
| `/subAccountInformation/sendTradeConfirmationSms` | `/updateSubAccountRequest/SubAccountInformation/sendTradeConfirmationSms` |
| `/subAccountInformation/tradingType` | `/updateSubAccountRequest/SubAccountInformation/tradingType` |
| `/subAccountInformation/dormantAccount` | `/updateSubAccountRequest/SubAccountInformation/dormantAccount` |
| `/subAccountInformation/remarks` | `/updateSubAccountRequest/SubAccountInformation/remarks` |
| `/subAccountInformation/internationalTrading` | `/updateSubAccountRequest/SubAccountInformation/internationalTrading` |
| `/subAccountInformation/status` | `/updateSubAccountRequest/SubAccountInformation/status` |
| `/shareHolding/companyName` | `/updateSubAccountRequest/ShareHolding/companyName` |
| `/shareHolding/holds5PercentOrMore` | `/updateSubAccountRequest/ShareHolding/holds5PercentOrMore` |
| `/accessMarket/market` | `/updateSubAccountRequest/AccessMarket/market` |
| `/accessMarket/NINNumber` | `/updateSubAccountRequest/AccessMarket/NINNumber` |
| `/accessMarket/tradingNumber` | `/updateSubAccountRequest/AccessMarket/tradingNumber` |
| `/accessMarket/accountName` | `/updateSubAccountRequest/AccessMarket/accountName` |
| `/accessMarket/accountType` | `/updateSubAccountRequest/AccessMarket/accountType` |
| `/bankInterface/bankName` | `/updateSubAccountRequest/BankDetails/bankName` |
| `/bankInterface/accountBank` | `/updateSubAccountRequest/BankDetails/accountBank` |
| `/bankInterface/bankAccHolderName` | `/updateSubAccountRequest/BankDetails/bankAccHolderName` |
| `/bankInterface/branchName` | `/updateSubAccountRequest/BankDetails/branchName` |
| `/bankInterface/isClientConsentedToShareData` | `/updateSubAccountRequest/BankDetails/isClientConsentedToShareData` |
| `/bankInterface/iban` | `/updateSubAccountRequest/BankDetails/IBAN` |
| `/bankInterface/city` | `/updateSubAccountRequest/BankDetails/city` |
| `/bankInterface/country` | `/updateSubAccountRequest/BankDetails/country` |
| `/bankInterface/bankAccAddress` | `/updateSubAccountRequest/BankDetails/bankAccAddress` |
| `/bankInterface/cashDividendPaymentMethod` | `/updateSubAccountRequest/BankDetails/cashDividendPaymentMethod` |
| `/bankInterface/printName` | `/updateSubAccountRequest/BankDetails/printName` |
| `/bankInterface/routeCode` | `/updateSubAccountRequest/BankDetails/routeCode` |
| `/boardMember/isBoardMember` | `/updateSubAccountRequest/BoardMember/isBoardMember` |
| `/boardMember/companyName` | `/updateSubAccountRequest/BoardMember/companyName` |
| `/fatca/isUSPerson` | `/updateSubAccountRequest/Fatca/isUSPerson` |
| `/fatca/isLiableToPayTaxesInTheUs` | `/updateSubAccountRequest/Fatca/isLiableToPayTaxesInTheUs` |
| `/fatca/isUSIndiciaFound` | `/updateSubAccountRequest/Fatca/isUSIndiciaFound` |
| `/fatca/isDocumentCollected` | `/updateSubAccountRequest/Fatca/isDocumentCollected` |
| `/fatca/isDocumentType` | `/updateSubAccountRequest/Fatca/isDocumentType` |
| `/fatca/customerFatcaClassification` | `/updateSubAccountRequest/Fatca/customerFatcaClassification` |
| `/portfolioManagement/portfolioManagement` | `/updateSubAccountRequest/PortfolioManagement/portfolioManagement` |
| `/portfolioManagement/relationshipManagerBroker` | `/updateSubAccountRequest/PortfolioManagement/relationshipManagerBroker` |
| `/portfolioManagement/relationManager` | `/updateSubAccountRequest/PortfolioManagement/relationManager` |
| `/portfolioManagement/portfolioManagementComission` | `/updateSubAccountRequest/PortfolioManagement/portfolioManagementComission` |
| `/portfolioManagement/relationshipManagerComission` | `/updateSubAccountRequest/PortfolioManagement/relationshipManagerComission` |
| `/portfolioManagement/classification` | `/updateSubAccountRequest/PortfolioManagement/classification` |
| `/portfolioManagement/reportsLanguage` | `/updateSubAccountRequest/PortfolioManagement/reportsLanguage` |
| `/portfolioManagement/smsLanguage` | `/updateSubAccountRequest/PortfolioManagement/smsLanguage` |
| `/portfolioManagement/allowDerivativesTrading` | `/updateSubAccountRequest/PortfolioManagement/allowDerivativesTrading` |
| `/portfolioManagement/separateFrequencyPosting(0)` | `/updateSubAccountRequest/PortfolioManagement/separateFrequencyPosting(0)` |
| `/portfolioManagement/custodian` | `/updateSubAccountRequest/PortfolioManagement/custodian` |
| `/portfolioManagement/tradingType` | `/updateSubAccountRequest/PortfolioManagement/tradingType` |
| `/portfolioManagement/tradingCategory` | `/updateSubAccountRequest/PortfolioManagement/tradingCategory` |
| `/portfolioManagement/investmentAmount` | `/updateSubAccountRequest/PortfolioManagement/investmentAmount` |
| `/portfolioManagement/derivativesAccountType` | `/updateSubAccountRequest/PortfolioManagement/derivativesAccountType` |
| `/portfolioManagement/rebateFlag` | `/updateSubAccountRequest/PortfolioManagement/rebateFlag` |
| `/portfolioManagement/rebatePercentage` | `/updateSubAccountRequest/PortfolioManagement/rebatePercentage` |
| `/portfolioManagement/lpReportsForms` | `/updateSubAccountRequest/PortfolioManagement/lpReportsForms` |
| `/portfolioManagement/preformanceFees` | `/updateSubAccountRequest/PortfolioManagement/preformanceFees` |
| `/portfolioManagement/minimumFees` | `/updateSubAccountRequest/PortfolioManagement/minimumFees` |
| `/portfolioManagement/accumulatedValue` | `/updateSubAccountRequest/PortfolioManagement/accumulatedValue` |
| `/portfolioManagement/contractDate` | `/updateSubAccountRequest/PortfolioManagement/contractDate` |
| `/portfolioManagement/contractEndingDate` | `/updateSubAccountRequest/PortfolioManagement/contractEndingDate` |
| `/portfolioManagement/contractNo` | `/updateSubAccountRequest/PortfolioManagement/contractNo` |
| `/portfolioManagement/rebateComissionTemplate` | `/updateSubAccountRequest/PortfolioManagement/rebateComissionTemplate` |
| `/portfolioManagement/frequencyofRebateComission` | `/updateSubAccountRequest/PortfolioManagement/frequencyofRebateComission` |
| `/portfolioManagement/eStatement` | `/updateSubAccountRequest/PortfolioManagement/eStatement` |
| `/portfolioManagement/printStatement` | `/updateSubAccountRequest/PortfolioManagement/printStatement` |
| `/portfolioManagement/rejectionAccount` | `/updateSubAccountRequest/PortfolioManagement/rejectionAccount` |
| `/portfolioManagement/sponsorEmailID` | `/updateSubAccountRequest/PortfolioManagement/sponsorEmailID` |
| `/portfolioManagement/relatedPartyID` | `/updateSubAccountRequest/PortfolioManagement/relatedPartyID` |
| `/portfolioManagement/buysideBroker` | `/updateSubAccountRequest/PortfolioManagement/buysideBroker` |
| `/portfolioManagement/guardian` | `/updateSubAccountRequest/PortfolioManagement/guardian` |
| `/portfolioManagement/internationalBrokerName` | `/updateSubAccountRequest/PortfolioManagement/internationalBrokerName` |
| `/portfolioManagement/internationalBrokerCustodian` | `/updateSubAccountRequest/PortfolioManagement/internationalBrokerCustodian` |
| `/portfolioManagement/settlementDays` | `/updateSubAccountRequest/PortfolioManagement/settlementDays` |
| `/portfolioManagement/accountInitiationDate` | `/updateSubAccountRequest/PortfolioManagement/accountInitiationDate` |
| `/portfolioManagement/separateFrequencyPosting(1)` | `/updateSubAccountRequest/PortfolioManagement/separateFrequencyPosting(1)` |
| `/insider/companyName` | `/updateSubAccountRequest/Insider/companyName` |
| `/poa/poaValidity` | `/updateSubAccountRequest/POA/POAValidity` |
| `/relatedParties/relatedParty` | `/updateSubAccountRequest/RelatedParties/relatedParty` |
| `/relatedParties/relatedPartyType` | `/updateSubAccountRequest/RelatedParties/relatedPartyType` |
| `/relatedParties/occupation` | `/updateSubAccountRequest/RelatedParties/occupation` |
| `/relatedParties/relationship` | `/updateSubAccountRequest/RelatedParties/relationship` |
| `/bankInterface/swiftCode` | `/updateSubAccountRequest/BankDetails/SWIFTCode` |
| `/insider/isBoardMember` | `/updateSubAccountRequest/Insider/isBoardMember` |
| `/accessGroup/accessGroup1` | `/updateSubAccountRequest/AccessGroups/accessGroup1` |
| `/accessGroup/accessGroup2` | `/updateSubAccountRequest/AccessGroups/accessGroup2` |
| `/accessGroup/accessGroup3` | `/updateSubAccountRequest/AccessGroups/accessGroup3` |
| `/accessGroup/accessGroup4` | `/updateSubAccountRequest/AccessGroups/accessGroup4` |
| `/accessGroup/accessGroup5` | `/updateSubAccountRequest/AccessGroups/accessGroup5` |
| `/accessGroup/accessGroup6` | `/updateSubAccountRequest/AccessGroups/accessGroup6` |
| `/accessGroup/accessGroup7` | `/updateSubAccountRequest/AccessGroups/accessGroup7` |
| `/accessGroup/accessGroup8` | `/updateSubAccountRequest/AccessGroups/accessGroup8` |
| `/accessGroup/accessGroup10` | `/updateSubAccountRequest/AccessGroups/accessGroup10` |
| `/accessGroup/accessGroup9` | `/updateSubAccountRequest/AccessGroups/accessGroup9` |
| `/subAccountInformation/subAccountType` | `/updateSubAccountRequest/SubAccountInformation/subAccountType` |
| `/bankInterface/currentSavingAccount` | `/updateSubAccountRequest/BankDetails/currentSavingAccount` |
| `/bankInterface/currentSavingAccountCurrency` | `/updateSubAccountRequest/BankDetails/currentSavingAccountCurrency` |
| `/accessGroup/accessGroup1` | `/updateSubAccountRequest/AccessGroups/accessGroup` |
| `/subAccountInformation/accountNo` | `/updateSubAccountRequest/SubAccountInformation/Subaccount` |
| `/subAccountInformation/enableSweepFacility` | `/updateSubAccountRequest/SubAccountInformation/enableSweepFacility` |
| `/subAccountInformation/mmfAccount` | `/updateSubAccountRequest/SubAccountInformation/mmfAccount` |
| `/relatedParties/relatedStaff` | `/updateSubAccountRequest/RelatedParties/relatedStaff` |
| `/portfolioManagement/relationshipManagerExpiryDate` | `/updateSubAccountRequest/PortfolioManagement/relationshipManagerExpiryDate` |
| `/portfolioManagement/frequencyofPosting` | `/updateSubAccountRequest/PortfolioManagement/frequencyofPosting` |
| `/subAccountInformation/commtemplate` | `/updateSubAccountRequest/SubAccountInformation/commtemplate` |
| `/subAccountInformation/defaultAccount` | `/updateSubAccountRequest/SubAccountInformation/defaultAccount` |
| `/portfolioManagement/frequencyOfReports` | `/updateSubAccountRequest/PortfolioManagement/frequencyOfReports` |

### 3.4.8 External Dependency & Configuration

| **Attribute** | **Value** |
| --- | --- |
| Purpose | Update sub-account in FIT |
| Method | POST |
| URL | {ETRADE_BASE_URL}/IntegrationAPI/IntegrationWServices/CRM_UPDATE_SUBACCOUNT |
| Headers | Content-Type: application/json; access-token: <FIT bearer token> |
| Body | JSON-serialized updateSubAccountRequest |
| Success mapping | subaccount → response.accountNo |

### 3.4.9 Error Code Reference

**_Client Input Errors — errorCode/errorMsg returned_**

*Caused by the caller's own input; the specific reason is safe to return.*

| **errorCode** | **responseCode / responseMessage** | **errorMsg (returned)** |
| --- | --- | --- |
| USA-V-001 | 400 / Bad Request | IBAN is mandatory |

**_Backend / Provider Errors — errorCode/errorMsg left null_**

*Caused by this service's own infrastructure or its upstream dependency, not the caller's input — never surfaced via errorCode/errorMsg; detail is written to the server log only, keyed by correlationID.*

| **Internal code** | **responseCode / responseMessage** | **Logged detail only — never returned** |
| --- | --- | --- |
| USA-B-001 | 502 / Bad Gateway | FIT returned a non-success status while updating the sub-account (raw response body surfaced server-side). |
| USA-B-002 | 502 / Bad Gateway | Unable to obtain a FIT bearer access token. |
| USA-B-003 | 503 / Service Unavailable | Unhandled exception in the update-sub-account flow. |

### 3.4.10 Implementation Notes

- Shares its field-level mapping with createSubAccounts (§3.3) plus one extra field (accountNo→Subaccount) — implement as one shared mapper with an update-only field, not a duplicate.
- Unlike createSubAccounts, the legacy flow passes the raw FIT response body straight through as errorMsg on failure rather than joining an errors[] array — confirm with the FIT API owner whether this is an intentional API-shape difference before deciding whether to normalize it in the target.
- Same HTTP-200-always transport caveat as createCustomer applies here (see §3.1 Implementation Notes).

## 3.5 generateOnlineTradingAccess

Enables a client for online trading and generates their online-trading portal credentials (user ID, username, password) in FIT, given a clientId, onBoardingStatus and a numeric userCode.

### 3.5.1 Endpoint

| **Attribute** | **Detail** |
| --- | --- |
| HTTP Method | POST |
| Path | /wasataOnboarding/generateOnlineTradingAccess  (alias: /generateOnlineUserCode) |
| Content Type | application/json |
| Authentication | Not enforced by the legacy service itself — confirm the gateway/API Manager policy layer in front of this endpoint. |
| webMethods service | CRM.services.wasataOnboarding:generateOnlineTradingAccess |

### 3.5.2 Request Body

| **Field (indentation shows nesting)** | **Notes** |
| --- | --- |
| `(entire signature = doc ref) CRM.documents.wasata.nativeDocs:generateOnlineTradingAccess` |  |
| `    clientId: string` |  |
| `    onBoardingStatus: string` |  |
| `    userCode: string` |  |

**Sample:**

```json
{
  "clientId": "CL0001234",
  "onBoardingStatus": "COMPLETED",
  "userCode": "10023"
}
```

### 3.5.3 Response Body

Rows are shaded by nesting depth: a field of Type “Document” is itself a nested object, and its children are the rows immediately below it at the next depth.

| **Field** | **Type** | **Notes** |
| --- | --- | --- |
| `responseCode` | string | Mirrors the actual HTTP status code returned in the header, as a string. Always present. |
| `responseMessage` | string | Mirrors the actual HTTP reason phrase. Always present. |
| `errorCode` | string \| null | App-level error code, populated only for client-input errors (see Error Code Reference); null on success and null on backend/provider errors. |
| `errorMsg` | string \| null | Human-readable client-input error description; null on success and null on backend/provider errors (server-log-only in that case). |
| `correlationID` | string | Request correlation ID (caller-supplied or generated). Always present. |
| `    ↳ response` | *Document* | Wrapper object holding the domain payload. Always present; its child fields are null on any error. |
| `        ↳ onlineTradingUserId` | string | Populated on success; null on any error. |
| `        ↳ userName` | string | Populated on success; null on any error. |
| `        ↳ password` | string | Populated on success; null on any error. |

**Sample — Success:**

```json
{
  "responseCode": "200", "responseMessage": "OK", "errorCode": null, "errorMsg": null,
  "correlationID": "a1b2c3d4-...",
  "response": { "onlineTradingUserId": "OT445566", "userName": "jane.doe", "password": "***" }
}
```

**Sample — Client Input Error:**

```json
{
  "responseCode": "400", "responseMessage": "Bad Request", "errorCode": "GOT-V-001",
  "errorMsg": "userCode: must not be blank", "correlationID": "a1b2c3d4-...",
  "response": { "onlineTradingUserId": null, "userName": null, "password": null }
}
```

**Sample — Backend/Provider Error:**

```json
{
  "responseCode": "502", "responseMessage": "Bad Gateway", "errorCode": null, "errorMsg": null,
  "correlationID": "a1b2c3d4-...",
  "response": { "onlineTradingUserId": null, "userName": null, "password": null }
}
```

### 3.5.4 Response Headers — HTTP Status Codes

| **HTTP Status** | **Reason Phrase** | **Meaning** |
| --- | --- | --- |
| 200 | OK | Online trading enabled; response.onlineTradingUserId/userName/password populated. |
| 400 | Bad Request | Input failed schema validation (GOT-V-001). |
| 502 | Bad Gateway | FIT rejected the request / returned a non-success status, or the FIT token could not be obtained (GOT-B-001/002). |
| 503 | Service Unavailable | An unhandled internal exception occurred (GOT-B-003). |

### 3.5.5 Business & Validation Logic

1. Generate correlationID (if absent) and capture requestTimestamp.
1. Copy clientId and onBoardingStatus into both a local validation document (generateOnlieTradingRequest, matching the generateOnlineTradingAccess document type) and a separate 'fitRequest' document used for the outbound payload.
1. If userCode is present, convert it from string to a numeric/object type (commonUtility.string.stringToObject:stringToObject) and set it as fitRequest.webUserCode (i.e. userCode is sent to FIT as a number, not a string).
1. Serialize fitRequest to JSON (requestBody).
1. Validate generateOnlieTradingRequest against the generateOnlineTradingAccess document schema via pub.schema:validate (conformsTo = the document type itself). This is a structural/type validation pass, not a simple mandatory-field check.
1. If schema validation fails (isValid=false): raise a '1069 <fieldPath><errorMessage>' error using the first entry in the errors array (errors[0].pathName + errors[0].errorMessage).
1. If schema validation succeeds: call CRM.services.utils:getFITToken.
1. If the token call returns statusCode=200: look up ETRADE_BASE_URL from static configuration (via commonUtility.services:getStaticData, single-key variant — note this differs from the multi-key 'keys' array variant (commonUtility.v2.services:getStaticData) used in the other flows), then POST requestBody to '<baseUrl>/IntegrationAPI/IntegrationWServices/EnableCustomerforOnlineApplication' with headers Content-Type: application/json, access-token: <token>, loadAs=bytes.
1. If HTTP response status header = 200: convert response bytes to string and parse as JSON (resDoc). If resDoc.code == "200" AND resDoc.status == "Success": map resDoc.onlineTradingUserId/userName/password → response.*, responseCode='200', responseMessage='success'. Otherwise: responseCode='1018', responseMessage = resDoc.status.
1. If HTTP response status header != 200: convert response bytes to string as both responseString and responseMessage, responseCode='1018'.
1. If token acquisition failed: statusCode='1017' (note: NOT written into responseCode — see below), responseMessage='Failed to get the token from wasata', responseString = token error message.
1. Catch block: recover requestBody/requestTimestamp/correlationID from the exception's pipeline snapshot; classify as '1069' (also sets response.status='Error') vs '500' as in the other flows; then serialize the 'response' document to JSON and store it as responseBody.
1. Finally block: capture responseTimestamp, async-log to SEQDatalust with serviceName='CRM.services.wasataOnboarding:generateOnlineTradingAccess' and responseBody=responseString, clear pipeline preserving correlationID.

### 3.5.6 Validation Rules

| **Field / condition** | **Error code** | **Message / rule** |
| --- | --- | --- |
| generateOnlieTradingRequest (whole document) | 1069 | Validated against the generateOnlineTradingAccess JSON-schema/document type via pub.schema:validate; on failure the message is built dynamically as "1069 " + errors[0].pathName + errors[0].errorMessage. |

### 3.5.7 Field-Level Mapping

Simple 1:1 field copy (clientId, onBoardingStatus, userCode) from the flat input into the FIT request, with one type conversion: userCode (string) → webUserCode (numeric) via stringToObject.

### 3.5.8 External Dependency & Configuration

| **Attribute** | **Value** |
| --- | --- |
| Purpose | Enable customer for online trading application |
| Method | POST |
| URL | {ETRADE_BASE_URL}/IntegrationAPI/IntegrationWServices/EnableCustomerforOnlineApplication |
| Headers | Content-Type: application/json; access-token: <FIT bearer token> |
| Body | JSON-serialized fitRequest { clientId, onBoardingStatus, webUserCode } |
| Success mapping | onlineTradingUserId, userName, password → response.*  (only when resDoc.code=='200' && resDoc.status=='Success') |

### 3.5.9 Error Code Reference

**_Client Input Errors — errorCode/errorMsg returned_**

*Caused by the caller's own input; the specific reason is safe to return.*

| **errorCode** | **responseCode / responseMessage** | **errorMsg (returned)** |
| --- | --- | --- |
| GOT-V-001 | 400 / Bad Request | Schema validation failed |

**_Backend / Provider Errors — errorCode/errorMsg left null_**

*Caused by this service's own infrastructure or its upstream dependency, not the caller's input — never surfaced via errorCode/errorMsg; detail is written to the server log only, keyed by correlationID.*

| **Internal code** | **responseCode / responseMessage** | **Logged detail only — never returned** |
| --- | --- | --- |
| GOT-B-001 | 502 / Bad Gateway | FIT returned code != "200" or status != "Success" while enabling online trading access. |
| GOT-B-002 | 502 / Bad Gateway | Unable to obtain a FIT bearer access token (legacy sets an internal statusCode='1017' here — see Implementation Notes). |
| GOT-B-003 | 503 / Service Unavailable | Unhandled exception in the generate-online-trading-access flow. |

### 3.5.10 Implementation Notes

- userCode is sent to FIT as a numeric field (webUserCode) even though it is received as a string — reproduce this type conversion in the target DTO/mapper (e.g. Integer.parseInt with a clear client-input error, mapped to GOT-V-001, if it is not numeric).
- This is the only one of the six APIs whose legacy input validation is schema/structural (pub.schema:validate) rather than simple null checks — reproduce with Bean Validation (jakarta.validation) annotations or an equivalent JSON-Schema validator, and preserve the dynamic errorMsg (field path + reason) rather than a fixed string.
- OPEN ITEM: in the legacy flow, the token-failure branch sets a local variable statusCode='1017' but the outward-facing responseCode is not explicitly set in that branch — confirmed here as GOT-B-002/502 for the target design, but flag to the business/platform owner since the legacy behavior in that specific branch is ambiguous.
- Success requires BOTH resDoc.code=='200' AND resDoc.status=='Success' from FIT — implement as a compound condition, not either check alone.
- Same HTTP-200-always transport caveat as createCustomer applies here (see §3.1 Implementation Notes).

## 3.6 finalizeMigration

Finalizes a client-migration record by invoking a database stored procedure (via a JDBC Adapter service) for a given clientID, and returns a simple success/error response.

### 3.6.1 Endpoint

| **Attribute** | **Detail** |
| --- | --- |
| HTTP Method | POST |
| Path | /wasataOnboarding/finalizeMigration |
| Content Type | application/json |
| Authentication | Not enforced by the legacy service itself — confirm the gateway/API Manager policy layer in front of this endpoint. |
| webMethods service | CRM.services.wasataOnboarding:finalizeMigration |

### 3.6.2 Request Body

| **Field (indentation shows nesting)** | **Notes** |
| --- | --- |
| `clientID: string` |  |

**Sample:**

```json
{
  "clientID": "CL0001234"
}
```

### 3.6.3 Response Body

Rows are shaded by nesting depth: a field of Type “Document” is itself a nested object, and its children are the rows immediately below it at the next depth.

| **Field** | **Type** | **Notes** |
| --- | --- | --- |
| `responseCode` | string | Mirrors the actual HTTP status code returned in the header, as a string. Always present. |
| `responseMessage` | string | Mirrors the actual HTTP reason phrase. Always present. |
| `errorCode` | string \| null | App-level error code, populated only for client-input errors (see Error Code Reference); null on success and null on backend/provider errors. |
| `errorMsg` | string \| null | Human-readable client-input error description; null on success and null on backend/provider errors (server-log-only in that case). |
| `correlationID` | string | Request correlation ID (caller-supplied or generated). Always present. |

**Sample — Success:**

```json
{
  "responseCode": "200", "responseMessage": "OK", "errorCode": null, "errorMsg": null,
  "correlationID": "a1b2c3d4-..."
}
```

**Sample — Client Input Error:**

```json
{
  "responseCode": "400", "responseMessage": "Bad Request", "errorCode": "FZM-V-001",
  "errorMsg": "clientID cannot be null or empty", "correlationID": "a1b2c3d4-..."
}
```

**Sample — Backend/Provider Error:**

```json
{
  "responseCode": "502", "responseMessage": "Bad Gateway", "errorCode": null, "errorMsg": null,
  "correlationID": "a1b2c3d4-..."
}
```

### 3.6.4 Response Headers — HTTP Status Codes

| **HTTP Status** | **Reason Phrase** | **Meaning** |
| --- | --- | --- |
| 200 | OK | Migration finalized successfully. |
| 400 | Bad Request | clientID missing (FZM-V-001). |
| 502 | Bad Gateway | The database stored procedure reported a failure or returned no result (FZM-B-001). |
| 503 | Service Unavailable | An unhandled internal exception occurred (FZM-B-002). |

### 3.6.5 Business & Validation Logic

1. Generate correlationID (if absent) and capture requestTimestamp.
1. Serialize clientID into a JSON request body ({"clientID": "..."}) purely for audit-log purposes (requestBody); if that fails, default requestBody to '{}'.
1. Validate: clientID is mandatory ("1069 clientID cannot be null or empty").
1. Invoke the JDBC Adapter service CRM.adapters:finalizeMigration, mapping clientID → finalizeMigrationInput.PCL_MAIN_CLIENT_ID (this is a database stored-procedure call; the adapter connection name and the procedure's SQL text are defined in the WmDB/JDBC adapter connection configuration, which is not exported in this package and must be sourced from the WebMethods Integration Server admin/Designer project or the DBA).
1. The adapter returns finalizeMigrationOutput.PRES (a single string output parameter).
1. If PRES is present/non-empty (truthy branch): responseCode='200', responseMessage='OK'.
1. If PRES is absent: raise an error "SP error code: %finalizeMigrationOutput/PRES%" via checkAndThrowError, immediately followed by a second checkAndThrowError('SP exception') — i.e. any non-success outcome from the stored procedure is treated as a flow failure and funneled into the standard catch block.
1. Catch block: same '1069' vs '500' classification as the other flows (no pipeline-recovery step is present here, unlike createSubAccounts/updateSubAccounts/generateOnlineTradingAccess/updateCustomer).
1. Finally block: build responseBody = JSON { correlationID, responseCode, responseMessage } (default '{}' if serialization fails), capture responseTimestamp, async-log to SEQDatalust, clear pipeline preserving correlationID.

### 3.6.6 Validation Rules

| **Field / condition** | **Error code** | **Message / rule** |
| --- | --- | --- |
| clientID | 1069 | "1069 clientID cannot be null or empty" |

### 3.6.7 Field-Level Mapping

Single field mapping: clientID → finalizeMigrationInput.PCL_MAIN_CLIENT_ID (stored-procedure input parameter). Output: finalizeMigrationOutput.PRES (stored-procedure output/result parameter).

### 3.6.8 External Dependency & Configuration

| **Attribute** | **Value** |
| --- | --- |
| Purpose | Finalize client migration (database stored procedure via JDBC Adapter) |
| Method | DB (JDBC Adapter / stored procedure call — not an HTTP call) |
| URL | Adapter connection alias ($connectionName) + stored procedure bound to CRM.adapters:finalizeMigration (exact procedure name/connection must be confirmed from the Integration Server JDBC Adapter configuration, not present in this export) |
| Headers | (none) |
| Body | PCL_MAIN_CLIENT_ID = clientID (plus optional overrideCredentials.$dbUser / $dbPassword inputs present on the adapter signature but not populated by this flow) |
| Success mapping | PRES (non-empty ⇒ success) |

### 3.6.9 Error Code Reference

**_Client Input Errors — errorCode/errorMsg returned_**

*Caused by the caller's own input; the specific reason is safe to return.*

| **errorCode** | **responseCode / responseMessage** | **errorMsg (returned)** |
| --- | --- | --- |
| FZM-V-001 | 400 / Bad Request | clientID is mandatory |

**_Backend / Provider Errors — errorCode/errorMsg left null_**

*Caused by this service's own infrastructure or its upstream dependency, not the caller's input — never surfaced via errorCode/errorMsg; detail is written to the server log only, keyed by correlationID.*

| **Internal code** | **responseCode / responseMessage** | **Logged detail only — never returned** |
| --- | --- | --- |
| FZM-B-001 | 502 / Bad Gateway | The stored procedure returned no PRES value / reported a failure (SP error). |
| FZM-B-002 | 503 / Service Unavailable | Unhandled exception in the finalize-migration flow. |

### 3.6.10 Implementation Notes

- This is the only API in the package backed by a database stored procedure (via a JDBC Adapter) rather than a FIT REST call — implement via Spring's JdbcTemplate.call(...) / a @NamedStoredProcedureQuery, not an HTTP client.
- OPEN ITEM: the actual JDBC connection alias and stored-procedure name are not present in this export and must be sourced from the Integration Server Adapter configuration or the DBA before implementation can begin.
- The adapter signature also exposes optional overrideCredentials ($dbUser/$dbPassword) that this flow does not populate — confirm whether the target should support per-call credential override or always use the pooled/default datasource connection.
- Unlike the other five APIs, this flow's catch block does not recover requestBody/requestTimestamp/correlationID from a pipeline snapshot — ensure the Java exception handler still has access to correlationID for logging (e.g. via a request-scoped context set before the try block, as recommended package-wide).

3.7 Sample input and output for API’s

https://alramz.atlassian.net/wiki/spaces/INTEGRATIO/pages/3391586305/CRM+to+WASATA

# 4. Appendix

## 4.1 Shared Document Types Referenced

The following webMethods document types are reused across multiple services and should map to shared Java DTOs/records rather than being redefined per service: ClientInformation, Address, BoardResolution, ChamberOfCommerce, ClientClassification, BackgroundCheck, FaceVerification, IDType, CRS, ProductSelection, ClientSuitabilityAppropriateness (createCustomer/updateCustomer); SubAccountInformation, ShareHolding, AccessMarket, AccessGroup, BankInterface, BoardMember, Fatca, PortfolioManagement, Insider, POA, RelatedParties (createSubAccounts/updateSubAccounts).

## 4.2 Open Items to Confirm Before Rewrite Sign-off

- finalizeMigration: the actual JDBC connection alias and stored-procedure name bound to CRM.adapters:finalizeMigration are not present in this export and must be obtained from the Integration Server Adapter configuration or the DBA.
- generateOnlineTradingAccess: the token-failure branch's outward responseCode is ambiguous in the legacy source (see GOT-B-002) — confirm intended target behaviour.
- updateSubAccounts: error-response parsing differs slightly from createSubAccounts (raw body passed through vs. an errors[] array joined) — confirm whether intentional.
- Confirm whether FIT access tokens returned by getFITToken have a defined expiry/TTL the Java implementation should cache against, to avoid re-authenticating on every call.
- Confirm with API consumers whether the legacy “always-HTTP-200” transport behaviour may be changed to real per-outcome HTTP status codes as specified in each service's §3.x.4 table, or must be preserved for backward compatibility.

## 4.3 Documentation Conventions

Nested response-schema fields are shaded by nesting depth, not by row index — a field of Type “Document” is itself a nested object, its children sit at the next depth and share one color. This is the standard convention for any nested request/response body table in this programme, consistent with the IBAN Validation Service specification.
