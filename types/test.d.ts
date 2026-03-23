/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Type declarations for Jasmine-compatible shims provided by test-setup.ts.
 * These allow existing tests using Jasmine spy APIs to work with Vitest.
 */

declare namespace jasmine {
  interface SpyAndCalls {
    returnValue(val: any): Spy;
    returnValues(...vals: any[]): Spy;
    callFake(fn: (...args: any[]) => any): Spy;
    callThrough(): Spy;
    throwError(err: any): Spy;
  }

  interface SpyCalls {
    count(): number;
    any(): boolean;
    allArgs(): any[][];
    argsFor(index: number): any[];
    mostRecent(): { args: any[]; returnValue: any };
    first(): { args: any[]; returnValue: any };
    reset(): void;
  }

  interface Spy {
    (...args: any[]): any;
    and: SpyAndCalls;
    calls: SpyCalls;
  }

  function createSpy(name?: string, fn?: (...args: any[]) => any): Spy;
  function createSpyObj(baseName: string, methods: string[]): { [key: string]: Spy };
  function createSpyObj(baseName: string, methods: Record<string, any>): { [key: string]: Spy };
  function objectContaining<T>(obj: Partial<T>): T;
  function arrayContaining<T>(arr: T[]): T[];
  function stringContaining(str: string): string;
  function any(ctor: any): any;
  function anything(): any;
}

declare function spyOn<T, K extends keyof T>(object: T, method: K): jasmine.Spy;
/* eslint-enable @typescript-eslint/no-explicit-any */
