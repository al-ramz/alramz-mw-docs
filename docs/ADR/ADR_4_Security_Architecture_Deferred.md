# ADR-4: Deferred API Security Architecture and SecLog Consumer Field

## Why

The migration requires a clear security architecture for API endpoints, including authentication and authorization mechanisms. Currently, the organization does not have Azure API Management gateway available in the AlRamz development subscription, and the broader Azure infrastructure is not ready for first-hand implementation.

More importantly, there is a significant gap in understanding which endpoint requires what kind of authentication. The current approach is scattered, with no centralized mapping of security requirements per endpoint. Without this clarity, implementing a security layer would likely result in rework, inconsistent protection, and potential security gaps.

The SecLog (Security Logging) implementation relies on Spring Security Filters and interceptors. The `consumer` field in SecLog depends directly on the authentication mechanism implemented for each endpoint. Until the authentication strategy is finalized, the `consumer` field cannot be accurately populated and must remain on hold.

Implementing security prematurely would force the team to make assumptions about authentication patterns that may change once the endpoint inventory and requirements are fully understood.

## What

Two options were evaluated:

- **Implement security architecture now** — Define and implement API security, authentication mechanisms, and SecLog consumer field immediately, accepting that changes will likely be required once infrastructure and requirements are clarified.
- **Defer security architecture** — Focus on business logic implementation first, document all endpoints and their authentication requirements, then realign on the security architecture once the endpoint inventory is complete and Azure infrastructure is available.

## Comparison Summary

| Category | **Implement Security Now** | **Defer Security Architecture** |
|----------|---------------------------|--------------------------------|
| **Primary focus** | Security layer first | Business logic first |
| **Infrastructure dependency** | Requires Azure APIM ready | No immediate infrastructure dependency |
| **Authentication clarity** | Assumptions required | Clear mapping from endpoint inventory |
| **SecLog consumer field** | Implement with placeholder/guesswork | Hold until authentication mechanism is known |
| **Rework risk** | High | Low |
| **Consistency** | Likely inconsistent | Consistent with documented requirements |
| **Security gaps** | Possible gaps due to unclear requirements | Addressed holistically after inventory |
| **Team alignment** | Premature without endpoint inventory | Aligned with business and security teams |
| **Spring Security integration** | Early but potentially incorrect | Planned with correct filter/interceptor chain |
| **Time to market for business logic** | Slower | Faster |
| **Follow-up document required** | No | Yes, endpoint inventory by Alai and Asir |
| **Recommended for current state** | ❌ | 🏆 **#1** |

## Advantages

### Defer Security Architecture

- **Clear requirements**: Endpoint inventory in Excel provides definitive mapping of authentication needs before implementation.
- **No rework**: Security layer built once with full context, avoiding guesswork and subsequent refactoring.
- **Accurate SecLog**: Consumer field populated with correct authentication context rather than placeholders.
- **Infrastructure alignment**: Implementation can proceed in parallel with Azure subscription and APIM provisioning.
- **Faster business value**: Teams can deliver business logic without waiting for security decisions to mature.
- **Holistic design**: Security architecture designed as a complete system rather than piecemeal per endpoint.
- **Team coordination**: Alai and Asir can focus on documenting requirements while development teams build business logic.

### Implement Security Now

- **Early security posture**: Security controls in place from the start.
- **Pattern established**: Team gains experience with Spring Security Filters and interceptors early.
- **No later security debt**: Security not left as an afterthought.

## Disadvantages

### Defer Security Architecture

- **Security not in place**: APIs are exposed without authentication during development phase.
- **Later integration effort**: Security layer must be retrofitted once architecture is finalized.
- **SecLog gap**: Security logging incomplete until consumer field is resolved.
- **Coordination required**: Development and security teams must realign once endpoint inventory is complete.
- **Development environment risk**: Services running without security controls in shared environments.

### Implement Security Now

- **Assumption-driven**: Authentication patterns may be wrong, requiring rework.
- **Inconsistent protection**: Different endpoints may get different security treatments based on incomplete information.
- **SecLog inaccuracies**: Consumer field populated with incorrect or guessed values.
- **Infrastructure mismatch**: Implementation may not align with eventual Azure APIM capabilities.
- **Wasted effort**: Significant rework likely once endpoint inventory is complete.

## Decision

The organization will **defer the API security architecture and hold the SecLog consumer field** until the endpoint inventory is complete and Azure infrastructure is ready.

Development teams will focus on implementing business logic without premature security controls. Alai and Asir will document all API endpoints in a separate Excel file, mapping each endpoint to its required authentication mechanism. Once this inventory is complete and the Azure dev subscription has API Management gateway available, the team will realign on the security architecture.

The SecLog implementation using Spring Security Filters and interceptors will proceed without the `consumer` field. The `consumer` field will remain unpopulated until the authentication mechanism for each endpoint is finalized, ensuring accurate and meaningful security logging rather than placeholder values.

This decision prioritizes delivering business value with clear requirements over implementing security controls based on assumptions that will likely require rework. The deferred approach ensures that when security is implemented, it is done correctly, consistently, and with full context of the endpoint landscape.
