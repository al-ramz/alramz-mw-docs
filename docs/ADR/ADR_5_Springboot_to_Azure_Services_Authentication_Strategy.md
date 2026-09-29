# ADR-5: Spring Boot to Azure Services Authentication Strategy

## Why

The Spring Boot microservices need to authenticate with multiple Azure services including Azure PostgreSQL Flexible Server, Managed Redis, Azure Key Vault, Azure Storage Accounts, Microsoft Graph, Service Bus, Azure Kubernetes Service, and Azure Container Registry. A consistent authentication strategy is required to ensure security, maintainability, and operational simplicity across all service integrations.

The current Software AG platform uses proprietary security mechanisms that are not applicable to the new Azure-native architecture. The new platform must adopt Azure-standard authentication patterns that align with cloud-native security best practices.

Choosing the wrong authentication approach would create operational overhead, introduce security vulnerabilities, and complicate the migration by requiring different authentication patterns for each service integration.

## What

Four authentication strategy options were evaluated for Spring Boot services authenticating to Azure services:

- **Managed Identity** — Use Azure Managed Identity (system-assigned or user-assigned) for all service-to-service authentication, eliminating the need to manage credentials in code or configuration.
- **Service Principal with client credentials** — Register each service as an Azure AD application and use client ID/client secret or certificate authentication.
- **Connection strings and secrets in Key Vault** — Store service connection strings and credentials in Azure Key Vault and retrieve them at runtime.
- **Hybrid approach** — Use Managed Identity where available, falling back to Key Vault-stored secrets for services that do not support Managed Identity.

Each option was evaluated against the migration requirements for security, operational simplicity, Spring Boot integration, and alignment with the target Azure architecture.

## Comparison Summary

| Category | **Managed Identity** | **Service Principal** | **Key Vault Secrets** | **Hybrid** |
|----------|---------------------|----------------------|----------------------|------------|
| **Credential management** | 🟢 Automatic | 🟡 Manual | 🟡 Manual | 🟡 Mixed |
| **Secret rotation** | 🟢 Automatic | 🟡 Manual | 🔴 Manual | 🟡 Mixed |
| **Spring Boot integration** | 🟢 Excellent | 🟢 Good | 🟢 Good | 🟢 Good |
| **Operational overhead** | ⭐⭐⭐⭐⭐ Lowest | ⭐⭐⭐ Medium | ⭐⭐ Low | ⭐⭐⭐ Medium |
| **Security posture** | 🟢 Best | 🟢 Good | 🟡 Good | 🟢 Good |
| **Infrastructure dependency** | 🟢 None | 🟡 App registration | 🟡 Key Vault | 🟡 Both |
| **Auditability** | 🟢 Built-in | 🟢 Built-in | 🟡 Manual | 🟡 Mixed |
| **Network integration** | 🟢 Private link compatible | 🟢 Yes | 🟢 Yes | 🟢 Yes |
| **AKS compatibility** | 🟢 Excellent | 🟢 Excellent | 🟢 Yes | 🟢 Yes |
| **PostgreSQL Flexible Server support** | 🟢 Yes | 🟢 Yes | 🟢 Yes | 🟢 Yes |
| **Managed Redis support** | 🟢 Yes | 🟡 Limited | 🟢 Yes | 🟢 Yes |
| **Key Vault support** | 🟢 Native | 🟢 Yes | 🟢 Yes | 🟢 Yes |
| **Storage Accounts support** | 🟢 Yes | 🟢 Yes | 🟢 Yes | 🟢 Yes |
| **Service Bus support** | 🟢 Yes | 🟢 Yes | 🟢 Yes | 🟢 Yes |
| **Microsoft Graph support** | 🟢 Yes | 🟢 Yes | 🟢 Yes | 🟢 Yes |
| **Azure Container Registry support** | 🟢 Yes | 🟢 Yes | 🟢 Yes | 🟢 Yes |
| **Credential exposure risk** | 🟢 None | 🟡 Low | 🟡 Low | 🟡 Low |
| **Configuration complexity** | Low | Medium | Medium | High |
| **Learning curve** | Low | Medium | Low | Medium |
| **Why choose Managed Identity** | 🟢 No secrets, auto-rotation, least privilege, AD-backed audit | 🟡 Explicit control but manual ops | 🟡 Works everywhere but manual ops | 🟡 Flexible but inconsistent |
| **Best for microservices** | 🟢 **Best** | 🟢 Good | 🟡 | 🟢 Good |
| **Best for operational simplicity** | 🟢 **Best** | 🟡 | 🟡 | 🟡 |
| **Best for security** | 🟢 **Best** | 🟢 Good | 🟡 Good | 🟢 Good |
| **Recommended for your architecture** | 🏆 **#1** | #3 | #4 | #2 |

## Advantages

### Managed Identity

- **No credential management**: Eliminates the need to store, rotate, or protect credentials in code, configuration files, or Key Vault for service-to-service authentication.
- **Automatic rotation**: Azure automatically handles credential rotation without service interruption or manual intervention.
- **Azure AD integration**: Built on Azure Active Directory, providing enterprise-grade identity management, audit logging, and access control.
- **Granular RBAC**: Supports fine-grained Azure RBAC assignments, allowing least-privilege access per service and per Azure resource.
- **Private endpoint compatible**: Works seamlessly with Azure Private Link and VNet integration, maintaining network isolation.
- **Spring Boot native support**: Azure SDKs and Spring Cloud Azure provide first-class Managed Identity integration with minimal configuration.
- **Audit trail**: All authentication events are logged in Azure AD sign-in logs, providing comprehensive security auditing.
- **No secret sprawl**: Reduces the attack surface by eliminating secrets from application code and configuration.
- **Platform-managed**: Azure handles the underlying identity infrastructure, reducing operational burden.
- **Consistent pattern**: Same authentication approach across all Azure services that support Managed Identity, simplifying development and operations.
- **AKS compatible**: Works on Azure Kubernetes Service through pod-managed identities and Azure AD workload identity.
- **ACR pull without secrets**: AKS can pull images from Azure Container Registry using cluster or node pool managed identity with `AcrPull` role, removing the need for image pull secrets.

