// src/test-setup.ts
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { beforeAll } from 'vitest';

// Inicializa apenas uma vez
const testBed = getTestBed();

if (!testBed.platform) {
  testBed.initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
    { teardown: { destroyAfterEach: true } }
  );
}