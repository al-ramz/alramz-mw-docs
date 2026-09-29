# ADR-6: Spring Boot Configuration Management with Profiles and Azure Key Vault

## Why

Spring Boot microservices deployed across multiple environments need a consistent, maintainable approach to manage environment-specific configuration without hardcoding values or duplicating configuration logic. As part of the Software AG to Spring Boot migration, each service will run in distinct environments — local, Dav, pre-prod, prod, and test — each requiring different database endpoints, connection strings, timeouts, feature flags, and other operational parameters.

A **secret** is defined as any sensitive piece of information that must not be stored in plaintext in source control, configuration files, or logs. This includes passwords, private keys, tokens, connection strings containing credentials, and any other value whose disclosure could compromise system security or data privacy.

Without a standardized configuration strategy, teams may resort to ad-hoc approaches such as environment variable sprawl, hardcoded values, or secrets embedded in application.yml files — all of which introduce security vulnerabilities, configuration drift between environments, and operational risk during deployments.

A profile-based configuration approach, backed by Azure Key Vault for secret injection at startup, provides environment isolation, keeps secrets out of source control, and aligns with Azure-native architecture principles established in this migration.

## What

The proposed solution is to use **Spring Boot profiles** as the primary mechanism for managing environment-specific configuration, combined with **Azure Key Vault** as the source of truth for all secrets.

Under this approach:

- Each environment (`local`, `dav`, `pre-prod`, `prod`, `test`) has a corresponding Spring profile.
- A base `application.yml` defines the active profile at runtime using the `spring.profiles.active` property, which is passed as an external parameter (e.g., environment variable, command-line argument, or deployment configuration) rather than being hardcoded in the file.
- Environment-specific override files (`application-{profile}.yml`) contain only the properties that differ from the base configuration for that environment.
- All sensitive values (secrets) are stored as **placeholders** in the YAML files (e.g., `${DB_PASSWORD}`), never as hardcoded values.
- At service startup, placeholders are resolved by injecting values from the runtime environment, which is populated from **Azure Key Vault**. This injection is performed automatically by Spring Boot's property resolution mechanism, which reads from environment variables, system properties, and — via the Key Vault integration — from Azure Key Vault secrets.

### Profiles Considered

| Profile    | Purpose |
|------------|---------|
| `local`    | Developer local machine; points to local or shared dev infrastructure. |
| `dav`      | Development Acceptance Validation environment; used for integration and QA testing. |
| `pre-prod` | Pre-production; mirrors production configuration for final validation before release. |
| `prod`     | Production; live customer-facing environment with production-grade infrastructure. |
| `test`     | Automated test execution; used by CI/CD pipelines and integration test suites. |

## Comparison Summary

Four alternative configuration management approaches were evaluated against the proposed Spring Boot Profiles + Azure Key Vault strategy:

- **Spring Boot Profiles + Azure Key Vault** (proposed) — Use Spring's native profile mechanism with per-environment YAML files; secrets resolved from Azure Key Vault via environment variables injected at startup.
- **Spring Cloud Config Server** — A centralized Git-backed configuration server that all services query at startup for their configuration.
- **Azure App Configuration** — Microsoft's fully managed configuration service that provides feature flags, key-value configuration, and Key Vault references natively.
- **Kubernetes-native ConfigMaps + Secrets** — Store configuration in Kubernetes ConfigMaps and secrets in K8s Secrets, mounted as environment variables or volumes at runtime.
- **Pure environment variables** — Eliminate YAML configuration entirely; all configuration values supplied as environment variables at runtime (12-factor style).

Each option was evaluated against the migration requirements for security, operational simplicity, Spring Boot integration, Azure-native alignment, and support for the five target environments.

