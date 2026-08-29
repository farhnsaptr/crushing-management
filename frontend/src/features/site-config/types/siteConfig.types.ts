export interface ThemeSettingItem {
  key: string;
  value: string;
}

export interface UpdateSiteConfigPayload {
  settings: ThemeSettingItem[];
  migrationAction?: 'migrate_all' | 'config_only';
}

export interface AffectedPartItem {
  id: string;
  part_number: string;
  part_name: string;
  model_code: string;
  machine_name?: string;
  current_image_key: string;
  new_image_key: string;
}

export interface StorageImpactResult {
  isChanged: boolean;
  oldBucket: string;
  newBucket: string;
  oldFolder: string;
  newFolder: string;
  affectedCount: number;
  affectedParts: AffectedPartItem[];
}
