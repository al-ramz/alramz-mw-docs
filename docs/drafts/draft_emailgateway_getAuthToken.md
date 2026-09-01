# getAuthenticationToken — Software Requirements Specification (SRS)

## Document Metadata

| Attribute | Value |
|-----------|-------|
| **Package** | `EmailGateway` |
| **Service Name** | `getAuthenticationToken` |
| **Description** | Retrieves an OAuth 2.0 client credentials access token from Microsoft Graph. The service is invoked by a webMethods Integration Flow to obtain a token for subsequent email gateway operations. |
| **Input Type** | Correlation ID (optional), request metadata (timestamp, static configuration) |
| **Output Type** | `AuthResponse` — contains access token, correlation ID, response code, response message, response body, and static configuration data |
| **Suggested REST Endpoint** | `POST /api/v1/emailgateway/authentication/token` |
| **HTTP Method** | POST |
| **Authentication** | API Key in `X-API-Key` header (recommended for webMethods integration) |
| **External Dependencies** | Microsoft Graph (OAuth 2.0 Client Credentials flow), In-Memory Cache (IntegrationsCache), Error Handling Service |
| **Configuration Properties** | `MICROSOFT_GRAPH_TOKEN_BASE_URL`, `MICROSOFT_GRAPH_TOKEN_CLIENT_ID`, `MICROSOFT_GRAPH_TOKEN_TENANT_ID`, `MICROSOFT_GRAPH_TOKEN_CLIENT_SECRET`, `IntegrationsCache` (cache manager name), `MicrosoftGraphEmail` (cache name), `requestTimestamp` pattern, `timezone`, `locale` |

## Executive Summary

The `getAuthenticationToken` service is a token acquisition service that retrieves an OAuth 2.0 client credentials token from Microsoft Graph and stores it in an in-memory cache. It is triggered via a REST endpoint from a webMethods Integration Flow. The service handles the full lifecycle of the authentication request: obtaining the current date/time, generating a correlation ID, fetching static configuration (base URL, tenant ID, client ID), performing a token-endpoint POST request to Microsoft Graph, validating the response, caching the token, and returning the access token to the caller. It includes comprehensive error handling with a fallback error sequence and asynchronous logging.

## Validation Rules

| ID        | Validation Rule                               | Type                   | Condition / Validation                                                     | Expected Action / Outcome                               |
| --------- | --------------------------------------------- | ---------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| **V-001** | **Mandatory Field Validation**                | Mandatory              | `application` must not be null or empty                                    | Reject request if missing or empty                      |
| **V-002** | **Mandatory Field Validation**                | Mandatory              | `keys` must not be null or empty                                           | Reject request if missing or empty                      |
| **V-003** | **Mandatory Field Validation**                | Mandatory              | Each key in the `keys` array must be non-empty                             | Reject request if any key is empty                      |
| **V-004** | **Correlation ID Validation**                 | Null Check             | `correlationID` is null                                                    | Generate a new GUID; no validation error                |
| **V-005** | **Response Code Validation**                  | Null Check             | `responseCode` is null                                                     | Treat `responseCode` as **500 (Internal Server Error)** |
| **V-006** | **Access Token Validation**                   | Empty / Null Check     | `access_token` returned in the response is null or empty                   | Return error: **"Token is missing or empty"**           |
| **V-007** | **Response Body Validation**                  | Empty Check            | `responseBody` is empty                                                    | Return error: **"Empty response body received"**        |
| **V-008** | **Request Timestamp Validation**              | Format Validation      | `requestTimestamp`, if present, must match `yyyy-MM-dd HH:mm:ss.SSS`       | Reject/flag invalid timestamp format                    |
| **V-009** | **Response Code Validation**                  | Format Validation      | `responseCode`, if present, must be a numeric string, e.g. `200`           | Reject/flag invalid response code format                |
| **V-010** | **Regex Validation**                          | Regex                  | No specific regex validation is required for input fields                  | Values are validated through service logic              |
| **V-011** | **Microsoft Graph Token Base URL Validation** | Lookup / Configuration | `MICROSOFT_GRAPH_TOKEN_BASE_URL` must be present and start with `https://` | Reject/flag invalid configuration                       |
| **V-012** | **Microsoft Graph Client ID Validation**      | Lookup / Configuration | `MICROSOFT_GRAPH_TOKEN_CLIENT_ID` must not be empty                        | Reject/flag invalid configuration                       |
| **V-013** | **Microsoft Graph Tenant ID Validation**      | Lookup / Configuration | `MICROSOFT_GRAPH_TOKEN_TENANT_ID` must not be empty                        | Reject/flag invalid configuration                       |
| **V-014** | **Duplicate Token / Cache Handling**          | Duplicate Check        | Token already exists in cache with the same key                            | Overwrite with new token                                 |

