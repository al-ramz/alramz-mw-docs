# ADR-1: Secret Management

## What is it?

Instead of loading secret data into a cache on a scheduled basis using the Generate Cache API, we will use **Azure Key Vault** as the source of truth for application secrets.

When the service starts, it will retrieve the required keys and secrets from Azure Key Vault and keep them in application memory for the lifetime of the service.

## Why is it?

The current approach introduces an additional dependency on the caching server and requires scheduled jobs to keep the cached secrets up to date.

Using Azure Key Vault simplifies the design by removing the caching dependency for secrets. The service gets the required secrets during startup and uses them directly from memory during runtime.

## Advantages

* Removes dependency on the caching server for secrets.
* Simpler architecture with fewer moving parts.
* Azure Key Vault is purpose-built for secure secret management.
* No scheduled cache-refresh process is required.
* Faster access during runtime since secrets are already in memory.
* Reduces calls to the caching layer.

## Disadvantages

* Secrets loaded at startup will not automatically reflect changes made in Key Vault until the service reloads them.
* A Key Vault dependency is required when the service starts.
* If a required secret is unavailable during startup, the service may fail to start.
* Applications need a proper strategy for handling secret rotation.

## Decision

We will use **Azure Key Vault as the source of truth for secrets**. Required secrets will be loaded when the service starts and kept in memory during runtime, removing the need for scheduled secret caching.
