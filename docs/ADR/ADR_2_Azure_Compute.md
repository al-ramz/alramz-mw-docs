# ADR-2: Azure Compute Platform Selection

## Why

The migration requires a container hosting platform that can run Spring Boot 4.x microservices on Java 21, integrate with Azure API Management, and support the target workload of up to 500 concurrent users and 200 trade orders per second. The platform must also enable auto-scaling, maintain 99.99% availability, and keep operational complexity manageable for the current team size.

Choosing the wrong compute layer would create long-term technical debt, increase operational overhead, and limit the ability to meet business growth targets of 5x over the next five years. This decision evaluates the three primary Azure compute options against the migration requirements.

## What

Three compute platform options were evaluated in combination with Azure API Management (APIM):

- **APIM + Azure Container Apps (ACA)** — Serverless container platform with built-in KEDA-based autoscaling, revision management, and Dapr integration.
- **APIM + Azure Kubernetes Service (AKS)** — Full Kubernetes control with custom scheduling, service mesh, operators, and multi-cloud portability.
- **APIM + Azure App Service** — Managed PaaS for web applications and APIs with deployment slots, easy CI/CD, and low operational overhead.

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
| **Best for standard Spring Boot microservices**  | 🟢 **Best balance**                      | 🟢                                       | 🟢                                    |
| **Best for complex Kubernetes microservices**    | 🔴                                       | 🟢 **Best**                              | 🔴                                    |
| **Best for traditional enterprise applications** | 🟢                                       | 🟡                                       | 🟢 **Best**                           |
| **Best for platform engineering**                | 🟡                                       | 🟢 **Best**                              | 🔴                                    |
| **Best for serverless-like containers**          | 🟢 **Best**                              | 🟡                                       | 🔴                                    |
| **Infrastructure flexibility**                   | ⭐⭐⭐                                      | ⭐⭐⭐⭐⭐                                    | ⭐⭐                                    |
| **Operational simplicity**                       | ⭐⭐⭐⭐                                     | ⭐⭐                                       | ⭐⭐⭐⭐⭐                                 |
| **Microservice flexibility**                     | ⭐⭐⭐⭐                                     | ⭐⭐⭐⭐⭐                                    | ⭐⭐⭐                                   |
| **Recommended for your architecture**            | 🏆 **#1**                                | #3                                       | 🥈 **#2**                             |

??? "Draft Decision"

    The organization will adopt **APIM + Azure Container Apps** as the standard compute platform for the migration. Container Apps provides the best balance of microservices flexibility, operational simplicity, and cost efficiency for the current and projected workload. It supports Spring Boot natively, integrates seamlessly with Azure API Management, and offers excellent autoscaling including scale-to-zero for non-production environments. This decision keeps the team unblocked from managing Kubernetes control planes while still delivering on the cloud-native architecture requirements defined in ADR-0.
