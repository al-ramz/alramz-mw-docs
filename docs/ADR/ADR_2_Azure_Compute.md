# ADR-2: Azure Compute Platform Selection

## Why

The migration requires a container hosting platform that can run Spring Boot 4.x microservices on Java 21, integrate with Azure API Management, and support the target workload of up to 500 concurrent users and 200 trade orders per second. The platform must also enable auto-scaling, maintain 99.99% availability, and keep operational complexity manageable for the current team size.

Choosing the wrong compute layer would create long-term technical debt, increase operational overhead, and limit the ability to meet business growth targets of 5x over the next five years. This decision evaluates the three primary Azure compute options against the migration requirements.

A critical constraint emerged during discussions with Zentec and Eand: **Azure Container Apps is not available in UAE North and UAE Central regions**. For disaster recovery and regional availability requirements, the platform must be deployable in these regions. Additionally, the team requires full control over networking, service mesh, and cluster configuration to meet the trading platform's resilience and compliance requirements.

## What

Three compute platform options were evaluated in combination with Azure API Management (APIM):

- **APIM + Azure Container Apps (ACA)** — Serverless container platform with built-in KEDA-based autoscaling, revision management, and Dapr integration.
- **APIM + Azure Kubernetes Service (AKS)** — Full Kubernetes control with custom scheduling, service mesh, operators, and multi-cloud portability.
- **APIM + Azure App Service** — Managed PaaS for web applications and APIs with deployment slots, easy CI/CD, and low operational complexity.

Each option was scored across multiple dimensions including microservices suitability, Spring Boot compatibility, Kubernetes requirements, autoscaling capabilities, deployment strategies, operational complexity, cost model, and availability.

## Comparison Summary

