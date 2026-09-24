# ADR-3: Distributed Caching Strategy

## Why

The migration requires a distributed caching layer to support the new Spring Boot microservices architecture on Azure. The current Software AG platform relies on a centralized caching server for session state, API response caching, and temporary data storage. The new platform must choose a caching strategy that aligns with the Azure Container Apps deployment model, supports horizontal scaling, integrates with Azure managed services, and maintains the performance targets defined in ADR-0 (200 orders/second peak, 99.99% availability).

Choosing the wrong caching approach would create operational bottlenecks, limit scalability, or introduce unnecessary complexity that conflicts with the cloud-native architecture principles established in the migration.

## What

Three caching strategy options were evaluated:

- **In-memory caching within Spring Boot services** — Each service instance maintains its own cache using Spring's caching abstraction with local in-memory providers like Caffeine or ConcurrentHashMap.
- **Azure Managed Redis** — A fully managed Redis service on Azure that provides a centralized, distributed cache accessible by all services through network connectivity.
- **Hazelcast** — An open-source in-memory data grid that can be deployed as a distributed cache cluster, either self-managed or via Azure Marketplace.

Each option was evaluated against the migration requirements for scalability, operational simplicity, Azure integration, session management, and cost.

## Comparison Summary

| Category | **In-Memory (Spring Boot)** | **Azure Managed Redis** | **Hazelcast** |
|----------|----------------------------|------------------------|---------------|
| **Primary purpose** | Local service-level caching | Managed distributed cache | Distributed in-memory data grid |
| **Distributed cache** | ❌ No | 🟢 Yes | 🟢 Yes |
| **Multi-instance consistency** | ❌ No | 🟢 Yes | 🟢 Yes |
| **Spring Boot integration** | 🟢 Native | 🟢 Excellent | 🟢 Good |
| **Azure managed service** | ❌ | 🟢 Yes | ❌ |
| **Operational overhead** | ⭐⭐⭐⭐⭐ Lowest | ⭐⭐⭐⭐⭐ Lowest | ⭐⭐ High |
| **Cluster management** | ❌ | ❌ | 🟢 Required |
| **Auto-scaling support** | ❌ Per-instance only | 🟢 Yes | 🟡 Limited |
| **Persistence** | ❌ | 🟢 Optional RDB/AOF | 🟢 Optional |
| **High availability** | ❌ | 🟢 Built-in | 🟢 Built-in |
| **Data eviction policies** | 🟢 Basic | 🟢 Advanced (LRU, LFU) | 🟢 Advanced |
| **Pub/Sub capabilities** | ❌ | 🟢 Yes | 🟢 Yes |
| **Session store** | ❌ Per-instance only | 🟢 Excellent | 🟢 Excellent |
| **API response caching** | 🟢 Per-instance | 🟢 Distributed | 🟢 Distributed |
| **Rate limiting support** | ❌ | 🟢 Redis-based | 🟢 Hazelcast-based |
| **Integration with APIM** | ❌ | 🟢 Via policies | 🟡 Limited |
| **Security / encryption** | ❌ | 🟢 Managed keys, TLS | 🟡 Self-managed |
| **Backup / restore** | ❌ | 🟢 Managed backups | 🟡 Self-managed |
| **Monitoring** | ❌ | 🟢 Azure Monitor | 🟡 Requires setup |
| **Cost model** | Free (compute included) | Pay-per-use | License + infrastructure |
| **Cost predictability** | 🟢 Excellent | 🟡 Variable with usage | 🟡 Complex |
| **Idle cost** | 🟢 None | 🟢 Can scale to zero | 🔴 Cluster always running |
| **Multi-service sharing** | ❌ | 🟢 Yes | 🟢 Yes |
| **Cache warming** | ❌ | 🟢 Centralized | 🟢 Distributed |
| **Spring Cache abstraction** | 🟢 Native | 🟢 Via Redis starter | 🟢 Via Hazelcast starter |
| **Learning curve** | Low | Low/Medium | Medium/High |
| **Troubleshooting** | Simple | Simple | Complex |
| **Vendor lock-in** | 🟢 None | 🟡 Azure-specific | 🟡 Hazelcast-specific |
| **Best for simple APIs** | 🟢 **Best** | 🟢 Good | 🔴 Overkill |
| **Best for microservices** | ❌ | 🟢 **Best** | 🟢 Good |
| **Best for session sharing** | ❌ | 🟢 **Best** | 🟢 Good |
| **Best for operational simplicity** | 🟢 **Best** | 🟢 **Best** | ❌ |
| **Recommended for your architecture** | ❌ | 🏆 **#1** | #2 |

