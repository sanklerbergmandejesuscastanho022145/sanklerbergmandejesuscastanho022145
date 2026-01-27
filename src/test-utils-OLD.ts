// src/test-utils.ts
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

let testBedInitialized = false;

export function initTestBed() {
  if (!testBedInitialized) {
    getTestBed().initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting(),
      { teardown: { destroyAfterEach: true } }
    );
    testBedInitialized = true;
  }
}