### Service Principal

- **Explicit control**: Provides explicit control over service identity and permissions through Azure AD app registrations.
- **Multi-tenant support**: Can be configured for cross-tenant scenarios if needed.
- **Certificate support**: Supports certificate-based authentication for enhanced security.

### Key Vault Secrets

- **Centralized secrets**: All credentials stored in a single, managed service with access policies and audit logging.
- **Flexible**: Works with all Azure services regardless of Managed Identity support.
- **Familiar pattern**: Team may already have experience with this approach.

### Hybrid

- **Maximum compatibility**: Covers all services regardless of authentication support.
- **Gradual migration**: Allows incremental adoption of Managed Identity for services that support it.

## Disadvantages

### Managed Identity

- **Not all services support it equally**: Some services have limited Managed Identity support or require specific configuration (e.g., Redis access keys may still be needed).
- **Azure AD dependency**: Requires Azure AD to be available and properly configured.
- **Initial setup complexity**: Requires proper RBAC configuration and understanding of identity boundaries.
- **Debugging complexity**: Can be more difficult to debug authentication issues compared to explicit credentials.
- **AKS-specific configuration**: Requires Azure AD workload identity or pod-managed identity setup in AKS.

### Service Principal

- **Credential management overhead**: Requires manual credential rotation and secure storage of client secrets or certificates.
- **Secret sprawl risk**: Client secrets can be accidentally committed to source control or exposed in logs.
- **Additional Azure AD objects**: Requires managing app registrations, service principals, and their lifecycle.

### Key Vault Secrets

- **Manual rotation**: Requires implementing rotation policies and ensuring services reload secrets without restart.
- **Secret exposure**: Secrets must be retrieved and held in memory, creating a temporary exposure window.
- **Additional service dependency**: Introduces dependency on Key Vault availability at runtime.
- **Configuration complexity**: Requires explicit secret retrieval logic in application code.

### Hybrid

- **Inconsistent patterns**: Different authentication mechanisms for different services create operational complexity.
- **Higher maintenance**: Requires maintaining multiple authentication approaches and understanding when to use each.
- **Documentation burden**: Must clearly document which services use which authentication method.

## Decision

The organization will adopt **Managed Identity** as the primary authentication mechanism for all Azure service integrations in the Spring Boot migration.

Where Managed Identity is not supported or not feasible, the fallback approach will be to store credentials in **Azure Key Vault** and retrieve them at service startup, consistent with ADR-1. This hybrid fallback ensures all services can authenticate while prioritizing Managed Identity where possible.

## Minimum Required Permissions

The following table summarizes the minimum Azure RBAC roles or permissions typically required for Managed Identity to authenticate to each Azure service. These should be treated as starting points and refined based on actual service usage patterns.

| Azure Service | Minimum Azure RBAC Role / Permission | Notes |
|---------------|-------------------------------------|-------|
| **Azure PostgreSQL Flexible Server** | Contributor on the PostgreSQL server + database-level user mapping | Azure AD authentication must be enabled on the server; Managed Identity must be created as a database user. |
| **Azure Managed Redis** | Redis Data Contributor / Redis Data Reader | Use Azure AD authentication for Redis when available; otherwise fallback to Key Vault-stored access keys. |
| **Azure Key Vault** | Key Vault Secrets User | Allows read access to secrets; adjust to Key Vault Reader if certificate or key access is also needed. |
| **Azure Storage Accounts** | Storage Blob Data Contributor | Use Azure AD storage auth; choose more specific data roles if services only need read or queue/table access. |
| **Microsoft Graph** | Graph API application permissions | Assign the minimum application permissions required by the service, e.g., `User.Read.All`, `Group.Read.All`, `Mail.Read`. |
| **Azure Service Bus** | Azure Service Bus Data Sender / Data Receiver | Use Data Owner if a service both sends and receives; split sender/receiver roles for least privilege. |
| **Azure Kubernetes Service** | Managed Identity Operator on node pool or cluster | Required for pod-managed identity or Azure AD workload identity to function correctly. |
| **Azure Container Registry** | AcrPull | Assign to the AKS cluster or node pool managed identity for image pull without secrets. Use AcrPush only for CI/CD build identities. |

The authentication strategy will be implemented consistently across all Azure services used in the migration:
- **Azure PostgreSQL Flexible Server**: Use Managed Identity with Azure AD authentication for PostgreSQL
- **Azure Managed Redis**: Use Managed Identity where supported, or Key Vault-stored access keys as fallback
- **Azure Key Vault**: Use Managed Identity for Key Vault access from services
- **Azure Storage Accounts**: Use Managed Identity with Azure AD storage authentication
- **Microsoft Graph**: Use Managed Identity with appropriate Graph API permissions
- **Azure Service Bus**: Use Managed Identity for Service Bus authentication
- **Azure Kubernetes Service**: Use pod-managed identities or Azure AD workload identity for cluster access and service authentication
- **Azure Container Registry**: Use AKS managed identity with `AcrPull` role for image pulls without secrets

This decision aligns with the cloud-native architecture principles established in ADR-0 and the preference for Azure-native services and managed operations. Managed Identity eliminates credential management overhead, enhances security posture, and provides a consistent authentication pattern across the entire platform running on AKS.
