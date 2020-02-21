/* SystemJS module definition */
declare var nodeModule: NodeModule;
interface NodeModule {
  id: string;
}

declare var window: Window & typeof globalThis;
interface Window {
  process: any;
  require: any;
}
