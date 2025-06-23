import { c as defineEventHandler } from '../../_/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:url';
import 'consola/core';
import 'node:process';
import 'jose';
import 'node:path';
import 'better-sqlite3';

const index = defineEventHandler(() => {
  return {
    hello: "world"
  };
});

export { index as default };
