import { c as defineEventHandler } from '../../_/nitro.mjs';
import process from 'node:process';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:url';
import 'consola/core';
import 'jose';
import 'node:path';
import 'better-sqlite3';

const enableLogin = defineEventHandler(async () => {
  return {
    enable: true,
    url: `https://github.com/login/oauth/authorize?client_id=${process.env.G_CLIENT_ID}`
  };
});

export { enableLogin as default };
