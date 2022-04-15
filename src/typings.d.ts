/* eslint no-var: off */

/* SystemJS module definition */
declare var nodeModule: NodeModule;
interface NodeModule {
  id: string;
}

/*global globalThis*/
declare var window: Window & typeof globalThis;
interface Window {
  process: any;
  require: any;
}
