import { ProjectMindSDK } from '../sdk/ProjectMindSDK';

/**
 * State of a plugin in its lifecycle.
 */
export enum PluginState {
  INSTALLED = 'installed',
  VALIDATED = 'validated',
  LOADED = 'loaded',
  INITIALIZED = 'initialized',
  REGISTERED = 'registered',
  RUNNING = 'running',
  DISABLED = 'disabled',
  FAILED = 'failed',
  UNLOADED = 'unloaded',
  REMOVED = 'removed',
}

/**
 * Represents a single instance of a loaded plugin.
 */
export interface Plugin {
  /**
   * The unique ID of the plugin (e.g., 'org.projectmind.parser.typescript').
   */
  readonly id: string;

  /**
   * Human-readable name.
   */
  readonly name: string;

  /**
   * Version string (semver).
   */
  readonly version: string;

  /**
   * Current state of the plugin.
   */
  state: PluginState;

  /**
   * Initialize is called before start, typically used for setting up internal structures.
   * The SDK is passed here so the plugin can register capabilities and subscribe to events.
   */
  initialize(sdk: ProjectMindSDK): Promise<void>;

  /**
   * Start is called to tell the plugin to begin its main work (e.g., parsing, running background tasks).
   */
  start(): Promise<void>;

  /**
   * Stop is called to cleanly shut down the plugin.
   */
  stop(): Promise<void>;
}
