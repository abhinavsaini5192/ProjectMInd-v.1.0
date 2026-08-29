export interface ISettingsStore {
  getSetting<T>(key: string): Promise<T | null>;
  setSetting<T>(key: string, value: T): Promise<void>;
}

export const ISettingsStoreToken = Symbol('ISettingsStore');