## Processing Flow

```
1. Receive HTTP Request (correlationId, headers)
       |
2. Validate Request (correlationId format, required fields)
       |
3. Retrieve Configuration (baseURL, tenantID, clientID, clientSecret)
       |
4. Generate or Receive Correlation ID
       |
5. Prepare Request to Microsoft Graph (POST with client_credentials)
       |
6. Execute HTTP POST to Microsoft Graph Token Endpoint
       |
7. Parse JSON Response → Convert to Document
       |
8. Check responseCode == 200?
       |
   ├── YES → Extract access_token from AuthResponse
       |
   ├── Validate access_token is not null/empty
       |       |
       |       ├── YES → Cache token, generate response, return success
       |       |
       |       └── NO → Return error (invalid token)
       |
   └── NO → Throw business error (invalid response)
       |
9. Store Token in Cache
       |
10. Generate Response Timestamp
       |
11. Return Response to Caller
```

## External Integrations

### External System 1: Microsoft Graph Token Endpoint

#### Purpose

Obtain an OAuth 2.0 access token from Microsoft Graph using the client credentials grant flow. This is the only external service the service communicates with.

#### Headers

| Header | Value | Notes |
|--------|-------|-------|
| `Content-Type` | `application/x-www-form-urlencoded` | Required |
| `Accept` | `application/json` | Optional |

#### Request Body

| Parameter | Type | Value | Notes |
|-----------|------|-------|-------|
| `grant_type` | String | `client_credentials` | Required |
| `scope` | String | `https://graph.microsoft.com/.default` | Required |
| `client_id` | String | From `MICROSOFT_GRAPH_TOKEN_CLIENT_ID` config | Required |
| `client_secret` | String | From `MICROSOFT_GRAPH_TOKEN_CLIENT_SECRET` config | Required |

#### Timeout Recommendation

- **Connect Timeout:** 10 seconds
- **Read Timeout:** 10 seconds
- **Total Timeout:** 15 seconds (with retry logic)

#### Retry Recommendation

- **Retry Count:** 2
- **Retry Backoff:** 5 seconds
- **Retry Strategy:** Exponential backoff (if first attempt fails)

#### Error Handling

- **HTTP 401:** Return error with message "Unauthorized: Invalid client credentials. Please verify MICROSOFT_GRAPH_TOKEN_CLIENT_ID and MICROSOFT_GRAPH_TOKEN_CLIENT_SECRET."
- **HTTP 400:** Return error with message "Bad Request: Invalid token request parameters."
- **HTTP 500:** Return error with message "Internal Server Error: Microsoft Graph service is unavailable."
- **Timeout:** Return error with message "Request timed out: Microsoft Graph token acquisition failed."

#### Configuration Properties

| Property | Value   |
|----------|---------|
| `MICROSOFT_GRAPH_TOKEN_BASE_URL` | `https://login.microsoftonline.com` |
| `MICROSOFT_GRAPH_TOKEN_CLIENT_ID` | |
| `MICROSOFT_GRAPH_TOKEN_TENANT_ID` | |
| `MICROSOFT_GRAPH_TOKEN_CLIENT_SECRET` | |

#### External Sample Request

```http
POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&client_id=CLIENT_ID&client_secret=CLIENT_SECRET
```

#### External Sample Response

```json
{
  "token_type": "Bearer",
  "access_token": "...",
  "expires_in": 3599,
  "ext_expires_in": 3599
}
```

