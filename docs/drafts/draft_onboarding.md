# DFM Onboarding - Software Requirements Specification (SRS)

## Document Metadata

| Item                  | Value                                                                |
| --------------------- | -------------------------------------------------------------------- |
| Package               | **DFMIntegrations.v2.services**                                      |
| Service               | **onboarding** *(inferred from the Flow's configured function name)* |
| Generated On          | 10 August 2026                                                       |
| Migration Target      | Spring Boot 3.x / Java 21 / Maven                                    |
| Primary Business Area | Customer / DFM online onboarding                                     |

**Confirmed:** The Flow initializes the function name as `DFMIntegrations.v2.services:onboarding`. 
---

## Executive Summary

The service processes an online customer onboarding request for DFM-related onboarding. It accepts customer identity, contact, passport, address, payment, employment, investment, FATCA, and background-check information. Before creating an onboarding record, the service performs duplicate checks for Emirates ID, email address, NIN/trading number, and passport number. Duplicate identifiers are collected into an internal list, although the final duplicate-rejection branch is currently disabled in the Flow. The service also applies eligibility validations, including rejection of US citizens and validation of mandatory mobile number, email, NIN, nationality, and KYC/background-check information. Customer nationality fields are normalized by trimming whitespace and converting values to uppercase before comparison. The service serializes selected nested structures to JSON and then invokes the DFM onboarding persistence operation. A successful persistence operation returns response code `200` and message `OK`. Technical failures are converted into response code `400` with the captured error message, while a separate fallback produces `500 Internal Server Error`. 

| ID         | Type           | Area                         | Condition / Trigger                                                     | Developer Implementation                                                                                                                    | Expected Result                                                                                                       |
| ---------- | -------------- | ---------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **FR-001** | Functional     | Onboarding                   | Request received                                                        | Accept customer onboarding information covering identity, contact, documents, address, payment, employment, investment, FATCA and KYC data. | Begin onboarding processing.                                                                                          |
| **FR-002** | Functional     | Reference                    | At beginning of processing                                              | Generate a unique identifier.                                                                                                               | Use it as **Member Reference Number** and **Correlation ID**.                                                         |
| **FR-003** | Functional     | Mobile                       | `cust_mobile` starts with `971`                                         | Replace the `971` prefix with `00`.                                                                                                         | Normalized mobile number is used for subsequent processing.                                                           |
| **FR-004** | Validation     | Mobile                       | `cust_mobile` is missing                                                | Reject request.                                                                                                                             | **400** — `Mobile Number (cust_mobile) is missing`                                                                    |
| **FR-005** | Validation     | Email                        | `cust_email` is missing                                                 | Reject request.                                                                                                                             | **400** — `Email Address (cust_email) is missing`                                                                     |
| **FR-006** | Validation     | NIN                          | `cust_nin` is missing                                                   | Reject request.                                                                                                                             | **400** — `NIN Number (cust_nin) is missing`                                                                          |
| **FR-007** | Validation     | KYC                          | `kyc_match` is missing                                                  | Reject request.                                                                                                                             | **400** — `Background check (kyc_match) is missing`                                                                   |
| **FR-008** | Validation     | FATCA                        | `fatca_uscitizen` is missing                                            | Reject request.                                                                                                                             | **400** — `USCitizen (fatca_uscitizen) is missing`                                                                    |
| **FR-009** | Validation     | Nationality                  | Relevant nationality information is missing                             | Validate `eid_nationality` and then `pp_nationality`.                                                                                       | **400** — `Client nationality is missing`                                                                             |
| **FR-010** | Eligibility    | US Citizen                   | `fatca_uscitizen` indicates US citizen                                  | Stop onboarding processing.                                                                                                                 | **400** — `Online onboarding is unavailable for US citizens`                                                          |
| **FR-011** | Eligibility    | Emirates ID nationality      | `eid_nationality` is supplied and, after trim + uppercase, equals `USA` | Reject onboarding.                                                                                                                          | **400** — `Online onboarding is unavailable for US citizens - eid_nationality`                                        |
| **FR-012** | Eligibility    | Passport nationality         | `pp_nationality` is supplied and, after trim + uppercase, equals `USA`  | Reject onboarding.                                                                                                                          | **400** — `Online onboarding is unavailable for US citizens - pp_nationality`                                         |
| **FR-013** | Eligibility    | Personal information country | `pinf_country` is supplied and, after trim + uppercase, equals `USA`    | Reject onboarding.                                                                                                                          | **400** — `Online onboarding is unavailable for US citizens - pinf_country`                                           |
| **FR-014** | Duplicate      | Emirates ID                  | `eid_no` is supplied                                                    | Invoke `IfEIDExists`.                                                                                                                       | If ID exists, add **`EmiratesID Number`** to duplicate list.                                                          |
| **FR-015** | Duplicate      | Email                        | `cust_email` is supplied                                                | Invoke `IfEmailExists`.                                                                                                                     | If email exists, add **`Email Address`** to duplicate list.                                                           |
| **FR-016** | Duplicate      | NIN                          | `cust_nin` is supplied                                                  | Invoke `FITIntegrations.adapters:ifNINOrTradingNumberExist` with NIN and exchange `DFM`.                                                    | If `ninExists = true`, add **`NIN`** to duplicate list.                                                               |
| **FR-017** | Duplicate      | Passport                     | `pp_no` is supplied                                                     | Invoke `IfPassportExists`.                                                                                                                  | If `ppExists = true`, add **`Passport Number`** to duplicate list.                                                    |
| **FR-018** | Duplicate      | Duplicate rejection          | Duplicate list contains values                                          | Do **not** reject automatically. The duplicate rejection branch is disabled in the current Flow.                                            | Continue processing unless business confirms otherwise.                                                               |
| **FR-019** | Transformation | Nested data                  | Before persistence                                                      | Serialize selected nested structures to JSON.                                                                                               | JSON strings prepared for persistence: market-employee information, CSR information and KYC/background-check details. |
| **FR-020** | Persistence    | Onboarding                   | Validation and processing complete                                      | Invoke DFM onboarding persistence operation.                                                                                                | Persist onboarding request.                                                                                           |
| **FR-021** | Response       | Successful persistence       | Persistence succeeds                                                    | Build successful response.                                                                                                                  | `response_code = 200`, `response_message = OK`                                                                        |
| **FR-022** | Error Handling | Technical failure            | Persistence or processing operation fails                               | Capture the error and build an appropriate error response.                                                                                  | Error response returned with the relevant error message.                                                              |
| **FR-023** | Correlation    | External calls               | Downstream processing                                                   | Pass the generated correlation ID to duplicate checks and persistence operations where supported by the integration.                        | End-to-end request traceability.                                                                                      |

## Overall Request Validation Workflow
```text
Receive onboarding request
        |
        v
Generate Member Reference / Correlation ID
        |
        v
Validate mandatory fields
        |
        +---- Invalid ----> Return 400
        |
        v
Validate US citizen / nationality rules
        |
        +---- US Citizen ----> Return 400
        |
        v
Normalize mobile number
        |
        v
Check Emirates ID duplicate
        |
        v
Check Email duplicate
        |
        v
Check NIN duplicate (DFM)
        |
        v
Check Passport duplicate
        |
        v
Collect duplicate information
        |
        |  NOTE: Do NOT reject duplicates
        |  because rejection branch is disabled
        |
        v
Serialize nested information to JSON
        |
        v
Invoke DFM onboarding persistence
        |
        +---- Failure ----> Return error response
        |
        v
Return 200 / OK
```
## Duplicate checks

| Field      | Duplicate operation         |
| ---------- | --------------------------- |
| eid_no     | `IfEIDExists`               |
| cust_email | `IfEmailExists`             |
| cust_nin   | `ifNINOrTradingNumberExist` |
| pp_no      | `IfPassportExists`          |

## External Integrations

| Integration ID | External Operation                                          | Purpose                                                                 | Request Fields                                                             | Response Fields        | Success Criteria                          | Failure Handling                                                                       |
| -------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------- |
| **INT-001**    | `eTradeFIT.v2.services.InternalOnboarding:IfEIDExists`      | Check whether the supplied Emirates ID already exists.                  | `eidNumber ← eid_no`<br>`correlationID ← generated GUID`                   | `exists → eidExists`   | Duplicate status determined successfully. | If service is unavailable, return technical error and stop processing.                 |
| **INT-002**    | `eTradeFIT.v2.services.InternalOnboarding:IfEmailExists`    | Check whether the supplied email address already exists.                | `emailAddress ← cust_email`<br>`correlationID ← generated GUID`            | `exists → emailExists` | Duplicate status determined successfully. | If service is unavailable, return technical error and stop processing.                 |
| **INT-003**    | `FITIntegrations.adapters:ifNINOrTradingNumberExist`        | Check whether the supplied NIN or trading number already exists in DFM. | `NIN ← cust_nin`<br>`exchange ← DFM`<br>`tradingNumber ← downstream value` | `ninExists`            | Duplicate status determined successfully. | If service is unavailable, return technical error and stop processing.                 |
| **INT-004**    | `eTradeFIT.v2.services.InternalOnboarding:IfPassportExists` | Check whether the supplied passport number already exists.              | `ppNumber ← pp_no`<br>`correlationID ← generated GUID`                     | `exists → ppExists`    | Duplicate status determined successfully. | If service is unavailable, return technical error and stop processing.                 |
| **INT-005**    | `DFMIntegrations.v2.adapters:insertDFMOnboardingRequest`    | Persist the validated onboarding request into DFM onboarding system.    | Complete onboarding request payload.<br>`ACCOUNT_STATUS = NEW`             | `insertionResult`      | Persistence successful.                   | Return `400 + lastError` or `500 + Internal Server Error` depending on exception path. |


??? "eTradeFIT.v2.services.InternalOnboarding:IfEIDExists"

    ## Validation Rules  
    
    | Rule ID | Rule Description |
    |---------|------------------|
    | **V‑001** | `referenceNo` must match regex `^[A-Za-z0-9]{1,36}$`. |
    | **V‑002** | `eidNumber` must match regex `^[A-Za-z0-9]{1,20}$`. |
    | **V‑003** | `lang` must be a valid ISO‑639‑1 language code (if present). |
    | **V‑004** | `islamicMode` must be either `"true"` or `"false"` (case‑insensitive). |
    
    ## Integration API (External Service)  
    
    | Attribute | Detail |
    |-----------|--------|
    | **Purpose** | Provides a binary "EID exists?" check. Returns a JSON payload indicating success/failure and optional token. |
    | **HTTP Method** | **POST** (as inferred from the flow's request construction). |
    | **Endpoint** | `<baseURL>/IntegrationAPI/IntegrationWServices/IfEIDExists` |
    | **Authentication** | Bearer token taken from inbound request's `Authorization` header; forwarded to the external API as `Authorization: Bearer <accessToken>`. |
    | **Headers** | <ul><li>`Content-Type: application/json`</li><li>`Authorization: Bearer <accessToken>`</li></ul> |
    | **Request Body** | JSON containing at least `eidNumber` (and optionally `islamicMode`, `lang`). |
    
    ## Sample External Request  
    
    ```http
    POST https://api.external.com/IntegrationAPI/IntegrationWServices/IfEIDExists
    Authorization: Bearer abc123xyz
    Content-Type: application/json
    
    {
      "referenceNo": "REQ-20251103-001",
      "eidNumber": "E1234567890",
      "islamicMode": "false",
      "lang": "en"
    }
    ```
    
    ---
    
    ## Sample External Response  
    
    ```json
    {
      "status": "SUCCESS",
      "referenceNo": "REQ-20251103-001",
      "newToken": "TKN-987654321",
      "resData": {
        "eidVerified": true,
        "verificationDate": "2025-11-03T10:15:00Z"
      }
    }
    ```
    
    *If the external service reports failure:*
    
    ```json
    {
      "status": "FAILURE",
      "referenceNo": "REQ-20251103-001",
      "errorCode": "E1001",
      "resData": {}
    }
    ```
    
    
    | Error Code | Message | Primary Cause | Propagated To Caller? |
    |------------|---------|---------------|-----------------------|
    | **99** | Generic technical failure | Timeout, parsing error, missing required field, unexpected exception | Yes – returned as `errorCode = 99` with `error` description. |
    | **E1001** | "Invalid EID format" | `eidNumber` fails validation | Yes – forwarded as `errorCode`. |
    | **E1002** | "Missing access token" | `accessToken` header absent or empty | Yes – returned as `errorCode`. |
    | **E1003** | "External service unavailable" | External HTTP returns 5xx or timeout | Yes – returned as `errorCode = 99` with message "External service unavailable". |
    | **E1004** | "Business validation failed" | External API returns `status = FAILURE` with known `errorCode` | Yes – `errorCode` value from external response is returned. |
    | **E1005** | "Invalid request payload" | Request JSON malformed or missing mandatory fields | Yes – returns `errorCode = 99`. |
    | **E1006** | "Logging failure" | Inability to write audit logs | **Non‑fatal** – flow continues; warning logged internally. |
    
    ## REST API Design for Spring Boot
    
    | Aspect | Detail |
    |--------|--------|
    | **HTTP Method** | `POST` |
    | **Endpoint** | `/api/v1/eid/validate` |
    | **Request JSON** | See *Sample External Request* (payload fields must match the service's input DTO). |
    | **Success Response (200 OK)** | ```json { "referenceNo": "REQ-20251103-001", "errorCode": "0", "newToken": "TKN-987654321", "status": "Success", "resData": { "eidVerified": true, "verificationDate": "2025-11-03T10:15:00Z" } } ``` |
    | **Failure Response (400 Bad Request)** | ```json { "referenceNo": "REQ-20251103-001", "errorCode": "E1001", "status": "Error", "resData": {} } ``` |
    | **Failure Response (502 Bad Gateway)** | ```json { "referenceNo": "REQ-20251103-001", "errorCode": "99", "status": "Error", "resData": {}, "error": "External service unavailable" } ``` |
    | **Validation Errors (422 Unprocessable Entity)** | Return a map of field → error message for any failed input validation. |
    
    

---

??? "FITIntegrations.adapters:ifNINOrTradingNumberExist"
    ## Oracle SQL Logic to check for ifNINOrTradingNumberExist

    ```sql
        SELECT
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM BV_PAR_CL_NIN_DET
                    WHERE UPPER(EXCHANGE_ID) = UPPER(:exchange)
                    AND UPPER(NIN) = UPPER(:nin)
                )
                THEN 1
                ELSE 0
            END AS NIN_EXISTS,

            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM BV_PAR_CL_NIN_DET
                    WHERE UPPER(EXCHANGE_ID) = UPPER(:exchange)
                    AND UPPER(C_ACCOUNT) LIKE UPPER(:trading_number)
                )
                THEN 1
                ELSE 0
            END AS TRADING_NUMBER_EXISTS
        FROM DUAL;
    ```

---

??? "eTradeFIT.v2.services.InternalOnboarding:IfEmailExists"

    ## Validation Rules  
    
    | Rule ID | Rule Description |
    |---------|------------------|
    | **VR‑001** | `emailAddress` must not be `null` or empty; must match a simple e‑mail regex (`^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$`). |
    | **VR‑002** | `accessToken` must be supplied in the HTTP header and must be a non‑blank string. |
    | **VR‑003** | `lang` (if present) must be a two‑letter ISO language code; otherwise default to `EN`. |
    | **VR‑004** | `islamicMode` (if present) must be `"0"` or `"1"`; any other value is treated as invalid request. |
    | **VR‑005** | All required fields must pass a length check (`emailAddress ≤ 256`, `referenceNo ≤ 64`). |
    | **VR‑006** | The constructed outbound JSON must be syntactically valid; otherwise the request is rejected with error code `1028`. |
    | **VR‑007** | If the external service returns an HTTP status ≥ 400, the pipeline interprets it as a failure and maps the `errorCode` accordingly. |
    | **VR‑008** | The `pk_id` generated for persistence must be a positive numeric value; otherwise an internal error is raised. |
    
    ## Sample External Request  
    
    ETRADE_BASE_URL = https://etradeqa.alramz.ae
    
    ```json
    POST {{ETRADE_BASE_URL}}/IntegrationAPI/IntegrationWServices/IfEmailExists HTTP/1.1
    Host: api.example.com
    access-token: abc123def456
    Content-Type: application/json
    Accept: application/json
    
    {
      "referenceNo": "REQ20251103-001",
      "accessToken": "abc123def456",
      "emailAddress": "john.doe@example.com",
      "lang": "EN",
      "islamicMode": "0"
    }
    
    ```
    
    ## Sample External Response
    ```json
    {
      "errorCode": "0",
      "responseCode": "200",
      "responseMessage": "OK",
      "newToken": "newAbc123Token",
      "pk_id": "1234567890",
      "resData": {
        "validationStatus": "EXISTS",
        "verifiedAt": "2025-11-03T12:34:56Z"
      }
    }
    ```
    
    *If the external service reports an invalid token:*
    
    ```json
    {
      "errorCode": "99",
      "responseCode": "1008",
      "responseMessage": "Invalid Token"
    }
    ```
    
    ## REST API Design for Spring Boot  
    
    | Element | Specification |
    |---------|----------------|
    | **HTTP Method** | `POST` |
    | **Endpoint** | `/api/v1/email/validate` |
    | **Request Content‑Type** | `application/json` |
    | **Success Response** | `200 OK` |
    | **Failure Responses** | - `400 Bad Request` – `Invalid Request Parameters`.<br>- `401 Unauthorized` – `Invalid Token`.<br>- `503 Service Unavailable` – `Backend Service Unavailable`.<br>- `500 Internal Server Error` – generic failure. |
    | **Validation Errors** | Return a JSON object containing `validationError` fields (e.g., `field: "emailAddress", message: "must not be empty"`). |
    | **Example Successful Request** | ```json { "emailAddress": "john.doe@example.com", "lang": "EN", "islamicMode": "0" }``` |
    | **Example Successful Response** | ```json { "responseCode": "200", "responseMessage": "OK", "referenceNo": "REQ20251103-001", "newToken": "newAbc123Token", "pk_id": "1234567890", "resData": { "validationStatus": "EXISTS" } }```
    
    
    

---

??? "eTradeFIT.v2.services.InternalOnboarding:IfPassportExists"

    ## Validation Rules
    
    | Field | Type (inferred) | Required | Validation / Rules | Description |
    |-------|-----------------|----------|--------------------|-------------|
    | `referenceNo` | **String** | Yes | Non‑empty; must match regex `[A-Z0-9]{8}` (assumed) | Identifier of the passport to verify. |
    | `accessToken` | **String** | Yes | Non‑empty; must be a valid bearer token format | Authentication token for the external API. |
    | `islamicMode` | **String** | No | – | Mode flag (e.g., `true`/`false`). |
    | `lang` | **String** | No | – | Language preference. |
    | `ppNumber` | **String** | No | – | Passport number (optional). 
    
    
    
    ## Sample External Request  
    
    ```json
    POST /IntegrationAPI/IntegrationWServices/IfPassportExists HTTP/1.1
    Host: etrade-base.example.com
    Content-Type: application/json
    Authorization: Bearer <accessToken>
    
    {
      "referenceNo": "AB123456",
      "accessToken": "<accessToken>",
      "islamicMode": "false",
      "lang": "en",
      "ppNumber": "12345"
    }
    ```
    
    *Only fields present in the incoming pipeline are transmitted.*
    
    ---
    
    ## Sample External Response  
    
    ### Successful (200)
    
    ```json
    {
      "status": "Success",
      "newToken": "X9Y8Z7",
      "pk_id": "1000001234",
      "resData": {
        "passportNumber": "AB123456",
        "expiryDate": "2028-12-31",
        "nationality": "US"
      },
      "errorCode": "0"
    }
    ```
    
    ### Failure (e.g., 404)
    
    ```json
    {
      "status": "Error",
      "newToken": "",
      "pk_id": "",
      "resData": {},
      "errorCode": "99"
    }
    ```
    
    
    ## REST API Design for Spring Boot  
    
    | Element | Value |
    |---------|-------|
    | **HTTP Method** | `POST` |
    | **Endpoint** | `/api/v1/passport/verify` |
    | **Request JSON** | See **Sample External Request** (fields `referenceNo`, `accessToken`, `islamicMode`, `lang`, `ppNumber`). |
    | **Success Response (200)** | ```json { "status": "Success", "referenceNo": "AB123456", "newToken": "X9Y8Z7", "pk_id": "1000001234", "resData": { … }, "errorCode": "0" } ``` |
    | **Failure Response (200 with error payload)** | ```json { "status": "Error", "referenceNo": "AB123456", "newToken": "", "pk_id": "", "resData": { "errorDetails": "message" }, "errorCode": "99" } ``` |
    | **Validation Errors (400)** | Return a JSON map of field → error message (e.g., `{ "referenceNo": "must not be empty" }`). |
    | **HTTP Status Codes** | `200` – always returned (business status encoded inside payload).<br>`400` – when client‑side validation fails.<br>`500` – should never be used; all errors are wrapped in payload with `status=Error`. |
    | **Content-Type** | `application/json` |
    | **Authentication** | Bearer token (`Authorization: Bearer <token>`) – validated by a Spring Security filter before reaching the controller. 
    
    
    

---

??? "DFMIntegrations.v2.adapters:insertDFMOnboardingRequest" 
    | Property             | Value                                   |
    | -------------------- | --------------------------------------- |
    | **Service type**     | `AdapterService`                        |
    | **Adapter type**     | `JDBC`                                  |
    | **Adapter template** | `Insert`                                |
    | **Adapter service**  | `com.wm.adapter.wmjdbc.services.Insert` |
    | **Table**            | `DFM_ONBOARDING_REQUESTS`               |
    | **Operation**        | `INSERT`                                |
    | **Connection**       | `MiddlewareConnection:Middleware`       |
    | **Input record**     | `insertDFMOnboardingRequestInput`       |
    | **Output**           | `result`                                |


    ```sql 
    INSERT INTO DFM_ONBOARDING_REQUESTS (
        ID,
        REQUEST_ID,
        MOBILE_NUMBER,
        EMAIL_ADDRESS,
        NIN,
        EID_DATE_OF_BIRTH,
        EID_EXPIRY_DATE,
        EID_FULL_NAME,
        EID_NUMBER,
        EID_ISSUE_DATE,
        EID_PRIMARY_ID,
        EID_SECONDARY_ID,
        EID_GENDER,
        EID_RESIDENCY_EXPIRY_DATE,
        EID_RESIDENCY_NUMBER,
        EID_FAMILY_ID,
        EID_NATIONALITY,
        EID_FULL_NAME_ARABIC,
        EID_ATTACHMENT_FRONT,
        EID_ATTACHMENT_BACK,
        EID_ATTACHMENT_TYPE,
        PP_DATE_OF_BIRTH,
        PP_EXPIRY_DATE,
        PP_FULL_NAME,
        PP_NUMBER,
        PP_NATIONALITY,
        PP_PRIMARY_ID,
        PP_SECONDARY_ID,
        PP_GENDER,
        PP_ATTACHMENT,
        PP_ATTACHMENT_TYPE,
        ADDRESS,
        CITY_NAME,
        MOTHER_NAME,
        POBOX,
        PHONE,
        COUNTRY,
        SIGNATURE_ATTACHMENT,
        SIGNATURE_ATTACHMENT_TYPE,
        PAYMENT_METHOD,
        PAYMENT_AED_IBAN,
        PAYMENT_USD_IBAN,
        PAYMENT_FRN_IBAN,
        PAYMENT_FRN_SWIFT,
        PAYMENT_COR_IBAN,
        PAYMENT_COR_SWIFT,
        PAYMENT_ROUTE_CODE,
        PORTFOLIO_OPTIONS,
        EMPLOYMENT_STATUS,
        EMPLOYER_NAME,
        EMPLOYMENT_POSITION,
        EMPLOYER_MARKET_OR_ISSUER,
        EMPLOYER_MARKET_OR_ISSUER_COMPANIES,
        RELATED_TO_MARKET_EMPLOYEE,
        RELATED_TO_MARKET_EMPLOYEE_RELATIVES_JSON,
        SOURCE_OF_INCOME,
        ANNUAL_INCOME_RANGE,
        INVESTMENT_KNOWLEDGE_EXTENT,
        INVESTMENT_STRATEGY,
        INVESTMENT_KNOWLEDGE_INSTRUMENTS,
        INVESTMENT_RISK_TOLERANCE,
        INVESTMENT_AMOUNT,
        INVESTMENT_KNOWLEDGE_IN_TRADING,
        INVESTMENT_KNOWLEDGE_SOURCE,
        EDUCATION_LEVEL,
        INVESTMENT_PREVIOUS_KNOWLEDGE,
        INVESTMENT_FREQUENCY,
        INVESTMENT_HIGH_RISK_AWARENESS,
        INVESTMENT_NET_EQUITY,
        ACCREDITED_BY_AUTHORITY,
        ACCREDITED_BY_AUTHORITY_LIST,
        ACCREDITED_BY_AUTHORITY_TYPE,
        QUALIFIED_INVESTOR,
        CSR_JSON,
        FATCA_US_CITIZEN,
        FATCA_TIN,
        BACKGROUND_CHECK,
        BACKGROUND_CHECK_JSON,
        MARGIN_TRADING_NUMBER,
        MEMBER_REFERENCE_NUMBER,
        ACCOUNT_STATUS
    )
    VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
    );
    ```
---

### Sample DFM Persistence Request
```json
{
  "requestId": "REQ-100001",
  "mobileNumber": "00971501234567",
  "emailAddress": "customer@example.com",
  "nin": "NIN123456",
  "eidNumber": "784-1990-1234567-1",
  "passportNumber": "P1234567",
  "country": "ARE",
  "fatcaUsCitizen": "N",
  "backgroundCheck": "MATCH",
  "memberReferenceNumber": "generated-guid",
  "accountStatus": "NEW"
}
```

### Sample DFM Persistence Response

```json
{
  "result": "SUCCESS"
}
```

## Persistence Mapping

The Flow maps the onboarding input into `insertDFMOnboardingRequestInput`.

Important mappings include:

```text
cust_mobile                    → MOBILE_NUMBER
cust_email                     → EMAIL_ADDRESS
cust_nin                       → NIN

eid_dob                        → EID_DATE_OF_BIRTH
eid_expirydate                 → EID_EXPIRY_DATE
eid_fullname                   → EID_FULL_NAME
eid_no                         → EID_NUMBER
eid_issuedate                  → EID_ISSUE_DATE
eid_primaryid                  → EID_PRIMARY_ID
eid_secondaryid                → EID_SECONDARY_ID
eid_sex                        → EID_GENDER
eid_nationality                → EID_NATIONALITY

pp_dob                         → PP_DATE_OF_BIRTH
pp_expirydate                  → PP_EXPIRY_DATE
pp_fullname                    → PP_FULL_NAME
pp_no                          → PP_NUMBER
pp_nationality                 → PP_NATIONALITY

pinf_address                   → ADDRESS
pinf_city                      → CITY_NAME
pinf_mothername                → MOTHER_NAME
pinf_pobox                     → POBOX
pinf_phone                     → PHONE
pinf_country                   → COUNTRY

pay_method                     → PAYMENT_METHOD
pay_aed_iban                   → PAYMENT_AED_IBAN
pay_usd_iban                   → PAYMENT_USD_IBAN
pay_frn_iban                   → PAYMENT_FRN_IBAN
pay_frn_swift                  → PAYMENT_FRN_SWIFT
pay_cor_iban                   → PAYMENT_COR_IBAN
pay_cor_swift                  → PAYMENT_COR_SWIFT
pay_routecode                  → PAYMENT_ROUTE_CODE

emp_status                     → EMPLOYMENT_STATUS
emp_name                       → EMPLOYER_NAME
emp_position                   → EMPLOYMENT_POSITION

fatca_uscitizen                → FATCA_US_CITIZEN
fatca_tin                      → FATCA_TIN

kyc_match                      → BACKGROUND_CHECK
kyc_match_details_json         → BACKGROUND_CHECK_JSON

member_reference_number        → MEMBER_REFERENCE_NUMBER
request_id                     → REQUEST_ID

ACCOUNT_STATUS                 → NEW
```

## Error Handling

| Error Code | Message                                                            | Cause                                  | Returned To Client |
| ---------- | ------------------------------------------------------------------ | -------------------------------------- | ------------------ |
| 400        | Online onboarding is unavailable for US citizens                   | `fatca_uscitizen` indicates US citizen | Yes                |
| 400        | Background check (kyc_match) is missing                            | KYC result absent                      | Yes                |
| 400        | USCitizen (fatca_uscitizen) is missing                             | FATCA citizen field absent             | Yes                |
| 400        | Online onboarding is unavailable for US citizens - eid_nationality | EID nationality = USA                  | Yes                |
| 400        | Online onboarding is unavailable for US citizens - pp_nationality  | Passport nationality = USA             | Yes                |
| 400        | Online onboarding is unavailable for US citizens - pinf_country    | Country = USA                          | Yes                |
| 400        | Mobile Number (cust_mobile) is missing                             | Mobile absent                          | Yes                |
| 400        | Email Address (cust_email) is missing                              | Email absent                           | Yes                |
| 400        | NIN Number (cust_nin) is missing                                   | NIN absent                             | Yes                |
| 400        | Client nationality is missing                                      | Nationality unavailable                | Yes                |
| 400        | Captured last-error message                                        | Persistence/technical exception        | Yes                |
| 500        | Internal Server Error                                              | Fallback/unhandled failure             | Yes                |

## Sample Logic Pseudocode

```text
onboard(request):

    correlationId = generateGuid()
    memberReferenceNumber = correlationId

    validateMandatoryFields(request)

    normalizeMobileNumber(request.customer.mobile)

    duplicateParameters = []

    if request.emiratesId.number is present:
        exists = checkEmiratesId(
            request.emiratesId.number,
            correlationId
        )

        if exists:
            duplicateParameters.add("EmiratesID Number")

    if request.customer.email is present:
        exists = checkEmail(
            request.customer.email,
            correlationId
        )

        if exists:
            duplicateParameters.add("Email Address")

    if request.customer.nin is present:
        exists = checkNinOrTradingNumber(
            request.customer.nin,
            "DFM"
        )

        if exists:
            duplicateParameters.add("NIN")

    if request.passport.number is present:
        exists = checkPassport(
            request.passport.number,
            correlationId
        )

        if exists:
            duplicateParameters.add("Passport Number")

    if request.fatca.usCitizen is missing:
        return businessError(
            400,
            "USCitizen (fatca_uscitizen) is missing"
        )

    if request.fatca.usCitizen indicates US citizen:
        return businessError(
            400,
            "Online onboarding is unavailable for US citizens"
        )

    if request.kyc.match is missing:
        return businessError(
            400,
            "Background check (kyc_match) is missing"
        )

    if request.emiratesId.nationality is present:
        nationality = normalize(
            request.emiratesId.nationality
        )

        if nationality == "USA":
            return businessError(...)

    if request.passport.nationality is present:
        nationality = normalize(
            request.passport.nationality
        )

        if nationality == "USA":
            return businessError(...)

    if request.personalInformation.country is present:
        country = normalize(
            request.personalInformation.country
        )

        if country == "USA":
            return businessError(...)

    if request.customer.mobile is missing:
        return businessError(...)

    if request.customer.email is missing:
        return businessError(...)

    if request.customer.nin is missing:
        return businessError(...)

    if nationality information is missing:
        return businessError(...)

    relatedPersonsJson =
        serializeToJson(request.employment.relatedPersons)

    csrJson =
        serializeToJson(request.csr)

    kycDetailsJson =
        serializeToJson(request.kyc.matchDetails)

    persistenceRequest =
        mapToDfmOnboardingRequest(request)

    persistenceRequest.accountStatus = "NEW"

    result = insertDfmOnboardingRequest(
        persistenceRequest
    )

    if insertion succeeded:
        return success(
            responseCode = "200",
            responseMessage = "OK",
            memberReferenceNumber,
            correlationId
        )

    handle persistence failure
```

## REST API Design for Spring Boot

## API Details

### Method

```http
POST
```

### Endpoint

```http
/api/v1/dfm/onboarding
```

### Content Type

```http
application/json
```

### Request

```json
{
  "requestId": "REQ-100001",
  "customer": {
    "mobile": "00971501234567",
    "email": "customer@example.com",
    "nin": "NIN123456"
  },
  "emiratesId": {
    "number": "784-1990-1234567-1",
    "nationality": "ARE"
  },
  "passport": {
    "number": "P1234567",
    "nationality": "ARE"
  },
  "personalInformation": {
    "country": "ARE"
  },
  "fatca": {
    "usCitizen": "N"
  },
  "kyc": {
    "match": "MATCH"
  }
}
```

### Success

```json
{
  "responseCode": "200",
  "responseMessage": "OK",
  "memberReferenceNumber": "GUID",
  "correlationId": "GUID"
}
```

### Business Failure

```json
{
  "responseCode": "400",
  "responseMessage": "Email Address (cust_email) is missing",
  "correlationId": "GUID"
}
```

## Implementation Flow

The service is essentially an **online DFM customer onboarding orchestration service**.

Its active business flow can be reduced to:

```text
Customer Onboarding Request
          |
          v
Generate Reference
          |
          v
Normalize Customer Data
          |
          v
Duplicate Checks
          |
          v
Eligibility Validation
          |
          v
Nationality / US Restriction
          |
          v
Mandatory Field Validation
          |
          v
Transform Nested Objects
          |
          v
Build DFM Persistence Request
          |
          v
Persist Onboarding
          |
          v
Return Result
```
