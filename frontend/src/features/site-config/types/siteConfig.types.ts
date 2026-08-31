export interface ThemeSettingItem {
  key: string;
  value: string;
}

export interface UpdateSiteConfigPayload {
  settings: ThemeSettingItem[];
}