## Advantages

### Azure Managed Redis

- **Centralized cache**: All services share a single cache instance, ensuring consistency across microservices.
- **Azure-native integration**: Seamless integration with Azure Key Vault for secrets, Azure Monitor for metrics, and Azure Private Link for network isolation.
- **Managed operations**: Azure handles patching, backup, high availability, and infrastructure maintenance.
- **Session state sharing**: Ideal for distributed session management across Container Apps instances.
- **Pub/Sub support**: Enables event-driven patterns and real-time notifications between services.
- **Rate limiting**: Can be used for distributed rate limiting at the API gateway or service level.
- **Spring Boot ready**: First-class support through `spring-boot-starter-data-redis`.
- **Cost efficiency**: Pay-per-use model with ability to scale based on actual demand.
- **Security**: Managed encryption at rest and in transit, Azure RBAC integration, and private endpoint support.
- **Observability**: Built-in metrics and diagnostics integrated with Application Insights and Log Analytics.

### In-Memory Caching

- **Zero operational overhead**: No external service to manage or secure.
- **Lowest latency**: Direct memory access with no network round-trip.
- **Simple configuration**: Works out of the box with Spring Boot's caching abstraction.
- **No additional cost**: Uses existing compute resources.

### Hazelcast

- **Distributed data grid**: Rich feature set beyond caching (compute, streaming, queries).
- **Flexible deployment**: Can be self-managed or deployed on Azure Kubernetes Service.
- **Strong consistency**: Supports various consistency models for complex data access patterns.

## Disadvantages

### In-Memory Caching

- **No cross-instance sharing**: Each service instance maintains its own isolated cache, leading to data inconsistency in a scaled-out environment.
- **No session persistence**: Session data is lost when an instance restarts or scales down.
- **Warm-up penalty**: New instances start with empty caches, causing cache misses until warmed up.
- **Memory pressure**: Competes with application heap, potentially impacting JVM performance.
- **No centralized monitoring**: Difficult to observe cache hit ratios or eviction patterns across instances.
- **Limited eviction control**: Basic strategies only; no fine-grained control over cache lifecycle.

### Azure Managed Redis

- **Azure dependency**: Introduces dependency on a specific cloud provider service.
- **Network latency**: Slight overhead compared to pure in-memory access, though typically minimal on Azure.
- **Cold start**: Cache may require warm-up after scaling or failover events.
- **Cost at scale**: Can become expensive at very high throughput or large dataset sizes.

### Hazelcast

- **High operational complexity**: Requires cluster management, node provisioning, and ongoing maintenance.
- **Overkill for caching**: Rich feature set adds complexity when only distributed caching is needed.
- **Resource intensive**: Requires dedicated nodes or AKS cluster, increasing infrastructure cost and management burden.
- **Slower time-to-market**: Longer setup and configuration compared to managed Redis.
- **Limited Azure integration**: Requires additional tooling for monitoring, security, and CI/CD compared to native Azure services.

## Decision

The organization will adopt **Azure Managed Redis** as the standard distributed caching platform for the migration.

This decision provides centralized caching that works across all microservices instances, supports session state sharing, integrates natively with Azure Container Apps and Azure API Management, and requires minimal operational overhead. While in-memory caching is suitable for simple, single-instance scenarios, it cannot meet the requirements for distributed session management and cross-service data consistency in a cloud-native microservices architecture. Hazelcast offers powerful distributed data grid capabilities but introduces unnecessary operational complexity and resource overhead for the caching requirements of this migration.

Azure Managed Redis aligns with the cloud-native principles established in ADR-0 and complements the Azure Container Apps compute platform selected in ADR-2. The managed service model ensures the team can focus on application development rather than cache infrastructure operations, while still delivering the performance, scalability, and reliability required for the trading platform.
