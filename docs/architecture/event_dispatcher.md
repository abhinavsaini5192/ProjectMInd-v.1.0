# Event Dispatcher

The `KernelEventDispatcher` acts as a lightweight Pub/Sub message bus utilizing the standard Node.js `EventEmitter`. 

All subsystems bind to standard string constants defined in `KernelEvents.ts`. This ensures strong typing across module boundaries without tight coupling.
