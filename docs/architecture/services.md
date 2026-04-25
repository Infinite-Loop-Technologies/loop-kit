# Services

Services are for domain state and operations. They're pretty simple - they're basically just implementations of interfaces. Users of services often might not be aware of the exact implementation. This is great for decoupling.

Making a powerful, bug-free service can be easy using the following patterns:

- Use `store` from `@loop-kit/common`. Consider making it `readonly`.
- For handling domain ownership or relations, use `Set`, or `Relation`. `Lookup` is especially powerful, as you can pair things together via logic, and not just references.
- Treat a service as an in-memory state manager that is fairly simple and just offers commands for the outside world. The commands can and should return typed responses like Result, or Option. These greatly improve code readability. They can also return a task for an operation that is asynchronous, and can be cancelled. Services can be given to runtimes, or to other services. It makes sense for a service to be constructed by a factory function. The pattern would generally be to have a generic shape, like `BlobStoreService`. Then, have a specific implementation: `R2Service`.
