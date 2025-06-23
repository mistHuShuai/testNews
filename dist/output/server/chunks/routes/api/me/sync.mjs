import { c as defineEventHandler, f as useDatabase, r as readBody, l as logger, g as createError } from '../../../_/nitro.mjs';
import z from 'zod';
import process from 'node:process';
import { U as UserTable } from '../../../_/user.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:url';
import 'consola/core';
import 'jose';
import 'node:path';
import 'better-sqlite3';

function verifyPrimitiveMetadata(target) {
  return z.object({
    data: z.record(z.string(), z.array(z.string())),
    updatedTime: z.number()
  }).parse(target);
}

const sync = defineEventHandler(async (event) => {
  try {
    const { id } = event.context.user;
    const db = useDatabase();
    if (!db) throw new Error("Not found database");
    const userTable = new UserTable(db);
    if (process.env.INIT_TABLE !== "false") await userTable.init();
    if (event.method === "GET") {
      const { data, updated } = await userTable.getData(id);
      return {
        data: data ? JSON.parse(data) : void 0,
        updatedTime: updated
      };
    } else if (event.method === "POST") {
      const body = await readBody(event);
      verifyPrimitiveMetadata(body);
      const { updatedTime, data } = body;
      await userTable.setData(id, JSON.stringify(data), updatedTime);
      return {
        success: true,
        updatedTime
      };
    }
  } catch (e) {
    logger.error(e);
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "Internal Server Error"
    });
  }
});

export { sync as default };
