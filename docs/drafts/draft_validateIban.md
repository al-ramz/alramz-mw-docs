# SRS - validateIBAN

**Package:** IBAN  
**Service:** validateIBAN  
**Prompt Version:** prompt_v2  
**Timestamp:** 2026-08-07 09:49:30

## Service Metadata

| Attribute | Value |
|---|---|
| **Service Name** | validateIBAN |
| **Package** | IBAN |
| **Description** | Validates an IBAN against an external banking validation service. Returns error codes and bank data for failed validations. |
| **Endpoint** | `POST /api/v1/iban/validate` |
| **HTTP Method** | GET |
| **Sample JSON Request** | `{"IBAN": "DE89370400440532013000"}` |
| **Sample JSON Response (Error - Missing IBAN)** | `{"responseCode": "1069", "responseMessage": "Missing IBAN"}` |
| **Sample JSON Response (Error - Illegal Chars)** | `{"responseCode": "1079", "responseMessage": "IBAN contains illegal characters"}` |
| **Sample JSON Response (Error - Country Not Supported)** | `{"responseCode": "1077", "responseMessage": "Country does not support IBAN standard"}` |
| **Sample JSON Response (Error - Length Incorrect)** | `{"responseCode": "1078", "responseMessage": "IBAN Length is not correct"}` |

#### Processing Steps

1. Verify that the **IBAN** field is not null or empty.
2. If the IBAN is valid for processing, the system shall send an HTTP **GET** request to the IBAN validation API.

#### API Request

**Method:** `GET`

**Endpoint:**

```text
https://api.iban.com/clients/api/v4/iban/
```

**Query Parameters**

| Parameter | Description | Required |
|-----------|-------------|----------|
| `iban` | IBAN number to validate | Yes |
| `format` | Response format (`json`) | Yes |
| `api_key` | API authentication key | Yes |

**External API Request Details**

**External API Call**

```http
GET https://api.iban.com/clients/api/v4/iban/?iban=LY29010012000012152920001&format=json&api_key=ed02a1c10b60c56b87d25f1ad9518388
```

**External Sample 200 Response**
```json
{
  "bankData": {
    "bic": "BUKBGB22XXX",
    "branch": "CHELTENHAM",
    "bank": "BARCLAYS BANK UK PLC",
    "address": "UK",
    "city": "Leicester",
    "state": " ",
    "zip": "LE87 2BB",
    "phone": "0345 7345345",
    "fax": "<result>",
    "www": "http://bank.ae",
    "email": "bannk@uk.com",
    "country": "United Kingdom",
    "countryISO": "GB",
    "countryISO3": "GBR",
    "account": "55555555",
    "bankCode": "BUKB",
    "branchCode": "202015"
  },
  "validations": {
    "chars": {
        "code": "006",
        "message": "IBAN does not contain illegal characters"
    },
    "account": {
        "code": "002",
        "message": "Account Number check digit is correct"
    },
    "iban": {
        "code": "001",
        "message": "IBAN Check digit is correct"
    },
    "structure": {
        "code": "005",
        "message": "IBAN structure is correct"
    },
    "length": {
        "code": "003",
        "message": "IBAN Length is correct"
    },
    "countrySupport": {
        "code": "007",
        "message": "Country supports IBAN standard"
    }
  }
}
```

***Sample 500 error response***
```json
{
    "responseCode": "500",
    "responseMessage": "Internal Server Error",
    "correlationID":"135e54e7-4b73-4480-bce7-9863babb2806"
}
```


## REST API Design for Migration

## API Details

**HTTP Method:** `POST`

**Endpoint:**
```
POST /api/v1/iban/validate
```

**Request Body:**
```json
{
  "IBAN": "DE89370400440532013000"
}
```

***Business Validations and rules***

### Request Validation
1. IBAN field should not be null
if (iban == null || iban.isBlank()) {
  return IBANValidationResponse.error("1069", "Missing IBAN");
}

### Response Formation
```java
// Check chars validation
if (!"006".equals(externalResponse.getValidations().getChars().getCode())) {
    return IBANValidationResponse.error("1078", "IBAN contains illegal characters");
}

// Check account validation
String accountCode = externalResponse.getValidations().getAccount().getCode();
if (!"004".equals(accountCode) && !"002".equals(accountCode)) {
    return IBANValidationResponse.error("1074", "Account Number check digit not correct");
}

// Check IBAN validation sub-codes
String ibanCode = externalResponse.getValidations().getIban().getCode();
switch (ibanCode) {
    case "001": return IBANValidationResponse.error("1075", "IBAN Check digit not correct");
    case "005": return IBANValidationResponse.error("1076", "IBAN Length is not correct");
    case "003": return IBANValidationResponse.error("1079", "Country does not support IBAN standard");
    case "007": return IBANValidationResponse.success(externalResponse.getBankData(), externalResponse.getValidations());
    default: return IBANValidationResponse.error("1077", "IBAN Structure is not correct");
}
```


**Response (Success):**
```json
{
  "responseCode": "200",
  "responseMessage": "OK",
  "response": {
    "bankData": {
        "bic": "ABCDE12345",
        "bank": "Abu Dhabi Commercial Bank",
        "address": "SALAM STREET",
        "city": "ABU DHABI",
        "country": "United Arab Emirates",
        "countryISO": "AE",
        "countryISO3": "ARE",
        "account": "0012552369920001",
        "bank_code": "003"
    },
    "validations": {
        "chars": {
        "code": "000",
        "message": "IBAN does not contain illegal characters"
        },
        "account": {
        "code": "000",
        "message": "Account Number check digit is correct"
        },
        "iban": {
        "code": "000",
        "message": "IBAN Check digit is correct"
        },
        "structure": {
        "code": "000",
        "message": "IBAN Structure is correct"
        },
        "length": {
        "code": "000",
        "message": "IBAN Length is correct"
        },
        "country_support": {
        "code": "000",
        "message": "Country supports IBAN standard"
        }
    },
    "document": {
        "bank_data": {...}
    }
  }
}
```

**Response (Error - Missing IBAN):**
```json
{
  "responseCode": "1069",
  "responseMessage": "Missing IBAN"
}
```

**Response (Error - Illegal Chars):**
```json
{
  "responseCode": "1079",
  "responseMessage": "IBAN contains illegal characters"
}
```

**Response (Error - Country Not Supported):**
```json
{
  "responseCode": "1077",
  "responseMessage": "Country does not support IBAN standard"
}
```

# Implementation Flow

```
Receive Request
  |
  V
Validate Request (IBAN present?)
  |
  V
Get IBAN_BASE_URL & IBAN_API_KEY from static cache
  |
  V
Call External Validation API 
  |
  V
Extract Validation Results (validations/chars/code, validations/account/code, etc.)
  |
  V
Apply Business Rules (Branch Logic)
  |
  V
Handle Errors (Response Code 1069-1079 or 200)
  |
  V
Build Response and return (responseCode, responseMessage, response: {bankData, validations, document})

```
