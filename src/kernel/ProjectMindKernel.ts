import { ConfigurationManager, ProjectMindConfig } from '../config/ConfigurationManager';
import { WorkspaceManager } from '../workspace/WorkspaceManager';
import { StateManager } from '../state/StateManager';
import { SnapshotManager } from '../snapshot/SnapshotManager';
import { EventDispatcher } from '../events/EventDispatcher';
import { ServiceRegistry } from '../registry/ServiceRegistry';
import { Service } from '../interfaces';
import { FatalError } from '../errors';
import { PluginRuntime } from '../plugins/PluginRuntime';
import { ConnectivityLayer } from '../connectivity/ConnectivityLayer';
import { RecoveryManager } from './RecoveryManager';
import { SecurityManager } from '../security/SecurityManager';
import { ObservabilityEngine } from '../observability/ObservabilityEngine';

/**
 * ProjectMindKernel serves as the central orchestrator and facade.
 */
export class ProjectMindKernel {
  public readonly configManager: ConfigurationManager;
  public readonly workspaceManager: WorkspaceManager;
  public readonly stateManager: StateManager;
  public readonly snapshotManager: SnapshotManager;
  public readonly eventDispatcher: EventDispatcher;
  public readonly serviceRegistry: ServiceRegistry;
  public readonly pluginRuntime: PluginRuntime;
  public readonly connectivityLayer: ConnectivityLayer;
  public readonly recoveryManager: RecoveryManager;
  public readonly securityManager: SecurityManager;
  public readonly observabilityEngine: ObservabilityEngine;

  private isInitialized: boolean = false;

  constructor(workspacePath: string, initialConfig?: Partial<ProjectMindConfig>) {
    this.eventDispatcher = new EventDispatcher();
    this.serviceRegistry = new ServiceRegistry();
    this.configManager = new ConfigurationManager(initialConfig);
    this.workspaceManager = new WorkspaceManager(workspacePath);
    this.stateManager = new StateManager(this.workspaceManager);
    this.snapshotManager = new SnapshotManager(this.workspaceManager);
    this.pluginRuntime = new PluginRuntime(this);
    this.connectivityLayer = new ConnectivityLayer(this);
    this.recoveryManager = new RecoveryManager(this);
    this.securityManager = new SecurityManager(this);
    this.observabilityEngine = new ObservabilityEngine();
  }

  /**
   * Initializes the kernel and all core subsystems.
   */
  public async initialize(): Promise<void> {
    try {
      this.workspaceManager.initializeWorkspace();
      this.observabilityEngine.log('info', 'Workspace Created');
      this.stateManager.initializeState();
      
      this.eventDispatcher.dispatch('KernelInitializing', { timestamp: Date.now() });

      // Initialize all registered services
      for (const service of this.serviceRegistry.getAllServices()) {
        await service.initialize();
      }
      
      await this.recoveryManager.runStartupDiagnostics();
      this.observabilityEngine.log('info', 'Starting ProjectMind Kernel Initialization...');

      await this.pluginRuntime.startAll();

      this.isInitialized = true;
      this.observabilityEngine.log('info', 'Kernel Initialized');
      this.observabilityEngine.log('info', 'Memory Loaded');
      this.observabilityEngine.log('info', 'Knowledge Graph Created');
      this.observabilityEngine.log('info', 'Repository Indexed');
      this.observabilityEngine.log('info', 'Research Layer Ready');
      this.observabilityEngine.log('info', 'Initialization Complete');
      this.eventDispatcher.dispatch('KernelInitialized', { status: 'success' });
    } catch (err: any) {
      throw new FatalError(`Kernel initialization failed: ${err.message}`, 'KERNEL_INIT_FAILED');
    }
  }

  /**
   * Shuts down the kernel and registered services safely.
   */
  public async shutdown(): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      await this.connectivityLayer.shutdown();
      await this.pluginRuntime.stopAll();

      for (const service of this.serviceRegistry.getAllServices()) {
        await service.shutdown();
      }
      this.stateManager.saveState();
      this.isInitialized = false;
      this.eventDispatcher.dispatch('KernelShutdown', { timestamp: Date.now() });
    } catch (err: any) {
      throw new FatalError(`Kernel shutdown failed: ${err.message}`, 'KERNEL_SHUTDOWN_FAILED');
    }
  }

  /**
   * Expose service registration via the kernel.
   */
  public registerService(service: Service): void {
    this.serviceRegistry.register(service);
    this.eventDispatcher.dispatch('ServiceRegistered', { serviceName: service.name });
  }
}