| Category                                         | **APIM + Azure Container Apps**          | **APIM + AKS**                           | **APIM + Azure App Service**          |
| ------------------------------------------------ | ---------------------------------------- | ---------------------------------------- | ------------------------------------- |
| **Primary purpose**                              | Managed containerized microservices      | Full Kubernetes platform                 | Managed web/API application hosting   |
| **Overall flexibility**                          | ⭐⭐⭐⭐                                     | ⭐⭐⭐⭐⭐                                    | ⭐⭐⭐                                   |
| **Microservices suitability**                    | ⭐⭐⭐⭐⭐                                    | ⭐⭐⭐⭐⭐                                    | ⭐⭐⭐⭐                                  |
| **Spring Boot suitability**                      | 🟢 Excellent                             | 🟢 Excellent                             | 🟢 Excellent                          |
| **Java 21 support**                              | 🟢                                       | 🟢                                       | 🟢                                    |
| **Container support**                            | 🟢 Native                                | 🟢 Native                                | 🟢 Supported                          |
| **Kubernetes required**                          | ❌ No                                     | 🟢 Yes                                   | ❌ No                                  |
| **Infrastructure control**                       | ⭐⭐⭐                                      | ⭐⭐⭐⭐⭐                                    | ⭐⭐                                    |
| **Node/VM control**                              | ❌                                        | 🟢 Full                                  | ❌                                     |
| **Kubernetes API**                               | ❌                                        | 🟢                                       | ❌                                     |
| **Custom CRDs**                                  | ❌                                        | 🟢                                       | ❌                                     |
| **Kubernetes Operators**                         | ❌                                        | 🟢                                       | ❌                                     |
| **Custom scheduling**                            | Limited                                  | 🟢 Excellent                             | ❌                                     |
| **Service mesh**                                 | Limited                                  | 🟢 Excellent                             | Limited/No                            |
| **Custom networking**                            | ⭐⭐⭐⭐                                     | ⭐⭐⭐⭐⭐                                    | ⭐⭐⭐                                   |
| **Private networking**                           | 🟢                                       | 🟢                                       | 🟢                                    |
| **VNet integration**                             | 🟢                                       | 🟢                                       | 🟢                                    |
| **Private endpoints**                            | 🟢                                       | 🟢                                       | 🟢                                    |
| **Internal service communication**               | 🟢 Excellent                             | 🟢 Excellent                             | 🟢 Good                               |
| **Service discovery**                            | 🟢 Built-in                              | 🟢 Kubernetes-native                     | 🟡 More application/network oriented  |
| **Ingress flexibility**                          | ⭐⭐⭐⭐                                     | ⭐⭐⭐⭐⭐                                    | ⭐⭐⭐                                   |
| **Autoscaling**                                  | 🟢 Excellent                             | 🟢 Excellent                             | 🟢 Good                               |
| **Scale to zero**                                | 🟢 Yes                                   | 🟡 Possible, more complex                | 🔴 Generally not the normal model     |
| **KEDA**                                         | 🟢 Native                                | 🟢 Available                             | 🟡 Limited compared with ACA/AKS      |
| **HTTP autoscaling**                             | 🟢                                       | 🟢                                       | 🟢                                    |
| **Event-driven scaling**                         | 🟢 Excellent                             | 🟢 Excellent                             | 🟡 More limited                       |
| **CPU/memory scaling**                           | 🟢                                       | 🟢                                       | 🟢                                    |
| **Deployment revisions**                         | 🟢 Excellent                             | 🟢 With Kubernetes tooling               | 🟢 Deployment slots                   |
| **Blue/Green deployment**                        | 🟢                                       | 🟢                                       | 🟢                                    |
| **Canary deployment**                            | 🟢                                       | 🟢 Excellent                             | 🟡 Possible, less flexible            |
| **Traffic splitting**                            | 🟢 Built-in                              | 🟢 With appropriate tooling              | 🟢 Slots                              |
| **Rolling deployment**                           | 🟢                                       | 🟢                                       | 🟢                                    |
| **GitHub Actions**                               | 🟢 Excellent                             | 🟢 Excellent                             | 🟢 Excellent                          |
| **ACR integration**                              | 🟢                                       | 🟢                                       | 🟢                                    |
| **CI/CD complexity**                             | ⭐⭐ Low                                   | ⭐⭐⭐⭐ High                                | ⭐⭐ Low                                |
| **Operational complexity**                       | ⭐⭐ Low                                   | ⭐⭐⭐⭐⭐ High                               | ⭐⭐ Low                                |
| **Platform team required**                       | Usually no                               | Often yes                                | Usually no                            |
| **Cluster management**                           | ❌                                        | 🟢 Required                              | ❌                                     |
| **Node patching/management**                     | Azure-managed                            | 🟡 You manage cluster/node configuration | Azure-managed                         |
| **Kubernetes upgrades**                          | ❌                                        | 🟢 Required                              | ❌                                     |
| **OS-level control**                             | 🔴                                       | 🟢                                       | 🔴                                    |
| **Persistent workloads**                         | 🟡 Better with external managed services | 🟢 Stronger options                      | 🟡                                    |
| **Stateful workloads**                           | 🟡 Not ideal                             | 🟢 Better                                | 🟡                                    |
| **Background workers**                           | 🟢 Excellent                             | 🟢 Excellent                             | 🟢 Good                               |
| **Scheduled jobs**                               | 🟢 Jobs                                  | 🟢 Jobs/CronJobs                         | 🟢 WebJobs                            |
| **Event-driven applications**                    | 🟢 Excellent                             | 🟢 Excellent                             | 🟡 Good                               |
| **Dapr**                                         | 🟢 Excellent integration                 | 🟢 Can deploy yourself                   | 🟡                                    |
| **API-only applications**                        | 🟢 Excellent                             | 🟢 Excellent                             | 🟢 Excellent                          |
| **Traditional monolithic API**                   | 🟢                                       | 🟢                                       | 🟢 **Excellent**                      |
| **Small number of APIs**                         | 🟢                                       | 🔴 Overkill                              | 🟢 **Excellent**                      |
| **10–15 microservices**                          | 🟢 **Excellent**                         | 🟢 Excellent                             | 🟢 Good                               |
| **20–50+ microservices**                         | 🟢 Excellent                             | 🟢 **Excellent**                         | 🟡 Can become cumbersome              |
| **50+ complex services**                         | 🟡 Evaluate                              | 🟢 **Excellent**                         | 🔴 Usually not ideal                  |
| **Multi-container application**                  | 🟢                                       | 🟢                                       | 🟡                                    |
| **Sidecars**                                     | 🟢 Supported scenarios                   | 🟢 Excellent                             | 🟡 Limited                            |
| **Custom networking policies**                   | 🟡                                       | 🟢 Excellent                             | 🟡                                    |
| **NetworkPolicy**                                | 🟡 Limited                               | 🟢 Kubernetes-native                     | 🔴                                    |
| **Advanced load balancing**                      | 🟢                                       | 🟢 **Excellent**                         | 🟢                                    |
| **Multi-cloud portability**                      | 🟡                                       | 🟢 **Best**                              | 🔴                                    |
| **Kubernetes portability**                       | 🔴                                       | 🟢 **Best**                              | 🔴                                    |
| **Azure-native experience**                      | 🟢 **Excellent**                         | 🟢                                       | 🟢 **Excellent**                      |
| **Developer experience**                         | 🟢 **Excellent**                         | 🟡 More complex                          | 🟢 **Excellent**                      |
| **Learning curve**                               | Low/medium                               | **High**                                 | **Low**                               |
| **Troubleshooting complexity**                   | Low/medium                               | **High**                                 | Low                                   |
| **Monitoring**                                   | 🟢                                       | 🟢                                       | 🟢                                    |
| **OpenTelemetry**                                | 🟢                                       | 🟢                                       | 🟢                                    |
| **Application Insights**                         | 🟢                                       | 🟢                                       | 🟢                                    |
| **Logging complexity**                           | Low                                      | High                                     | Low                                   |
| **Cost model**                                   | Consumption / workload based             | Node/VM + management + infrastructure    | App/service-plan based                |
| **Idle workload cost**                           | 🟢 Can be very low                       | 🔴 Nodes continue running                | 🟡 App Service Plan continues running |
| **Cost predictability**                          | 🟡                                       | 🟢                                       | 🟢 **Excellent**                      |
| **Cost efficiency for variable traffic**         | 🟢 **Excellent**                         | 🟡                                       | 🟡                                    |
| **Cost efficiency for constant heavy workloads** | 🟢/🟡                                    | 🟢                                       | 🟢                                    |
| **Dev/QA environments**                          | 🟢 **Excellent**                         | 🟡                                       | 🟢 **Excellent**                      |
| **Production APIs**                              | 🟢 **Excellent**                         | 🟢 **Excellent**                         | 🟢 Excellent                          |
| **High availability**                            | 🟢                                       | 🟢 **Excellent**                         | 🟢                                    |
| **99.9%+ SLA scenarios**                         | 🟢                                       | 🟢                                       | 🟢                                    |
| **99.999% architecture**                         | 🟢 With proper architecture              | 🟢 **Excellent control**                 | 🟢 With proper architecture           |
| **Platform lock-in**                             | 🟡 Azure-specific                        | 🟡 Azure AKS but Kubernetes portable     | 🟡 Azure-specific                     |
| **Best for simple APIs**                         | 🟢                                       | 🔴 Overkill                              | 🟢 **Best**                           |
| **Best for standard Spring Boot microservices**  | 🟢 Best balance                          | 🟢 **Best**                              | 🟢                                    |
| **Best for complex Kubernetes microservices**    | 🔴                                       | 🟢 **Best**                              | 🔴                                    |
| **Best for traditional enterprise applications** | 🟢                                       | 🟡                                       | 🟢 **Best**                           |
| **Best for platform engineering**                | 🟡                                       | 🟢 **Best**                              | 🔴                                    |
| **Best for serverless-like containers**          | 🟢 **Best**                              | 🟡                                       | 🔴                                    |
| **UAE North availability**                       | 🟢 Yes                                   | 🟢 Yes                                   | 🟢 Yes                                |
| **UAE Central availability**                     | 🟢 Yes                                   | 🟢 Yes                                   | 🟢 Yes                                |
| **Regional DR support**                          | 🟢 Multi-region                          | 🟢 **Excellent**                         | 🟡                                    |
| **Infrastructure flexibility**                   | ⭐⭐⭐                                      | ⭐⭐⭐⭐⭐                                    | ⭐⭐                                    |
| **Operational simplicity**                       | ⭐⭐⭐⭐                                     | ⭐⭐                                       | ⭐⭐⭐⭐⭐                                 |
| **Microservice flexibility**                     | ⭐⭐⭐⭐                                     | ⭐⭐⭐⭐⭐                                    | ⭐⭐⭐                                   |
| **Recommended for your architecture**            | ❌ Not available in target regions        | 🏆 **#1**                                | 🥈 **#2**                             |