| Category | **Profiles + Key Vault** | **Spring Cloud Config** | **Azure App Configuration** | **K8s ConfigMaps + Secrets** | **Pure Env Vars** |
|----------|:------------------------:|:----------------------:|:--------------------------:|:----------------------------:|:-----------------:|
| **Configuration management** | 🟢 YAML profiles, Git in source control | 🟢 Central Git repo, runtime pulled | 🟢 Central key-value store, runtime pulled | 🟡 K8s ConfigMaps per namespace | 🔴 No structured config files |
| **Secret storage** | 🟢 Azure Key Vault (ADR-1) | 🟢 Key Vault or encrypted properties | 🟢 Key Vault references built-in | 🟡 K8s Secrets (etcd, base64) | 🔴 Env vars are not a secret store |
| **Environment isolation** | 🟢 Profiles enforce per-env YAML | 🟢 Label-based environment branches | 🟢 Label-based key-value filtering | 🟢 Per-namespace ConfigMaps/Secrets | 🔴 Manual enforcement required |
| **Spring Boot integration** | 🟢 Native `application-{profile}.yml` | 🟢 Requires Spring Cloud Config client | 🟢 Requires Spring Cloud Azure client | 🟢 Standard Spring Boot works | 🟢 Standard Spring Boot works |
| **Azure-native fit** | 🟢 Key Vault + Managed Identity (ADR-5) | 🟡 Azure-hosted Git possible but not native | 🟢 Purpose-built Azure service | 🟡 K8s-centric, not Azure-specific | 🟡 Neutral |
| **Operational overhead** | ⭐⭐⭐⭐ Low | ⭐⭐ Medium | ⭐⭐⭐ Medium | ⭐⭐⭐ Medium | ⭐⭐⭐⭐⭐ Lowest |
| **Secret rotation** | 🟢 Restart picks up new Key Vault value | 🟡 Config Server refresh trigger needed | 🟢 Push-based refresh or restart | 🟡 K8s rolling restart or reloader needed | 🔴 Not addressed |
| **Auditability** | 🟢 Key Vault access logs + Git history | 🟢 Git history + Config Server logs | 🟢 App Configuration logs + Key Vault logs | 🟡 K8s audit logs (limited for Secrets) | 🔴 No audit trail |
| **Single artifact deployment** | 🟢 Same image, runtime profile switch | 🟢 Same image, runtime label switch | 🟢 Same image, runtime key-value filter | 🟢 Same image, runtime K8s injection | 🟢 Same image, runtime env injection |
| **Local development** | 🟢 `local` profile works offline | 🟡 Requires running Config Server locally | 🟡 Requires local App Configuration or mocking | 🟡 Requires local K8s or Minikube | 🟢 Works immediately |
| **Network dependency at startup** | 🟡 Key Vault must be reachable | 🔴 Config Server must be reachable | 🔴 App Configuration must be reachable | 🟡 K8s API must be reachable | 🟢 None if pre-injected |
| **Secret exposure risk** | 🟢 Env vars, never in files | 🟢 Encrypted in transit, env vars at runtime | 🟢 Key Vault references, env vars at runtime | 🟡 K8s Secrets base64, etcd exposure | 🟡 Env vars visible in process list |
| **RBAC / access control** | 🟢 Key Vault RBAC + Managed Identity | 🟢 Key Vault RBAC | 🟢 App Configuration + Key Vault RBAC | 🟡 K8s RBAC for Secrets | 🔴 No built-in access control |
| **Configuration drift risk** | 🟢 Profiles in Git, reviewed in PRs | 🟢 Central Git, reviewed in PRs | 🟢 Central store, reviewed via Azure | 🟡 ConfigMaps may drift across namespaces | 🔴 High risk, no versioned source |
| **Learning curve** | Low | Medium | Medium | Medium-High | Low |
| **Best for microservices** | 🟢 **Best** | 🟢 Good | 🟢 Good | 🟡 Acceptable | 🟡 Acceptable for simple services |
| **Best for Azure-native** | 🟢 **Best** | 🟡 | 🟢 **Best** | 🟡 | 🟡 |
| **Recommended for migration** | 🏆 **#1** | #3 | #2 | #4 | #5 |

## How

### Configuration File Structure

Each Spring Boot service will maintain the following configuration structure:

```
src/main/resources/
├── application.yml          # Base configuration shared across all profiles
├── application-local.yml    # Local environment overrides
├── application-dav.yml      # DAV environment overrides
├── application-pre-prod.yml # Pre-prod environment overrides
├── application-prod.yml     # Production environment overrides
└── application-test.yml     # Test environment overrides
```

