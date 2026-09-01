# ADR-0: Requirements and Migration Context

## 1. Business Use Case

The current trading platform relies heavily on the Software AG ecosystem, comprising:

- Designer
- Integration Server
- API Gateway

These components currently handle API development, integration, orchestration, routing, transformation, and communication across multiple trading applications.

While the platform has been stable, it has become a significant dependency introducing:

- High licensing and maintenance costs
- Vendor lock-in
- Limited technology flexibility
- Difficulty adopting cloud-native architecture
- Higher operational complexity
- Dependency on proprietary tooling and specialized skills

To support future business growth and technology modernization, the organization has decided to migrate to an open-source architecture built on Java, Spring Boot, and Azure cloud-native services.

## 2. Why

The migration is driven by the need to break free from the constraints of a proprietary middleware stack that has become a bottleneck for innovation and growth. The current Software AG ecosystem ties the organization to expensive licensing models, specialized skill sets, and a closed toolchain that limits the ability to adopt modern cloud-native practices. As business volume grows and the market demands faster delivery, the existing platform cannot scale efficiently or integrate seamlessly with newer Azure services. Moving to Spring Boot on Azure will reduce long-term costs, improve developer productivity, and position the platform for the next five years of business expansion.

## 3. Advantages

* **Cost Reduction** — Eliminates recurring licensing fees and reduces total cost of ownership by adopting open-source technologies.
* **Scalability** — Azure Container Apps and Azure Managed Redis enable horizontal scaling and auto-scaling to handle 5x business growth.
* **Cloud-Native Agility** — Azure-native services (API Management, Service Bus, Key Vault, etc.) provide built-in resilience, security, and observability.
* **Developer Productivity** — Spring Boot and Maven are widely adopted, reducing onboarding time and expanding the talent pool.
* **Automation** — GitHub Actions and Terraform enable full CI/CD and Infrastructure as Code, improving deployment reliability and frequency.
* **Resilience** — Target availability of 99.99% with distributed tracing via Application Insights and centralized logging via Log Analytics.
* **Future-Proofing** — Open-source foundation prevents vendor lock-in and allows smooth integration with future technologies.

## 4. Disadvantages

* **Migration Effort** — Replatforming existing integrations requires significant development, testing, and validation effort across all services.
* **Skill Gap** — Teams need to build expertise in Spring Boot, Azure services, Terraform, and cloud-native deployment patterns.
* **Operational Disruption** — Parallel run periods and cutover activities carry risk of downtime or data inconsistency.
* **Initial Cost Spike** — Short-term costs increase due to development effort, training, and potential dual-licensing during transition.
* **Performance Risk** — Unproven architecture at scale may require optimization cycles to meet the 200 orders/second peak target.
* **Dependency on Azure** — While open-source, the solution becomes tightly coupled to Azure services, creating a new cloud-vendor dependency.

## 5. Objective

The primary objectives of this initiative are to:

1. Eliminate dependency on proprietary middleware
2. Reduce long-term licensing and operational costs
3. Adopt cloud-native architecture principles
4. Improve scalability, availability, and resilience
5. Enable Infrastructure as Code and CI/CD automation
6. Support future business expansion with minimal architectural changes
7. Build a platform based on widely adopted open-source technologies

## 6. Business & Scaling Assumptions

### Existing System Load (Software AG Metrics)

| Month | Product | Total Transactions | Total per Month |
|-------|---------|-------------------|-----------------|
| August | Integration | 3098368 | 10201477 |
| | API Gateway | 7103109 | |
| September | Integration | 3423312 | 10331573 |
| | API Gateway | 6908261 | |
| October | Integration | 2996913 | 10210337 |
| | API Gateway | 7213424 | |

The proposed platform should be designed considering the following baseline workload.

| Metric | Target |
|--------|--------|
| Concurrent Users | Up to 500 |
| Peak Trade Orders | 200 Orders/Second |
| Availability Target | 99.99% |
| Business Growth | 5x growth over the next five years |

The solution should support horizontal scalability and auto-scaling while maintaining low operational overhead.

## 7. Target Environments

The platform will initially be deployed across the following environments:

- Dev
- QA
- Preprod
- Prod

The detailed environment-wise sizing and quantities are provided in the attached Excel sheet.

## 8. Proposed Technology Stack

The target platform will primarily consist of the following technologies.

| Layer | Proposed Technology |
|-------|---------------------|
| Programming Language | Java 21 LTS |
| Framework | Spring Boot 4.x.x |
| Build | Maven |
| API Documentation | OpenAPI / Swagger / Redocly |
| Security | Spring Security + JWT |
| API Gateway | Azure API Management |
| Global Load Balancer | Azure Front Door |
| Container Platform | Azure Container Apps |
| Secrets | Azure Key Vault |
| Database | Azure PostgreSQL Flexible Server |
| Cache | Azure Managed Redis |
| Messaging | Azure Service Bus |
| Object Storage | Azure Blob Storage |
| Container Registry | Azure Container Registry |
| Monitoring | Azure Monitor |
| Logging | Azure Log Analytics |
| Distributed Tracing | Application Insights |
| CI/CD | GitHub Actions |
| Infrastructure as Code | Terraform |
| Code Quality | SonarQube Enterprise |
| Security Scanning | Trivy |

The initial component architecture diagram is attached separately in SVG format for reference.

## 9. Success Criteria

The migration will be considered successful when:

- Software AG components are fully retired.
- Existing business functionality is preserved.
- System availability meets or exceeds the current platform.
- Performance is equal to or better than the existing implementation.
- Deployments are fully automated.
- Operational costs are reduced.
- The platform supports future scalability.
- The solution is based on open-source technologies without dependency on proprietary middleware.

## 10. Decision

The organization will proceed with the migration from Software AG middleware to an open-source Java 21 + Spring Boot platform hosted on Azure cloud-native services. The migration will be executed in phases, starting with non-critical services, while maintaining the existing Software AG platform in parallel until all business functionality is validated on the new stack. This decision commits to retiring Software AG components in favor of Azure Container Apps, Azure API Management, Azure PostgreSQL, and the rest of the proposed technology stack, with success measured against the criteria defined above.
