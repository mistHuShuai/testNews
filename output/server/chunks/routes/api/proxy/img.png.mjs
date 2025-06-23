import { c as defineEventHandler, h as getQuery, i as sendProxy } from '../../../_/nitro.mjs';
import { d as decodeBase64URL } from '../../../_/base64.mjs';
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
import 'node:buffer';

const img_png = defineEventHandler(async (event) => {
  const { url: img, type = "encodeURIComponent" } = getQuery(event);
  if (img) {
    const url = type === "encodeURIComponent" ? decodeURIComponent(img) : decodeBase64URL(img);
    return sendProxy(event, url, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }
});

export { img_png as default };