## Advantages

### Azure Kubernetes Service (AKS)

- **Regional availability**: Available in UAE North and UAE Central, meeting disaster recovery requirements discussed with Zentec and Eand.
- **Full Kubernetes control**: Provides complete control over cluster configuration, networking, security policies, and service mesh.
- **Microservices excellence**: Native support for Spring Boot microservices with Helm charts, operators, and Kubernetes-native deployment patterns.
- **Disaster recovery**: Supports multi-region deployments, cluster federation, and advanced failover configurations essential for the trading platform's 99.99% availability target.
- **Service mesh integration**: Supports Istio, Linkerd, or similar service meshes for advanced traffic management, observability, and security.
- **Custom networking**: Full control over network policies, ingress controllers, and private networking configurations.
- **Scalability**: Supports horizontal pod autoscaling, cluster autoscaler, and KEDA for event-driven scaling.
- **Multi-cloud portability**: Kubernetes-standard workloads can be deployed to other cloud providers or on-premises if needed.
- **Spring Boot compatibility**: Excellent support through standard container images, ConfigMaps, Secrets, and Helm charts.
- **CI/CD integration**: Robust support for GitHub Actions, Argo CD, Flux, and other GitOps workflows.

### Azure Container Apps

- **Operational simplicity**: Fully managed serverless containers with no cluster management overhead.
- **Scale-to-zero**: Automatic scaling to zero for cost savings in non-production environments.
- **Built-in Dapr**: Native Dapr integration for microservices patterns.
- **KEDA-based autoscaling**: Excellent event-driven scaling capabilities.

