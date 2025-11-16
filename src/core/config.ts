export interface AppConfig {
  desktopWidth: number;
  desktopHeight: number;
  cursorStartX: number;
  cursorStartY: number;
  commandReference: string[];
}

export const defaultConfig: AppConfig = {
  desktopWidth: 900,
  desktopHeight: 640,
  cursorStartX: 120,
  cursorStartY: 120,
  commandReference: [
    'Hey Go, mouse left 150 pixels',
    'Hey Go, mouse to x 400 y 300',
    'Hey Go, click',
    'Hey Go, type hello world'
  ]
};
