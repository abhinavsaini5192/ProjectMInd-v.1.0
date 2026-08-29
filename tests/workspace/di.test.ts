import { describe, it, expect, vi } from 'vitest';
import { DIContainer } from '../../src/workspace/di/DIContainer';
import { DIError } from '../../src/workspace/errors';

describe('DIContainer', () => {
  it('should register and resolve a transient service', () => {
    const container = new DIContainer();
    const token = Symbol('Test');
    class TestService {}
    
    container.registerTransient(token, TestService);
    const instance1 = container.resolve(token);
    const instance2 = container.resolve(token);
    
    expect(instance1).toBeInstanceOf(TestService);
    expect(instance1).not.toBe(instance2);
  });

  it('should register and resolve a singleton service', () => {
    const container = new DIContainer();
    const token = Symbol('Test');
    class TestService {}
    
    container.registerSingleton(token, TestService);
    const instance1 = container.resolve(token);
    const instance2 = container.resolve(token);
    
    expect(instance1).toBeInstanceOf(TestService);
    expect(instance1).toBe(instance2); // Same instance
  });

  it('should resolve dependencies correctly', () => {
    const container = new DIContainer();
    const tokenA = Symbol('A');
    const tokenB = Symbol('B');
    
    class ServiceB {}
    class ServiceA { constructor(public b: ServiceB) {} }
    
    container.registerSingleton(tokenB, ServiceB);
    container.registerSingleton(tokenA, ServiceA, [tokenB]);
    
    const a = container.resolve<ServiceA>(tokenA);
    expect(a.b).toBeInstanceOf(ServiceB);
  });

  it('should detect circular dependencies', () => {
    const container = new DIContainer();
    const tokenA = Symbol('A');
    const tokenB = Symbol('B');
    
    class ServiceA { constructor(public b: any) {} }
    class ServiceB { constructor(public a: any) {} }
    
    container.registerSingleton(tokenB, ServiceB, [tokenA]);
    container.registerSingleton(tokenA, ServiceA, [tokenB]);
    
    expect(() => container.resolve(tokenA)).toThrowError(DIError);
  });

  it('should register and resolve factories', () => {
    const container = new DIContainer();
    const token = Symbol('Factory');
    container.registerFactory(token, () => 'factory-value', 'Singleton');
    
    expect(container.resolve(token)).toBe('factory-value');
  });

  it('should throw when resolving unregistered token', () => {
    const container = new DIContainer();
    expect(() => container.resolve(Symbol('Unknown'))).toThrowError(DIError);
  });
  
  it('should validate startup without errors for valid graphs', () => {
    const container = new DIContainer();
    const tokenA = Symbol('A');
    container.registerSingleton(tokenA, class A {});
    expect(() => container.validateStartup()).not.toThrow();
  });
});