### External System 2: In-Memory Cache (IntegrationsCache)

#### Purpose

Store the obtained access token to prevent duplicate token acquisitions and enable short-term token reuse.

#### Configuration

| Property | Value |
|----------|-------|
| `cacheManagerName` | `IntegrationsCache` |
| `cacheName` | `MicrosoftGraphEmail` |
| `cacheKey` | `accessToken` |
| `cacheValue` | `accessToken` (the token string) |

#### Cache Behavior

- If the token already exists in the cache, it will be overwritten with the new token.
- The cache provider is typically Caffeine or Redis (Spring-managed).

### External System 3: Error Handling Service (`commonUtility.services:checkAndThrowError`)

#### Purpose

Validate error conditions and throw appropriate exceptions or return standardized error responses.

#### Error Handling Flow

- **Input:** Error message (formatted as `%AuthResponse/error% - %AuthResponse/error_description%`)
- **Output:** Error response with HTTP status code matching the error type

### External System 4: Current Date/Time Service (`pub.date:getCurrentDateString`)

#### Purpose

Provide the current date/time in string format for request and response timestamps.

#### Configuration

| Property | Value |
|----------|-------|
| `pattern` | `yyyy-MM-dd HH:mm:ss.SSS` |
| `timezone` | `GMT+4` |
| `locale` | (optional) |

## Error Handling

| Error Code | HTTP Status | Message | Cause | Returned To Client |
|------------|-------------|---------|-------|---------------------|
| `ERROR_401` | 401 Unauthorized | `Unauthorized: Invalid client credentials. Please verify MICROSOFT_GRAPH_TOKEN_CLIENT_ID and MICROSOFT_GRAPH_TOKEN_CLIENT_SECRET.` | The client ID or client secret in configuration is invalid or expired | Caller |
| `ERROR_400` | 400 Bad Request | `Bad Request: Invalid token request parameters.` | Missing or malformed request parameters | Caller |
| `ERROR_403` | 403 Forbidden | `Forbidden: The client is not authorized to make this request.` | The client ID lacks permissions | Caller |
| `ERROR_500` | 500 Internal Server Error | `Internal Server Error: Microsoft Graph service is unavailable or returned an unexpected response.` | Network error, timeout, or unexpected server response | Caller |
| `ERROR_503` | 503 Service Unavailable | `Service Unavailable: Microsoft Graph token acquisition timed out.` | Timeout occurred during the token request | Caller |
| `ERROR_NULL_TOKEN` | 500 Internal Server Error | `Token is missing or empty after successful token acquisition from Microsoft Graph.` | The response token was null or empty | Caller |
| `ERROR_TIMEOUT` | 500 Internal Server Error | `Request timed out: Microsoft Graph token acquisition failed.` | HTTP request exceeded timeout | Caller |
| `ERROR_CACHE_ERROR` | 500 Internal Server Error | `Cache error: Unable to store token in IntegrationsCache.` | Failed to write to cache | Caller |
| `ERROR_GENERATE_GUID` | 500 Internal Server Error | `GUID generation failed: Failed to generate unique identifier.` | Failed to generate a GUID | Caller |
| `ERROR_PARSE_RESPONSE` | 500 Internal Server Error | `Response parsing error: Failed to parse Microsoft Graph response.` | Failed to parse JSON response | Caller |
| `ERROR_HTTP_CLIENT` | 500 Internal Server Error | `HTTP client error: Failed to connect to Microsoft Graph token endpoint.` | Network connectivity issue | Caller |

## REST API Design for Spring Boot

A dedicated **Spring Component** will be responsible for obtaining and managing the Microsoft Graph access token.

The component will first check the **in-memory cache** for an existing valid access token. The token will be cached with a **24-hour TTL**.

- If a valid token is available in the cache, the component will reuse the cached token.
- If the token is not available or has expired, the component will use the **Microsoft Graph SDK** to generate a new access token.
- The newly generated token will then be stored in the in-memory cache with a **24-hour TTL**.
- The token will subsequently be used to process the request and send the response back to the caller.

This approach avoids generating a new Microsoft Graph access token for every request and reduces unnecessary calls to Microsoft Graph.
