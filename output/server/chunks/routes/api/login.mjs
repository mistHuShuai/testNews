import { c as defineEventHandler, e as sendRedirect } from '../../_/nitro.mjs';
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

const login = defineEventHandler(async (event) => {
  sendRedirect(event, `https://github.com/login/oauth/authorize?client_id=${process.env.G_CLIENT_ID}`);
});

export { login as default };
