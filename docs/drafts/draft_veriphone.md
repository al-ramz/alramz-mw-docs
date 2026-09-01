# Phone Verify Service — Software Requirements Specification (SRS)

## Document Metadata

| Item | Value |
|------|-------|
| **Package** | VeriPhone |
| **Service** | Verify |
| **Migration Target** | Spring Boot 3.x |
| **Java Version** | Java 21 |

## 1. Executive Summary

The **Verify** service is a **phone number verification endpoint** that accepts a phone number, validates it against a known format, and optionally invokes an external VeriPhone verification API when running in the **PROD environment**. The service provides a unified interface for verifying mobile phone numbers by combining internal validation with an external verification service. The flow processes the incoming request through a series of validation, transformation, and external integration steps, returning a structured response that includes the verification status, phone details, and metadata.

## 2. Business Rules

| ID         | Requirement / Business Rule              | Type                         | Condition / Validation                                                                 | Expected Action / Outcome                                                                |
| ---------- | ---------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **BR-001** | **Phone Number Required**                | Mandatory / Input Validation | `phone` is missing, `null`, or empty                                                   | Return **HTTP 400** with `{"error": "Phone number is required"}`                         |
| **BR-002** | **Phone Number Format Validation**       | Format Validation            | Phone must match `+?[0-9][0-9-]*` and be **7–15 characters**                           | If invalid, return **HTTP 422** with `{"error": "Invalid phone number format"}`          |
| **BR-003** | **Mobile Number Validation**             | Validation Service           | `commonValidator.mobileNumber:validateMobileNumber` must return **valid**              | If validation fails, return **HTTP 422** with `{"error": "Invalid phone number format"}` |
| **BR-004** | **Environment Validation**               | Configuration / Value        | Environment must be one of `PROD`, `STAGING`, or `DEV`                                 | Process only supported environments                                                      |
| **BR-005** | **Static Configuration Validation**      | Configuration / Lookup       | `VERIPHONE_API_CALL_ENABLED` and `VERIPHONE_BASE_URL` must be available in static data | Required configuration must be available for processing/API invocation                   |
| **BR-006** | **VeriPhone API Invocation**             | Business Rule / External API | Environment is **PROD** **AND** `VERIPHONE_API_CALL_ENABLED = true`                    | Invoke external VeriPhone API using `pub.client:http`                                    |
| **BR-007** | **VeriPhone API Configuration**          | Configuration                | `VERIPHONE_BASE_URL` and `VERIPHONE_API_KEY` are available                             | Use `VERIPHONE_BASE_URL` as the endpoint and `VERIPHONE_API_KEY` for authentication      |
| **BR-008** | **VeriPhone API Invocation Restriction** | Business Rule                | Environment is **not PROD** OR `VERIPHONE_API_CALL_ENABLED != true`                    | **Do not invoke** the VeriPhone API                                                      |

## 3. Spring Boot API Design

### API Details

| Attribute | Value |
|-----------|-------|
| **Endpoint** | `POST /api/v1/verify` |
| **Content-Type** | `application/json` |

## 4. Sample POST Request

```http
POST /api/v1/verify HTTP/1.1
Host: verification.internal.company.com
Content-Type: application/json
Authorization: Bearer <token>

{
  "phone": "+971501234567"
}
```

## 5. Sample External Request

```http
POST https://api.veriphone.io/v2/verify?key=VERIPHONE_API_KEY&phone=971502540238
Content-Type: application/json

```

## 6. Sample External Response

### Successful Response from VeriPhone API

```json
{
  "responseCode": "200",
  "responseMessage": "OK",
  "body": {
    "phone": "+971501234567",
    "verificationStatus": "VALID",
    "validatedAt": "2025-01-01T12:34:56.789+04:00",
    "carrier": "du",
    "country": "United Arab Emirates",
    "countryCode": "AE",
    "localNumber": "501234567",
    "internationalNumber": "+971501234567",
    "e164": "+971501234567",
    "type": "mobile"
  }
}
```

### Error Response (Invalid Phone)

```json
{
  "responseCode": "422",
  "responseMessage": "Invalid phone number format",
  "body": {
    "phone": "+971501234567",
    "validationError": "INVALID_FORMAT"
  }
}
```

## 7. Sample Response

```json
{
  "responseCode": "200",
  "responseMessage": "OK",
  "response": {
    "phone": "+971501234567",
    "verificationStatus": "VALID",
    "validatedAt": "2025-01-01T12:34:56.789+04:00",
    "carrier": "du",
    "country": "United Arab Emirates",
    "countryCode": "AE",
    "localNumber": "501234567",
    "internationalNumber": "+971501234567",
    "e164": "+971501234567",
    "type": "mobile"
  }
}
```