### Azure App Service

- **Low operational overhead**: Fully managed PaaS with minimal configuration required.
- **Excellent for traditional apps**: Ideal for monolithic APIs and simple web applications.
- **Deployment slots**: Built-in staging slots for blue/green deployments.

## Disadvantages

### Azure Kubernetes Service

- **Operational complexity**: Requires cluster management, node patching, Kubernetes upgrades, and ongoing maintenance.
- **Higher learning curve**: Team requires Kubernetes expertise and operational knowledge.
- **Platform team often required**: May require dedicated platform engineering resources for cluster operations.
- **Cost at idle**: Nodes continue running even when no workloads are deployed.
- **Longer initial setup**: Cluster provisioning and configuration takes more time than Container Apps.

### Azure Container Apps

- **Regional availability gap**: Not available in UAE North or UAE Central, which are required for disaster recovery.
- **Limited control**: Less control over underlying infrastructure and networking compared to AKS.
- **Service mesh limitations**: Limited service mesh capabilities compared to full Kubernetes.
- **No cluster-level access**: Cannot access cluster-level features or implement custom operators.

### Azure App Service

- **Limited microservices support**: Not designed for complex microservice architectures with many services.
- **Kubernetes features missing**: No support for custom CRDs, operators, or advanced Kubernetes patterns.
- **Less suitable for Spring Boot microservices**: Better suited for traditional web applications.

## Decision

The organization will adopt **APIM + Azure Kubernetes Service (AKS)** as the standard compute platform for the migration.

This decision is driven by the **regional availability requirement**: Azure Container Apps is not available in UAE Central, which are essential for the disaster recovery architecture discussed with Zentec and Eand. AKS provides the necessary regional coverage while delivering the full Kubernetes feature set required for the trading platform's resilience, networking, and service mesh requirements.

AKS provides full control over cluster configuration, supports advanced disaster recovery patterns, and enables the team to implement custom networking policies, service mesh, and operators as the platform scales. While AKS introduces higher operational complexity compared to Container Apps, the regional availability and disaster recovery requirements make it the necessary choice for this migration.

The team will invest in Kubernetes operational knowledge and platform engineering capabilities to manage the AKS clusters effectively. This decision aligns with the cloud-native architecture principles established in ADR-0 and ensures the platform can meet the 99.99% availability target across the required regions.
