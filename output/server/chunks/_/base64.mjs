import { Buffer } from 'node:buffer';

function decodeBase64URL(str) {
  return new TextDecoder().decode(Buffer.from(decodeURIComponent(str), "base64"));
}
function encodeBase64URL(str) {
  return encodeURIComponent(Buffer.from(str).toString("base64"));
}
function encodeBase64(str) {
  return Buffer.from(str).toString("base64");
}

export { encodeBase64 as a, decodeBase64URL as d, encodeBase64URL as e };
