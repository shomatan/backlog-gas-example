import Properties = GoogleAppsScript.Properties.Properties

export interface UserPropertyService {
  get: (key: string) => string,
  set: (key: string, value: string) => Properties
}

export const UserPropertyServiceImpl = (): UserPropertyService => ({
  get: (key: string): string =>
    PropertiesService.getUserProperties().getProperty(key),
  set: (key: string, value: string): Properties =>
    PropertiesService.getUserProperties().setProperty(key, value)
})