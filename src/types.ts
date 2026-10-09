export type RtlMode = 'active' | 'inactive';

export interface IdeInstallation {
  ideName: string;
  workbenchHtmlPath: string;
  workbenchDir: string;
  productJsonPath: string;
  checksumKey: string;
  secondaryHtmlPath?: string;
  secondaryChecksumKey?: string;
}

export interface InstallationStatus {
  installation: IdeInstallation;
  isInstalled: boolean;
  htmlBackupExists: boolean;
  productBackupExists: boolean;
  assetsUpToDate: boolean;
}

export interface InjectionResult {
  messages: string[];
  changed: boolean;
  permissionError: boolean;
}