### Profile Activation

The active profile is selected at runtime using an external parameter supplied at service startup. This parameter is **never** hardcoded in `application.yml`. It is provided through one of the following mechanisms, depending on the deployment environment:

- **Environment variable**: `SPRING_PROFILES_ACTIVE=prod`
- **Command-line argument**: `--spring.profiles.active=prod`
- **Deployment configuration**: Set via Kubernetes ConfigMap, Helm values, or Azure App Configuration at deployment time.

### Placeholder and Secret Injection

All sensitive configuration values are referenced as placeholders in the YAML files:

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

azure:
  keyvault:
    uri: ${KEYVAULT_URI}
```

The placeholder resolution chain is:

1. **Azure Key Vault** — Secrets are stored in Azure Key Vault, scoped per environment and per service.
2. **Environment variables** — At container or host startup, the deployment pipeline or orchestration layer (Azure Kubernetes Service) fetches the required secrets from Key Vault and injects them as environment variables in the service's runtime environment.
3. **Spring Boot property resolution** — Spring Boot resolves `${...}` placeholders from environment variables, system properties, and external configuration sources in priority order.

This ensures that:
- No secrets ever appear in source control.
- Each environment has its own isolated set of secrets in Key Vault.
- The same artifact (container image) can be deployed to any environment without modification; only the runtime environment parameters change.
- Secret rotation in Key Vault does not require application redeployment — only a service restart to pick up new values.

### Azure Key Vault Integration

Azure Key Vault is configured per environment, with separate vault instances or separate secret scopes for `local`, `dav`, `pre-prod`, `prod`, and `test`. Access to each vault is restricted using Azure RBAC and Managed Identity (as defined in ADR-5), ensuring that a service running in `prod` can only access secrets from the `prod` vault scope.

The service authenticates to Key Vault using its Managed Identity, retrieves the required secrets at startup, and injects them as environment variables. No client credentials, connection strings, or service principal secrets are stored in configuration files.

## Advantages

- **Environment isolation**: Each profile cleanly separates environment-specific configuration, preventing accidental cross-environment configuration leakage.
- **Secrets never in source control**: All sensitive values are stored in Azure Key Vault and injected at runtime.
- **Single artifact, multiple environments**: The same container image is deployed to all environments; only runtime parameters differ, eliminating build-time environment branching.
- **Consistent with Azure-native architecture**: Leverages Azure Key Vault and Managed Identity, aligning with ADR-1 and ADR-5 decisions.
- **Simplified debugging**: Developers can run with the `local` profile against local or shared dev infrastructure without modifying application code.
- **Profile-specific overrides**: Only properties that differ between environments are defined in profile-specific files, reducing duplication and configuration drift.
- **Spring Boot native**: Uses Spring Boot's built-in profile and property resolution mechanisms, requiring no custom framework code.
- **Secret rotation without redeployment**: Secrets can be rotated in Key Vault; a service restart picks up the new values without rebuilding or repushing the container image.

## Disadvantages

- **Profile proliferation risk**: Over time, the number of environment-specific properties can grow, making profile files harder to maintain if not governed carefully.
- **Startup dependency on Key Vault**: The service cannot start successfully if Azure Key Vault is unreachable or required secrets are missing.
- **Placeholder complexity**: Overuse of placeholders can make configuration harder to read and debug, especially when the resolution chain spans multiple sources.
- **Local development overhead**: Developers need access to the appropriate Key Vault (or a local equivalent) to run the service with the `local` profile.
- **No runtime secret refresh**: Secrets loaded at startup remain static for the service lifetime; changes in Key Vault require a service restart to take effect.

## Decision

The organization will adopt **Spring Boot profiles** as the standard mechanism for managing environment-specific configuration, supported by **Azure Key Vault** as the source of truth for all secrets.

The five profiles in use are: `local`, `dav`, `pre-prod`, `prod`, and `test`. All sensitive values will be stored as placeholders in `application-{profile}.yml` files and resolved at service startup through environment variables injected from Azure Key Vault. This approach ensures configuration portability across environments, keeps secrets out of source control, and is fully consistent with the Azure-native architecture and Managed Identity authentication strategy established in ADR-5.
