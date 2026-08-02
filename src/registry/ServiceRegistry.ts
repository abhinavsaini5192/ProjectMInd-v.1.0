import { Service } from '../interfaces';
import { ProjectMindError } from '../errors';

export class ServiceRegistrationError extends ProjectMindError {
  constructor(message: string) {
    super(message, 'SERVICE_REGISTRATION_ERROR');
  }
}

/**
 * Manages the registration and retrieval of loosely coupled services.
 */
export class ServiceRegistry {
  private services: Map<string, Service> = new Map();

  /**
   * Registers a new service.
   * @param service - The service instance to register.
   * @throws {ServiceRegistrationError} If a service with the same name already exists.
   */
  public register(service: Service): void {
    if (this.services.has(service.name)) {
      throw new ServiceRegistrationError(`Service with name '${service.name}' is already registered.`);
    }
    this.services.set(service.name, service);
  }

  /**
   * Retrieves a registered service by name.
   * @param name - The name of the service to retrieve.
   * @returns The registered service, or undefined if not found.
   */
  public getService<T extends Service>(name: string): T | undefined {
    return this.services.get(name) as T | undefined;
  }

  /**
   * Returns all registered services.
   */
  public getAllServices(): Service[] {
    return Array.from(this.services.values());
  }
  
  /**
   * Unregisters a service. 
   */
  public unregister(name: string): void {
    this.services.delete(name);
  }
}
