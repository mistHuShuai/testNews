import { c as defineEventHandler } from '../../_/nitro.mjs';
import { V as Version } from '../../_/consts.mjs';
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

const latest = defineEventHandler(async () => {
  return {
    v: Version
  };
});

export { latest as default };
