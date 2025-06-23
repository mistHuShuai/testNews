import { $ as $fetch } from './nitro.mjs';

const myFetch = $fetch.create({
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
  },
  timeout: 1e4,
  retry: 3
});

export { myFetch as m };
