import { c as defineEventHandler, r as readBody } from '../../../_/nitro.mjs';
import { g as getCacheTable, s as sources } from '../../../_/cache.mjs';
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

const entire_post = defineEventHandler(async (event) => {
  try {
    const { sources: _ } = await readBody(event);
    const cacheTable = await getCacheTable();
    const ids = _ == null ? void 0 : _.filter((k) => sources[k]);
    if ((ids == null ? void 0 : ids.length) && cacheTable) {
      const caches = await cacheTable.getEntire(ids);
      const now = Date.now();
      return caches.map((cache) => ({
        status: "cache",
        id: cache.id,
        items: cache.items,
        updatedTime: now - cache.updated < sources[cache.id].interval ? now : cache.updated
      }));
    }
  } catch {
  }
});

export { entire_post as default };
