import { j as subtle$1, c as defineEventHandler, h as getQuery, l as logger, g as createError } from '../../_/nitro.mjs';
import { s as sources, g as getCacheTable } from '../../_/cache.mjs';
import { T as TTL } from '../../_/consts.mjs';
import { m as myFetch } from '../../_/fetch.mjs';
import * as cheerio from 'cheerio';
import { load } from 'cheerio';
import { e as encodeBase64URL, a as encodeBase64 } from '../../_/base64.mjs';
import _md5 from 'md5';
import { Buffer } from 'node:buffer';
import iconv from 'iconv-lite';
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

function typeSafeObjectEntries(obj) {
  return Object.entries(obj);
}

function defineSource(source) {
  return source;
}

var SECONDS_A_MINUTE = 60;
var SECONDS_A_HOUR = SECONDS_A_MINUTE * 60;
var SECONDS_A_DAY = SECONDS_A_HOUR * 24;
var SECONDS_A_WEEK = SECONDS_A_DAY * 7;
var MILLISECONDS_A_SECOND = 1e3;
var MILLISECONDS_A_MINUTE = SECONDS_A_MINUTE * MILLISECONDS_A_SECOND;
var MILLISECONDS_A_HOUR = SECONDS_A_HOUR * MILLISECONDS_A_SECOND;
var MILLISECONDS_A_DAY = SECONDS_A_DAY * MILLISECONDS_A_SECOND;
var MILLISECONDS_A_WEEK = SECONDS_A_WEEK * MILLISECONDS_A_SECOND; // English locales

var MS = 'millisecond';
var S = 'second';
var MIN = 'minute';
var H = 'hour';
var D = 'day';
var W = 'week';
var M = 'month';
var Q = 'quarter';
var Y = 'year';
var DATE = 'date';
var FORMAT_DEFAULT = 'YYYY-MM-DDTHH:mm:ssZ';
var INVALID_DATE_STRING = 'Invalid Date'; // regex

var REGEX_PARSE = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/;
var REGEX_FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;

// English [en]
// We don't need weekdaysShort, weekdaysMin, monthsShort in en.js locale
const en = {
  name: 'en',
  weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
  months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
  ordinal: function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'];
    var v = n % 100;
    return "[" + n + (s[(v - 20) % 10] || s[v] || s[0]) + "]";
  }
};

var padStart = function padStart(string, length, pad) {
  var s = String(string);
  if (!s || s.length >= length) return string;
  return "" + Array(length + 1 - s.length).join(pad) + string;
};

var padZoneStr = function padZoneStr(instance) {
  var negMinutes = -instance.utcOffset();
  var minutes = Math.abs(negMinutes);
  var hourOffset = Math.floor(minutes / 60);
  var minuteOffset = minutes % 60;
  return "" + (negMinutes <= 0 ? '+' : '-') + padStart(hourOffset, 2, '0') + ":" + padStart(minuteOffset, 2, '0');
};

var monthDiff = function monthDiff(a, b) {
  // function from moment.js in order to keep the same result
  if (a.date() < b.date()) return -monthDiff(b, a);
  var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month());
  var anchor = a.clone().add(wholeMonthDiff, M);
  var c = b - anchor < 0;
  var anchor2 = a.clone().add(wholeMonthDiff + (c ? -1 : 1), M);
  return +(-(wholeMonthDiff + (b - anchor) / (c ? anchor - anchor2 : anchor2 - anchor)) || 0);
};

var absFloor = function absFloor(n) {
  return n < 0 ? Math.ceil(n) || 0 : Math.floor(n);
};

var prettyUnit$1 = function prettyUnit(u) {
  var special = {
    M: M,
    y: Y,
    w: W,
    d: D,
    D: DATE,
    h: H,
    m: MIN,
    s: S,
    ms: MS,
    Q: Q
  };
  return special[u] || String(u || '').toLowerCase().replace(/s$/, '');
};

var isUndefined = function isUndefined(s) {
  return s === undefined;
};

const U = {
  s: padStart,
  z: padZoneStr,
  m: monthDiff,
  a: absFloor,
  p: prettyUnit$1,
  u: isUndefined
};

var L = 'en'; // global locale

var Ls = {}; // global loaded locale

Ls[L] = en;
var IS_DAYJS = '$isDayjsObject'; // eslint-disable-next-line no-use-before-define

var isDayjs = function isDayjs(d) {
  return d instanceof Dayjs || !!(d && d[IS_DAYJS]);
};

var parseLocale = function parseLocale(preset, object, isLocal) {
  var l;
  if (!preset) return L;

  if (typeof preset === 'string') {
    var presetLower = preset.toLowerCase();

    if (Ls[presetLower]) {
      l = presetLower;
    }

    if (object) {
      Ls[presetLower] = object;
      l = presetLower;
    }

    var presetSplit = preset.split('-');

    if (!l && presetSplit.length > 1) {
      return parseLocale(presetSplit[0]);
    }
  } else {
    var name = preset.name;
    Ls[name] = preset;
    l = name;
  }

  if (!isLocal && l) L = l;
  return l || !isLocal && L;
};

var dayjs = function dayjs(date, c) {
  if (isDayjs(date)) {
    return date.clone();
  } // eslint-disable-next-line no-nested-ternary


  var cfg = typeof c === 'object' ? c : {};
  cfg.date = date;
  cfg.args = arguments; // eslint-disable-line prefer-rest-params

  return new Dayjs(cfg); // eslint-disable-line no-use-before-define
};

var wrapper$1 = function wrapper(date, instance) {
  return dayjs(date, {
    locale: instance.$L,
    utc: instance.$u,
    x: instance.$x,
    $offset: instance.$offset // todo: refactor; do not use this.$offset in you code

  });
};

var Utils = U; // for plugin use

Utils.l = parseLocale;
Utils.i = isDayjs;
Utils.w = wrapper$1;

var parseDate = function parseDate(cfg) {
  var date = cfg.date,
      utc = cfg.utc;
  if (date === null) return new Date(NaN); // null is invalid

  if (Utils.u(date)) return new Date(); // today

  if (date instanceof Date) return new Date(date);

  if (typeof date === 'string' && !/Z$/i.test(date)) {
    var d = date.match(REGEX_PARSE);

    if (d) {
      var m = d[2] - 1 || 0;
      var ms = (d[7] || '0').substring(0, 3);

      if (utc) {
        return new Date(Date.UTC(d[1], m, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms));
      }

      return new Date(d[1], m, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms);
    }
  }

  return new Date(date); // everything else
};

var Dayjs = /*#__PURE__*/function () {
  function Dayjs(cfg) {
    this.$L = parseLocale(cfg.locale, null, true);
    this.parse(cfg); // for plugin

    this.$x = this.$x || cfg.x || {};
    this[IS_DAYJS] = true;
  }

  var _proto = Dayjs.prototype;

  _proto.parse = function parse(cfg) {
    this.$d = parseDate(cfg);
    this.init();
  };

  _proto.init = function init() {
    var $d = this.$d;
    this.$y = $d.getFullYear();
    this.$M = $d.getMonth();
    this.$D = $d.getDate();
    this.$W = $d.getDay();
    this.$H = $d.getHours();
    this.$m = $d.getMinutes();
    this.$s = $d.getSeconds();
    this.$ms = $d.getMilliseconds();
  } // eslint-disable-next-line class-methods-use-this
  ;

  _proto.$utils = function $utils() {
    return Utils;
  };

  _proto.isValid = function isValid() {
    return !(this.$d.toString() === INVALID_DATE_STRING);
  };

  _proto.isSame = function isSame(that, units) {
    var other = dayjs(that);
    return this.startOf(units) <= other && other <= this.endOf(units);
  };

  _proto.isAfter = function isAfter(that, units) {
    return dayjs(that) < this.startOf(units);
  };

  _proto.isBefore = function isBefore(that, units) {
    return this.endOf(units) < dayjs(that);
  };

  _proto.$g = function $g(input, get, set) {
    if (Utils.u(input)) return this[get];
    return this.set(set, input);
  };

  _proto.unix = function unix() {
    return Math.floor(this.valueOf() / 1000);
  };

  _proto.valueOf = function valueOf() {
    // timezone(hour) * 60 * 60 * 1000 => ms
    return this.$d.getTime();
  };

  _proto.startOf = function startOf(units, _startOf) {
    var _this = this;

    // startOf -> endOf
    var isStartOf = !Utils.u(_startOf) ? _startOf : true;
    var unit = Utils.p(units);

    var instanceFactory = function instanceFactory(d, m) {
      var ins = Utils.w(_this.$u ? Date.UTC(_this.$y, m, d) : new Date(_this.$y, m, d), _this);
      return isStartOf ? ins : ins.endOf(D);
    };

    var instanceFactorySet = function instanceFactorySet(method, slice) {
      var argumentStart = [0, 0, 0, 0];
      var argumentEnd = [23, 59, 59, 999];
      return Utils.w(_this.toDate()[method].apply( // eslint-disable-line prefer-spread
      _this.toDate('s'), (isStartOf ? argumentStart : argumentEnd).slice(slice)), _this);
    };

    var $W = this.$W,
        $M = this.$M,
        $D = this.$D;
    var utcPad = "set" + (this.$u ? 'UTC' : '');

    switch (unit) {
      case Y:
        return isStartOf ? instanceFactory(1, 0) : instanceFactory(31, 11);

      case M:
        return isStartOf ? instanceFactory(1, $M) : instanceFactory(0, $M + 1);

      case W:
        {
          var weekStart = this.$locale().weekStart || 0;
          var gap = ($W < weekStart ? $W + 7 : $W) - weekStart;
          return instanceFactory(isStartOf ? $D - gap : $D + (6 - gap), $M);
        }

      case D:
      case DATE:
        return instanceFactorySet(utcPad + "Hours", 0);

      case H:
        return instanceFactorySet(utcPad + "Minutes", 1);

      case MIN:
        return instanceFactorySet(utcPad + "Seconds", 2);

      case S:
        return instanceFactorySet(utcPad + "Milliseconds", 3);

      default:
        return this.clone();
    }
  };

  _proto.endOf = function endOf(arg) {
    return this.startOf(arg, false);
  };

  _proto.$set = function $set(units, _int) {
    var _C$D$C$DATE$C$M$C$Y$C;

    // private set
    var unit = Utils.p(units);
    var utcPad = "set" + (this.$u ? 'UTC' : '');
    var name = (_C$D$C$DATE$C$M$C$Y$C = {}, _C$D$C$DATE$C$M$C$Y$C[D] = utcPad + "Date", _C$D$C$DATE$C$M$C$Y$C[DATE] = utcPad + "Date", _C$D$C$DATE$C$M$C$Y$C[M] = utcPad + "Month", _C$D$C$DATE$C$M$C$Y$C[Y] = utcPad + "FullYear", _C$D$C$DATE$C$M$C$Y$C[H] = utcPad + "Hours", _C$D$C$DATE$C$M$C$Y$C[MIN] = utcPad + "Minutes", _C$D$C$DATE$C$M$C$Y$C[S] = utcPad + "Seconds", _C$D$C$DATE$C$M$C$Y$C[MS] = utcPad + "Milliseconds", _C$D$C$DATE$C$M$C$Y$C)[unit];
    var arg = unit === D ? this.$D + (_int - this.$W) : _int;

    if (unit === M || unit === Y) {
      // clone is for badMutable plugin
      var date = this.clone().set(DATE, 1);
      date.$d[name](arg);
      date.init();
      this.$d = date.set(DATE, Math.min(this.$D, date.daysInMonth())).$d;
    } else if (name) this.$d[name](arg);

    this.init();
    return this;
  };

  _proto.set = function set(string, _int2) {
    return this.clone().$set(string, _int2);
  };

  _proto.get = function get(unit) {
    return this[Utils.p(unit)]();
  };

  _proto.add = function add(number, units) {
    var _this2 = this,
        _C$MIN$C$H$C$S$unit;

    number = Number(number); // eslint-disable-line no-param-reassign

    var unit = Utils.p(units);

    var instanceFactorySet = function instanceFactorySet(n) {
      var d = dayjs(_this2);
      return Utils.w(d.date(d.date() + Math.round(n * number)), _this2);
    };

    if (unit === M) {
      return this.set(M, this.$M + number);
    }

    if (unit === Y) {
      return this.set(Y, this.$y + number);
    }

    if (unit === D) {
      return instanceFactorySet(1);
    }

    if (unit === W) {
      return instanceFactorySet(7);
    }

    var step = (_C$MIN$C$H$C$S$unit = {}, _C$MIN$C$H$C$S$unit[MIN] = MILLISECONDS_A_MINUTE, _C$MIN$C$H$C$S$unit[H] = MILLISECONDS_A_HOUR, _C$MIN$C$H$C$S$unit[S] = MILLISECONDS_A_SECOND, _C$MIN$C$H$C$S$unit)[unit] || 1; // ms

    var nextTimeStamp = this.$d.getTime() + number * step;
    return Utils.w(nextTimeStamp, this);
  };

  _proto.subtract = function subtract(number, string) {
    return this.add(number * -1, string);
  };

  _proto.format = function format(formatStr) {
    var _this3 = this;

    var locale = this.$locale();
    if (!this.isValid()) return locale.invalidDate || INVALID_DATE_STRING;
    var str = formatStr || FORMAT_DEFAULT;
    var zoneStr = Utils.z(this);
    var $H = this.$H,
        $m = this.$m,
        $M = this.$M;
    var weekdays = locale.weekdays,
        months = locale.months,
        meridiem = locale.meridiem;

    var getShort = function getShort(arr, index, full, length) {
      return arr && (arr[index] || arr(_this3, str)) || full[index].slice(0, length);
    };

    var get$H = function get$H(num) {
      return Utils.s($H % 12 || 12, num, '0');
    };

    var meridiemFunc = meridiem || function (hour, minute, isLowercase) {
      var m = hour < 12 ? 'AM' : 'PM';
      return isLowercase ? m.toLowerCase() : m;
    };

    var matches = function matches(match) {
      switch (match) {
        case 'YY':
          return String(_this3.$y).slice(-2);

        case 'YYYY':
          return Utils.s(_this3.$y, 4, '0');

        case 'M':
          return $M + 1;

        case 'MM':
          return Utils.s($M + 1, 2, '0');

        case 'MMM':
          return getShort(locale.monthsShort, $M, months, 3);

        case 'MMMM':
          return getShort(months, $M);

        case 'D':
          return _this3.$D;

        case 'DD':
          return Utils.s(_this3.$D, 2, '0');

        case 'd':
          return String(_this3.$W);

        case 'dd':
          return getShort(locale.weekdaysMin, _this3.$W, weekdays, 2);

        case 'ddd':
          return getShort(locale.weekdaysShort, _this3.$W, weekdays, 3);

        case 'dddd':
          return weekdays[_this3.$W];

        case 'H':
          return String($H);

        case 'HH':
          return Utils.s($H, 2, '0');

        case 'h':
          return get$H(1);

        case 'hh':
          return get$H(2);

        case 'a':
          return meridiemFunc($H, $m, true);

        case 'A':
          return meridiemFunc($H, $m, false);

        case 'm':
          return String($m);

        case 'mm':
          return Utils.s($m, 2, '0');

        case 's':
          return String(_this3.$s);

        case 'ss':
          return Utils.s(_this3.$s, 2, '0');

        case 'SSS':
          return Utils.s(_this3.$ms, 3, '0');

        case 'Z':
          return zoneStr;
      }

      return null;
    };

    return str.replace(REGEX_FORMAT, function (match, $1) {
      return $1 || matches(match) || zoneStr.replace(':', '');
    }); // 'ZZ'
  };

  _proto.utcOffset = function utcOffset() {
    // Because a bug at FF24, we're rounding the timezone offset around 15 minutes
    // https://github.com/moment/moment/pull/1871
    return -Math.round(this.$d.getTimezoneOffset() / 15) * 15;
  };

  _proto.diff = function diff(input, units, _float) {
    var _this4 = this;

    var unit = Utils.p(units);
    var that = dayjs(input);
    var zoneDelta = (that.utcOffset() - this.utcOffset()) * MILLISECONDS_A_MINUTE;
    var diff = this - that;

    var getMonth = function getMonth() {
      return Utils.m(_this4, that);
    };

    var result;

    switch (unit) {
      case Y:
        result = getMonth() / 12;
        break;

      case M:
        result = getMonth();
        break;

      case Q:
        result = getMonth() / 3;
        break;

      case W:
        result = (diff - zoneDelta) / MILLISECONDS_A_WEEK;
        break;

      case D:
        result = (diff - zoneDelta) / MILLISECONDS_A_DAY;
        break;

      case H:
        result = diff / MILLISECONDS_A_HOUR;
        break;

      case MIN:
        result = diff / MILLISECONDS_A_MINUTE;
        break;

      case S:
        result = diff / MILLISECONDS_A_SECOND;
        break;

      default:
        result = diff; // milliseconds

        break;
    }

    return _float ? result : Utils.a(result);
  };

  _proto.daysInMonth = function daysInMonth() {
    return this.endOf(M).$D;
  };

  _proto.$locale = function $locale() {
    // get locale object
    return Ls[this.$L];
  };

  _proto.locale = function locale(preset, object) {
    if (!preset) return this.$L;
    var that = this.clone();
    var nextLocaleName = parseLocale(preset, object, true);
    if (nextLocaleName) that.$L = nextLocaleName;
    return that;
  };

  _proto.clone = function clone() {
    return Utils.w(this.$d, this);
  };

  _proto.toDate = function toDate() {
    return new Date(this.valueOf());
  };

  _proto.toJSON = function toJSON() {
    return this.isValid() ? this.toISOString() : null;
  };

  _proto.toISOString = function toISOString() {
    // ie 8 return
    // new Dayjs(this.valueOf() + this.$d.getTimezoneOffset() * 60000)
    // .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
    return this.$d.toISOString();
  };

  _proto.toString = function toString() {
    return this.$d.toUTCString();
  };

  return Dayjs;
}();

var proto = Dayjs.prototype;
dayjs.prototype = proto;
[['$ms', MS], ['$s', S], ['$m', MIN], ['$H', H], ['$W', D], ['$M', M], ['$y', Y], ['$D', DATE]].forEach(function (g) {
  proto[g[1]] = function (input) {
    return this.$g(input, g[0], g[1]);
  };
});

dayjs.extend = function (plugin, option) {
  if (!plugin.$i) {
    // install plugin only once
    plugin(option, Dayjs, dayjs);
    plugin.$i = true;
  }

  return dayjs;
};

dayjs.locale = parseLocale;
dayjs.isDayjs = isDayjs;

dayjs.unix = function (timestamp) {
  return dayjs(timestamp * 1e3);
};

dayjs.en = Ls[L];
dayjs.Ls = Ls;
dayjs.p = {};

var REGEX_VALID_OFFSET_FORMAT = /[+-]\d\d(?::?\d\d)?/g;
var REGEX_OFFSET_HOURS_MINUTES_FORMAT = /([+-]|\d\d)/g;

function offsetFromString$1(value) {
  if (value === void 0) {
    value = '';
  }

  var offset = value.match(REGEX_VALID_OFFSET_FORMAT);

  if (!offset) {
    return null;
  }

  var _ref = ("" + offset[0]).match(REGEX_OFFSET_HOURS_MINUTES_FORMAT) || ['-', 0, 0],
      indicator = _ref[0],
      hoursOffset = _ref[1],
      minutesOffset = _ref[2];

  var totalOffsetInMinutes = +hoursOffset * 60 + +minutesOffset;

  if (totalOffsetInMinutes === 0) {
    return 0;
  }

  return indicator === '+' ? totalOffsetInMinutes : -totalOffsetInMinutes;
}

const utcPlugin = (function (option, Dayjs, dayjs) {
  var proto = Dayjs.prototype;

  dayjs.utc = function (date) {
    var cfg = {
      date: date,
      utc: true,
      args: arguments
    }; // eslint-disable-line prefer-rest-params

    return new Dayjs(cfg); // eslint-disable-line no-use-before-define
  };

  proto.utc = function (keepLocalTime) {
    var ins = dayjs(this.toDate(), {
      locale: this.$L,
      utc: true
    });

    if (keepLocalTime) {
      return ins.add(this.utcOffset(), MIN);
    }

    return ins;
  };

  proto.local = function () {
    return dayjs(this.toDate(), {
      locale: this.$L,
      utc: false
    });
  };

  var oldParse = proto.parse;

  proto.parse = function (cfg) {
    if (cfg.utc) {
      this.$u = true;
    }

    if (!this.$utils().u(cfg.$offset)) {
      this.$offset = cfg.$offset;
    }

    oldParse.call(this, cfg);
  };

  var oldInit = proto.init;

  proto.init = function () {
    if (this.$u) {
      var $d = this.$d;
      this.$y = $d.getUTCFullYear();
      this.$M = $d.getUTCMonth();
      this.$D = $d.getUTCDate();
      this.$W = $d.getUTCDay();
      this.$H = $d.getUTCHours();
      this.$m = $d.getUTCMinutes();
      this.$s = $d.getUTCSeconds();
      this.$ms = $d.getUTCMilliseconds();
    } else {
      oldInit.call(this);
    }
  };

  var oldUtcOffset = proto.utcOffset;

  proto.utcOffset = function (input, keepLocalTime) {
    var _this$$utils = this.$utils(),
        u = _this$$utils.u;

    if (u(input)) {
      if (this.$u) {
        return 0;
      }

      if (!u(this.$offset)) {
        return this.$offset;
      }

      return oldUtcOffset.call(this);
    }

    if (typeof input === 'string') {
      input = offsetFromString$1(input);

      if (input === null) {
        return this;
      }
    }

    var offset = Math.abs(input) <= 16 ? input * 60 : input;
    var ins = this;

    if (keepLocalTime) {
      ins.$offset = offset;
      ins.$u = input === 0;
      return ins;
    }

    if (input !== 0) {
      var localTimezoneOffset = this.$u ? this.toDate().getTimezoneOffset() : -1 * this.utcOffset();
      ins = this.local().add(offset + localTimezoneOffset, MIN);
      ins.$offset = offset;
      ins.$x.$localOffset = localTimezoneOffset;
    } else {
      ins = this.utc();
    }

    return ins;
  };

  var oldFormat = proto.format;
  var UTC_FORMAT_DEFAULT = 'YYYY-MM-DDTHH:mm:ss[Z]';

  proto.format = function (formatStr) {
    var str = formatStr || (this.$u ? UTC_FORMAT_DEFAULT : '');
    return oldFormat.call(this, str);
  };

  proto.valueOf = function () {
    var addedOffset = !this.$utils().u(this.$offset) ? this.$offset + (this.$x.$localOffset || this.$d.getTimezoneOffset()) : 0;
    return this.$d.valueOf() - addedOffset * MILLISECONDS_A_MINUTE;
  };

  proto.isUTC = function () {
    return !!this.$u;
  };

  proto.toISOString = function () {
    return this.toDate().toISOString();
  };

  proto.toString = function () {
    return this.toDate().toUTCString();
  };

  var oldToDate = proto.toDate;

  proto.toDate = function (type) {
    if (type === 's' && this.$offset) {
      return dayjs(this.format('YYYY-MM-DD HH:mm:ss:SSS')).toDate();
    }

    return oldToDate.call(this);
  };

  var oldDiff = proto.diff;

  proto.diff = function (input, units, _float) {
    if (input && this.$u === input.$u) {
      return oldDiff.call(this, input, units, _float);
    }

    var localThis = this.local();
    var localInput = dayjs(input).local();
    return oldDiff.call(localThis, localInput, units, _float);
  };
});

var typeToPos = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5
}; // Cache time-zone lookups from Intl.DateTimeFormat,
// as it is a *very* slow method.

var dtfCache = {};

var getDateTimeFormat = function getDateTimeFormat(timezone, options) {
  if (options === void 0) {
    options = {};
  }

  var timeZoneName = options.timeZoneName || 'short';
  var key = timezone + "|" + timeZoneName;
  var dtf = dtfCache[key];

  if (!dtf) {
    dtf = new Intl.DateTimeFormat('en-US', {
      hour12: false,
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: timeZoneName
    });
    dtfCache[key] = dtf;
  }

  return dtf;
};

const timezonePlugin = (function (o, c, d) {
  var defaultTimezone;

  var makeFormatParts = function makeFormatParts(timestamp, timezone, options) {
    if (options === void 0) {
      options = {};
    }

    var date = new Date(timestamp);
    var dtf = getDateTimeFormat(timezone, options);
    return dtf.formatToParts(date);
  };

  var tzOffset = function tzOffset(timestamp, timezone) {
    var formatResult = makeFormatParts(timestamp, timezone);
    var filled = [];

    for (var i = 0; i < formatResult.length; i += 1) {
      var _formatResult$i = formatResult[i],
          type = _formatResult$i.type,
          value = _formatResult$i.value;
      var pos = typeToPos[type];

      if (pos >= 0) {
        filled[pos] = parseInt(value, 10);
      }
    }

    var hour = filled[3]; // Workaround for the same behavior in different node version
    // https://github.com/nodejs/node/issues/33027

    /* istanbul ignore next */

    var fixedHour = hour === 24 ? 0 : hour;
    var utcString = filled[0] + "-" + filled[1] + "-" + filled[2] + " " + fixedHour + ":" + filled[4] + ":" + filled[5] + ":000";
    var utcTs = d.utc(utcString).valueOf();
    var asTS = +timestamp;
    var over = asTS % 1000;
    asTS -= over;
    return (utcTs - asTS) / (60 * 1000);
  }; // find the right offset a given local time. The o input is our guess, which determines which
  // offset we'll pick in ambiguous cases (e.g. there are two 3 AMs b/c Fallback DST)
  // https://github.com/moment/luxon/blob/master/src/datetime.js#L76


  var fixOffset = function fixOffset(localTS, o0, tz) {
    // Our UTC time is just a guess because our offset is just a guess
    var utcGuess = localTS - o0 * 60 * 1000; // Test whether the zone matches the offset for this ts

    var o2 = tzOffset(utcGuess, tz); // If so, offset didn't change and we're done

    if (o0 === o2) {
      return [utcGuess, o0];
    } // If not, change the ts by the difference in the offset


    utcGuess -= (o2 - o0) * 60 * 1000; // If that gives us the local time we want, we're done

    var o3 = tzOffset(utcGuess, tz);

    if (o2 === o3) {
      return [utcGuess, o2];
    } // If it's different, we're in a hole time.
    // The offset has changed, but the we don't adjust the time


    return [localTS - Math.min(o2, o3) * 60 * 1000, Math.max(o2, o3)];
  };

  var proto = c.prototype;

  proto.tz = function (timezone, keepLocalTime) {
    if (timezone === void 0) {
      timezone = defaultTimezone;
    }

    var oldOffset = this.utcOffset();
    var date = this.toDate();
    var target = date.toLocaleString('en-US', {
      timeZone: timezone
    });
    var diff = Math.round((date - new Date(target)) / 1000 / 60);
    var offset = -Math.round(date.getTimezoneOffset() / 15) * 15 - diff;
    var isUTC = !Number(offset);
    var ins;

    if (isUTC) {
      // if utcOffset is 0, turn it to UTC mode
      ins = this.utcOffset(0, keepLocalTime);
    } else {
      ins = d(target, {
        locale: this.$L
      }).$set(MS, this.$ms).utcOffset(offset, true);

      if (keepLocalTime) {
        var newOffset = ins.utcOffset();
        ins = ins.add(oldOffset - newOffset, MIN);
      }
    }

    ins.$x.$timezone = timezone;
    return ins;
  };

  proto.offsetName = function (type) {
    // type: short(default) / long
    var zone = this.$x.$timezone || d.tz.guess();
    var result = makeFormatParts(this.valueOf(), zone, {
      timeZoneName: type
    }).find(function (m) {
      return m.type.toLowerCase() === 'timezonename';
    });
    return result && result.value;
  };

  var oldStartOf = proto.startOf;

  proto.startOf = function (units, startOf) {
    if (!this.$x || !this.$x.$timezone) {
      return oldStartOf.call(this, units, startOf);
    }

    var withoutTz = d(this.format('YYYY-MM-DD HH:mm:ss:SSS'), {
      locale: this.$L
    });
    var startOfWithoutTz = oldStartOf.call(withoutTz, units, startOf);
    return startOfWithoutTz.tz(this.$x.$timezone, true);
  };

  d.tz = function (input, arg1, arg2) {
    var parseFormat = arg2 && arg1;
    var timezone = arg2 || arg1 || defaultTimezone;
    var previousOffset = tzOffset(+d(), timezone);

    if (typeof input !== 'string') {
      // timestamp number || js Date || Day.js
      return d(input).tz(timezone);
    }

    var localTs = d.utc(input, parseFormat).valueOf();

    var _fixOffset = fixOffset(localTs, previousOffset, timezone),
        targetTs = _fixOffset[0],
        targetOffset = _fixOffset[1];

    var ins = d(targetTs).utcOffset(targetOffset);
    ins.$x.$timezone = timezone;
    return ins;
  };

  d.tz.guess = function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  d.tz.setDefault = function (timezone) {
    defaultTimezone = timezone;
  };
});

// eslint-disable-next-line import/prefer-default-export
var t = function t(format) {
  return format.replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g, function (_, a, b) {
    return a || b.slice(1);
  });
};
var englishFormats = {
  LTS: 'h:mm:ss A',
  LT: 'h:mm A',
  L: 'MM/DD/YYYY',
  LL: 'MMMM D, YYYY',
  LLL: 'MMMM D, YYYY h:mm A',
  LLLL: 'dddd, MMMM D, YYYY h:mm A'
};
var u = function u(formatStr, formats) {
  return formatStr.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g, function (_, a, b) {
    var B = b && b.toUpperCase();
    return a || formats[b] || englishFormats[b] || t(formats[B]);
  });
};

var formattingTokens = /(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g;
var match1 = /\d/; // 0 - 9

var match2 = /\d\d/; // 00 - 99

var match3 = /\d{3}/; // 000 - 999

var match4 = /\d{4}/; // 0000 - 9999

var match1to2 = /\d\d?/; // 0 - 99

var matchSigned = /[+-]?\d+/; // -inf - inf

var matchOffset = /[+-]\d\d:?(\d\d)?|Z/; // +00:00 -00:00 +0000 or -0000 +00 or Z

var matchWord = /\d*[^-_:/,()\s\d]+/; // Word

var locale = {};

var parseTwoDigitYear = function parseTwoDigitYear(input) {
  input = +input;
  return input + (input > 68 ? 1900 : 2000);
};

function offsetFromString(string) {
  if (!string) return 0;
  if (string === 'Z') return 0;
  var parts = string.match(/([+-]|\d\d)/g);
  var minutes = +(parts[1] * 60) + (+parts[2] || 0);
  return minutes === 0 ? 0 : parts[0] === '+' ? -minutes : minutes; // eslint-disable-line no-nested-ternary
}

var addInput = function addInput(property) {
  return function (input) {
    this[property] = +input;
  };
};

var zoneExpressions = [matchOffset, function (input) {
  var zone = this.zone || (this.zone = {});
  zone.offset = offsetFromString(input);
}];

var getLocalePart = function getLocalePart(name) {
  var part = locale[name];
  return part && (part.indexOf ? part : part.s.concat(part.f));
};

var meridiemMatch = function meridiemMatch(input, isLowerCase) {
  var isAfternoon;
  var _locale = locale,
      meridiem = _locale.meridiem;

  if (!meridiem) {
    isAfternoon = input === (isLowerCase ? 'pm' : 'PM');
  } else {
    for (var i = 1; i <= 24; i += 1) {
      // todo: fix input === meridiem(i, 0, isLowerCase)
      if (input.indexOf(meridiem(i, 0, isLowerCase)) > -1) {
        isAfternoon = i > 12;
        break;
      }
    }
  }

  return isAfternoon;
};

var expressions = {
  A: [matchWord, function (input) {
    this.afternoon = meridiemMatch(input, false);
  }],
  a: [matchWord, function (input) {
    this.afternoon = meridiemMatch(input, true);
  }],
  Q: [match1, function (input) {
    this.month = (input - 1) * 3 + 1;
  }],
  S: [match1, function (input) {
    this.milliseconds = +input * 100;
  }],
  SS: [match2, function (input) {
    this.milliseconds = +input * 10;
  }],
  SSS: [match3, function (input) {
    this.milliseconds = +input;
  }],
  s: [match1to2, addInput('seconds')],
  ss: [match1to2, addInput('seconds')],
  m: [match1to2, addInput('minutes')],
  mm: [match1to2, addInput('minutes')],
  H: [match1to2, addInput('hours')],
  h: [match1to2, addInput('hours')],
  HH: [match1to2, addInput('hours')],
  hh: [match1to2, addInput('hours')],
  D: [match1to2, addInput('day')],
  DD: [match2, addInput('day')],
  Do: [matchWord, function (input) {
    var _locale2 = locale,
        ordinal = _locale2.ordinal;

    var _input$match = input.match(/\d+/);

    this.day = _input$match[0];
    if (!ordinal) return;

    for (var i = 1; i <= 31; i += 1) {
      if (ordinal(i).replace(/\[|\]/g, '') === input) {
        this.day = i;
      }
    }
  }],
  w: [match1to2, addInput('week')],
  ww: [match2, addInput('week')],
  M: [match1to2, addInput('month')],
  MM: [match2, addInput('month')],
  MMM: [matchWord, function (input) {
    var months = getLocalePart('months');
    var monthsShort = getLocalePart('monthsShort');
    var matchIndex = (monthsShort || months.map(function (_) {
      return _.slice(0, 3);
    })).indexOf(input) + 1;

    if (matchIndex < 1) {
      throw new Error();
    }

    this.month = matchIndex % 12 || matchIndex;
  }],
  MMMM: [matchWord, function (input) {
    var months = getLocalePart('months');
    var matchIndex = months.indexOf(input) + 1;

    if (matchIndex < 1) {
      throw new Error();
    }

    this.month = matchIndex % 12 || matchIndex;
  }],
  Y: [matchSigned, addInput('year')],
  YY: [match2, function (input) {
    this.year = parseTwoDigitYear(input);
  }],
  YYYY: [match4, addInput('year')],
  Z: zoneExpressions,
  ZZ: zoneExpressions
};

function correctHours(time) {
  var afternoon = time.afternoon;

  if (afternoon !== undefined) {
    var hours = time.hours;

    if (afternoon) {
      if (hours < 12) {
        time.hours += 12;
      }
    } else if (hours === 12) {
      time.hours = 0;
    }

    delete time.afternoon;
  }
}

function makeParser(format) {
  format = u(format, locale && locale.formats);
  var array = format.match(formattingTokens);
  var length = array.length;

  for (var i = 0; i < length; i += 1) {
    var token = array[i];
    var parseTo = expressions[token];
    var regex = parseTo && parseTo[0];
    var parser = parseTo && parseTo[1];

    if (parser) {
      array[i] = {
        regex: regex,
        parser: parser
      };
    } else {
      array[i] = token.replace(/^\[|\]$/g, '');
    }
  }

  return function (input) {
    var time = {};

    for (var _i = 0, start = 0; _i < length; _i += 1) {
      var _token = array[_i];

      if (typeof _token === 'string') {
        start += _token.length;
      } else {
        var _regex = _token.regex,
            _parser = _token.parser;
        var part = input.slice(start);

        var match = _regex.exec(part);

        var value = match[0];

        _parser.call(time, value);

        input = input.replace(value, '');
      }
    }

    correctHours(time);
    return time;
  };
}

var parseFormattedInput = function parseFormattedInput(input, format, utc, dayjs) {
  try {
    if (['x', 'X'].indexOf(format) > -1) return new Date((format === 'X' ? 1000 : 1) * input);
    var parser = makeParser(format);

    var _parser2 = parser(input),
        year = _parser2.year,
        month = _parser2.month,
        day = _parser2.day,
        hours = _parser2.hours,
        minutes = _parser2.minutes,
        seconds = _parser2.seconds,
        milliseconds = _parser2.milliseconds,
        zone = _parser2.zone,
        week = _parser2.week;

    var now = new Date();
    var d = day || (!year && !month ? now.getDate() : 1);
    var y = year || now.getFullYear();
    var M = 0;

    if (!(year && !month)) {
      M = month > 0 ? month - 1 : now.getMonth();
    }

    var h = hours || 0;
    var m = minutes || 0;
    var s = seconds || 0;
    var ms = milliseconds || 0;

    if (zone) {
      return new Date(Date.UTC(y, M, d, h, m, s, ms + zone.offset * 60 * 1000));
    }

    if (utc) {
      return new Date(Date.UTC(y, M, d, h, m, s, ms));
    }

    var newDate;
    newDate = new Date(y, M, d, h, m, s, ms);

    if (week) {
      newDate = dayjs(newDate).week(week).toDate();
    }

    return newDate;
  } catch (e) {
    return new Date(''); // Invalid Date
  }
};

const customParseFormat = (function (o, C, d) {
  d.p.customParseFormat = true;

  if (o && o.parseTwoDigitYear) {
    parseTwoDigitYear = o.parseTwoDigitYear;
  }

  var proto = C.prototype;
  var oldParse = proto.parse;

  proto.parse = function (cfg) {
    var date = cfg.date,
        utc = cfg.utc,
        args = cfg.args;
    this.$u = utc;
    var format = args[1];

    if (typeof format === 'string') {
      var isStrictWithoutLocale = args[2] === true;
      var isStrictWithLocale = args[3] === true;
      var isStrict = isStrictWithoutLocale || isStrictWithLocale;
      var pl = args[2];

      if (isStrictWithLocale) {
        pl = args[2];
      }

      locale = this.$locale();

      if (!isStrictWithoutLocale && pl) {
        locale = d.Ls[pl];
      }

      this.$d = parseFormattedInput(date, format, utc, d);
      this.init();
      if (pl && pl !== true) this.$L = this.locale(pl).$L; // use != to treat
      // input number 1410715640579 and format string '1410715640579' equal
      // eslint-disable-next-line eqeqeq

      if (isStrict && date != this.format(format)) {
        this.$d = new Date('');
      } // reset global locale to make parallel unit test


      locale = {};
    } else if (format instanceof Array) {
      var len = format.length;

      for (var i = 1; i <= len; i += 1) {
        args[1] = format[i - 1];
        var result = d.apply(this, args);

        if (result.isValid()) {
          this.$d = result.$d;
          this.$L = result.$L;
          this.init();
          break;
        }

        if (i === len) this.$d = new Date('');
      }
    } else {
      oldParse.call(this, cfg);
    }
  };
});

var MILLISECONDS_A_YEAR = MILLISECONDS_A_DAY * 365;
var MILLISECONDS_A_MONTH = MILLISECONDS_A_DAY * 30;
var durationRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
var unitToMS = {
  years: MILLISECONDS_A_YEAR,
  months: MILLISECONDS_A_MONTH,
  days: MILLISECONDS_A_DAY,
  hours: MILLISECONDS_A_HOUR,
  minutes: MILLISECONDS_A_MINUTE,
  seconds: MILLISECONDS_A_SECOND,
  milliseconds: 1,
  weeks: MILLISECONDS_A_WEEK
};

var isDuration = function isDuration(d) {
  return d instanceof Duration;
}; // eslint-disable-line no-use-before-define


var $d;
var $u;

var wrapper = function wrapper(input, instance, unit) {
  return new Duration(input, unit, instance.$l);
}; // eslint-disable-line no-use-before-define


var prettyUnit = function prettyUnit(unit) {
  return $u.p(unit) + "s";
};

var isNegative = function isNegative(number) {
  return number < 0;
};

var roundNumber = function roundNumber(number) {
  return isNegative(number) ? Math.ceil(number) : Math.floor(number);
};

var absolute = function absolute(number) {
  return Math.abs(number);
};

var getNumberUnitFormat = function getNumberUnitFormat(number, unit) {
  if (!number) {
    return {
      negative: false,
      format: ''
    };
  }

  if (isNegative(number)) {
    return {
      negative: true,
      format: "" + absolute(number) + unit
    };
  }

  return {
    negative: false,
    format: "" + number + unit
  };
};

var Duration = /*#__PURE__*/function () {
  function Duration(input, unit, locale) {
    var _this = this;

    this.$d = {};
    this.$l = locale;

    if (input === undefined) {
      this.$ms = 0;
      this.parseFromMilliseconds();
    }

    if (unit) {
      return wrapper(input * unitToMS[prettyUnit(unit)], this);
    }

    if (typeof input === 'number') {
      this.$ms = input;
      this.parseFromMilliseconds();
      return this;
    }

    if (typeof input === 'object') {
      Object.keys(input).forEach(function (k) {
        _this.$d[prettyUnit(k)] = input[k];
      });
      this.calMilliseconds();
      return this;
    }

    if (typeof input === 'string') {
      var d = input.match(durationRegex);

      if (d) {
        var properties = d.slice(2);
        var numberD = properties.map(function (value) {
          return value != null ? Number(value) : 0;
        });
        this.$d.years = numberD[0];
        this.$d.months = numberD[1];
        this.$d.weeks = numberD[2];
        this.$d.days = numberD[3];
        this.$d.hours = numberD[4];
        this.$d.minutes = numberD[5];
        this.$d.seconds = numberD[6];
        this.calMilliseconds();
        return this;
      }
    }

    return this;
  }

  var _proto = Duration.prototype;

  _proto.calMilliseconds = function calMilliseconds() {
    var _this2 = this;

    this.$ms = Object.keys(this.$d).reduce(function (total, unit) {
      return total + (_this2.$d[unit] || 0) * unitToMS[unit];
    }, 0);
  };

  _proto.parseFromMilliseconds = function parseFromMilliseconds() {
    var $ms = this.$ms;
    this.$d.years = roundNumber($ms / MILLISECONDS_A_YEAR);
    $ms %= MILLISECONDS_A_YEAR;
    this.$d.months = roundNumber($ms / MILLISECONDS_A_MONTH);
    $ms %= MILLISECONDS_A_MONTH;
    this.$d.days = roundNumber($ms / MILLISECONDS_A_DAY);
    $ms %= MILLISECONDS_A_DAY;
    this.$d.hours = roundNumber($ms / MILLISECONDS_A_HOUR);
    $ms %= MILLISECONDS_A_HOUR;
    this.$d.minutes = roundNumber($ms / MILLISECONDS_A_MINUTE);
    $ms %= MILLISECONDS_A_MINUTE;
    this.$d.seconds = roundNumber($ms / MILLISECONDS_A_SECOND);
    $ms %= MILLISECONDS_A_SECOND;
    this.$d.milliseconds = $ms;
  };

  _proto.toISOString = function toISOString() {
    var Y = getNumberUnitFormat(this.$d.years, 'Y');
    var M = getNumberUnitFormat(this.$d.months, 'M');
    var days = +this.$d.days || 0;

    if (this.$d.weeks) {
      days += this.$d.weeks * 7;
    }

    var D = getNumberUnitFormat(days, 'D');
    var H = getNumberUnitFormat(this.$d.hours, 'H');
    var m = getNumberUnitFormat(this.$d.minutes, 'M');
    var seconds = this.$d.seconds || 0;

    if (this.$d.milliseconds) {
      seconds += this.$d.milliseconds / 1000;
    }

    var S = getNumberUnitFormat(seconds, 'S');
    var negativeMode = Y.negative || M.negative || D.negative || H.negative || m.negative || S.negative;
    var T = H.format || m.format || S.format ? 'T' : '';
    var P = negativeMode ? '-' : '';
    var result = P + "P" + Y.format + M.format + D.format + T + H.format + m.format + S.format;
    return result === 'P' || result === '-P' ? 'P0D' : result;
  };

  _proto.toJSON = function toJSON() {
    return this.toISOString();
  };

  _proto.format = function format(formatStr) {
    var str = formatStr || 'YYYY-MM-DDTHH:mm:ss';
    var matches = {
      Y: this.$d.years,
      YY: $u.s(this.$d.years, 2, '0'),
      YYYY: $u.s(this.$d.years, 4, '0'),
      M: this.$d.months,
      MM: $u.s(this.$d.months, 2, '0'),
      D: this.$d.days,
      DD: $u.s(this.$d.days, 2, '0'),
      H: this.$d.hours,
      HH: $u.s(this.$d.hours, 2, '0'),
      m: this.$d.minutes,
      mm: $u.s(this.$d.minutes, 2, '0'),
      s: this.$d.seconds,
      ss: $u.s(this.$d.seconds, 2, '0'),
      SSS: $u.s(this.$d.milliseconds, 3, '0')
    };
    return str.replace(REGEX_FORMAT, function (match, $1) {
      return $1 || String(matches[match]);
    });
  };

  _proto.as = function as(unit) {
    return this.$ms / unitToMS[prettyUnit(unit)];
  };

  _proto.get = function get(unit) {
    var base = this.$ms;
    var pUnit = prettyUnit(unit);

    if (pUnit === 'milliseconds') {
      base %= 1000;
    } else if (pUnit === 'weeks') {
      base = roundNumber(base / unitToMS[pUnit]);
    } else {
      base = this.$d[pUnit];
    }

    return base === 0 ? 0 : base; // a === 0 will be true on both 0 and -0
  };

  _proto.add = function add(input, unit, isSubtract) {
    var another;

    if (unit) {
      another = input * unitToMS[prettyUnit(unit)];
    } else if (isDuration(input)) {
      another = input.$ms;
    } else {
      another = wrapper(input, this).$ms;
    }

    return wrapper(this.$ms + another * (isSubtract ? -1 : 1), this);
  };

  _proto.subtract = function subtract(input, unit) {
    return this.add(input, unit, true);
  };

  _proto.locale = function locale(l) {
    var that = this.clone();
    that.$l = l;
    return that;
  };

  _proto.clone = function clone() {
    return wrapper(this.$ms, this);
  };

  _proto.humanize = function humanize(withSuffix) {
    return $d().add(this.$ms, 'ms').locale(this.$l).fromNow(!withSuffix);
  };

  _proto.valueOf = function valueOf() {
    return this.asMilliseconds();
  };

  _proto.milliseconds = function milliseconds() {
    return this.get('milliseconds');
  };

  _proto.asMilliseconds = function asMilliseconds() {
    return this.as('milliseconds');
  };

  _proto.seconds = function seconds() {
    return this.get('seconds');
  };

  _proto.asSeconds = function asSeconds() {
    return this.as('seconds');
  };

  _proto.minutes = function minutes() {
    return this.get('minutes');
  };

  _proto.asMinutes = function asMinutes() {
    return this.as('minutes');
  };

  _proto.hours = function hours() {
    return this.get('hours');
  };

  _proto.asHours = function asHours() {
    return this.as('hours');
  };

  _proto.days = function days() {
    return this.get('days');
  };

  _proto.asDays = function asDays() {
    return this.as('days');
  };

  _proto.weeks = function weeks() {
    return this.get('weeks');
  };

  _proto.asWeeks = function asWeeks() {
    return this.as('weeks');
  };

  _proto.months = function months() {
    return this.get('months');
  };

  _proto.asMonths = function asMonths() {
    return this.as('months');
  };

  _proto.years = function years() {
    return this.get('years');
  };

  _proto.asYears = function asYears() {
    return this.as('years');
  };

  return Duration;
}();

const duration = (function (option, Dayjs, dayjs) {
  $d = dayjs;
  $u = dayjs().$utils();

  dayjs.duration = function (input, unit) {
    var $l = dayjs.locale();
    return wrapper(input, {
      $l: $l
    }, unit);
  };

  dayjs.isDuration = isDuration;
  var oldAdd = Dayjs.prototype.add;
  var oldSubtract = Dayjs.prototype.subtract;

  Dayjs.prototype.add = function (value, unit) {
    if (isDuration(value)) value = value.asMilliseconds();
    return oldAdd.bind(this)(value, unit);
  };

  Dayjs.prototype.subtract = function (value, unit) {
    if (isDuration(value)) value = value.asMilliseconds();
    return oldSubtract.bind(this)(value, unit);
  };
});

const isSameOrBefore = (function (o, c) {
  c.prototype.isSameOrBefore = function (that, units) {
    return this.isSame(that, units) || this.isBefore(that, units);
  };
});

const weekday = (function (o, c) {
  var proto = c.prototype;

  proto.weekday = function (input) {
    var weekStart = this.$locale().weekStart || 0;
    var $W = this.$W;
    var weekday = ($W < weekStart ? $W + 7 : $W) - weekStart;

    if (this.$utils().u(input)) {
      return weekday;
    }

    return this.subtract(weekday, 'day').add(input, 'day');
  };
});

dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);
dayjs.extend(customParseFormat);
dayjs.extend(duration);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);
function tranformToUTC(date, format, timezone = "Asia/Shanghai") {
  return dayjs.tz(date, timezone).valueOf();
}
function words() {
  return [
    {
      startAt: dayjs(),
      regExp: /^(?:今[天日]|to?day?)(.*)/
    },
    {
      startAt: dayjs().subtract(1, "days"),
      regExp: /^(?:昨[天日]|y(?:ester)?day?)(.*)/
    },
    {
      startAt: dayjs().subtract(2, "days"),
      regExp: /^(?:前天|(?:the)?d(?:ay)?b(?:eforeyesterda)?y)(.*)/
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(1)) ? dayjs().weekday(1).subtract(1, "week") : dayjs().weekday(1),
      regExp: /^(?:周|星期)一(.*)/
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(2)) ? dayjs().weekday(2).subtract(1, "week") : dayjs().weekday(2),
      regExp: /^(?:周|星期)二(.*)/
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(3)) ? dayjs().weekday(3).subtract(1, "week") : dayjs().weekday(3),
      regExp: /^(?:周|星期)三(.*)/
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(4)) ? dayjs().weekday(4).subtract(1, "week") : dayjs().weekday(4),
      regExp: /^(?:周|星期)四(.*)/
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(5)) ? dayjs().weekday(5).subtract(1, "week") : dayjs().weekday(5),
      regExp: /^(?:周|星期)五(.*)/
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(6)) ? dayjs().weekday(6).subtract(1, "week") : dayjs().weekday(6),
      regExp: /^(?:周|星期)六(.*)/
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(7)) ? dayjs().weekday(7).subtract(1, "week") : dayjs().weekday(7),
      regExp: /^(?:周|星期)[天日](.*)/
    },
    {
      startAt: dayjs().add(1, "days"),
      regExp: /^(?:明[天日]|y(?:ester)?day?)(.*)/
    },
    {
      startAt: dayjs().add(2, "days"),
      regExp: /^(?:[后後][天日]|(?:the)?d(?:ay)?a(?:fter)?t(?:omrrow)?)(.*)/
    }
  ];
}
const patterns = [
  {
    unit: "years",
    regExp: /(\d+)(?:年|y(?:ea)?rs?)/
  },
  {
    unit: "months",
    regExp: /(\d+)(?:[个個]?月|months?)/
  },
  {
    unit: "weeks",
    regExp: /(\d+)(?:周|[个個]?星期|weeks?)/
  },
  {
    unit: "days",
    regExp: /(\d+)(?:天|日|d(?:ay)?s?)/
  },
  {
    unit: "hours",
    regExp: /(\d+)(?:[个個]?(?:小?时|[時点點])|h(?:(?:ou)?r)?s?)/
  },
  {
    unit: "minutes",
    regExp: /(\d+)(?:分[鐘钟]?|m(?:in(?:ute)?)?s?)/
  },
  {
    unit: "seconds",
    regExp: /(\d+)(?:秒[鐘钟]?|s(?:ec(?:ond)?)?s?)/
  }
];
const patternSize = Object.keys(patterns).length;
function toDate(date) {
  return date.toLowerCase().replace(/(^an?\s)|(\san?\s)/g, "1").replace(/几|幾/g, "3").replace(/[\s,]/g, "");
}
function toDurations(matches) {
  const durations = {};
  let p = 0;
  for (const m of matches) {
    for (; p <= patternSize; p++) {
      const match = patterns[p].regExp.exec(m);
      if (match) {
        durations[patterns[p].unit] = match[1];
        break;
      }
    }
  }
  return durations;
}
function parseRelativeDate(date, timezone = "UTC") {
  var _a;
  if (date === "\u521A\u521A") return /* @__PURE__ */ new Date();
  const theDate = toDate(date);
  const matches = theDate.match(/\D*\d+(?![:\-/]|(a|p)m)\D+/g);
  const offset = dayjs.duration({ hours: (dayjs().tz(timezone).utcOffset() - dayjs().utcOffset()) / 60 });
  if (matches) {
    const lastMatch = matches.pop();
    if (lastMatch) {
      const beforeMatches = /(.*)(?:前|ago)$/.exec(lastMatch);
      if (beforeMatches) {
        matches.push(beforeMatches[1]);
        return dayjs().subtract(dayjs.duration(toDurations(matches))).toDate();
      }
      const afterMatches = /(?:^in(.*)|(.*)[后後])$/.exec(lastMatch);
      if (afterMatches) {
        matches.push((_a = afterMatches[1]) != null ? _a : afterMatches[2]);
        return dayjs().add(dayjs.duration(toDurations(matches))).toDate();
      }
      matches.push(lastMatch);
    }
    const firstMatch = matches.shift();
    if (firstMatch) {
      for (const w of words()) {
        const wordMatches = w.regExp.exec(firstMatch);
        if (wordMatches) {
          matches.unshift(wordMatches[1]);
          return dayjs.tz(w.startAt.set("hour", 0).set("minute", 0).set("second", 0).set("millisecond", 0).add(dayjs.duration(toDurations(matches))).add(offset), timezone).toDate();
        }
      }
    }
  } else {
    for (const w of words()) {
      const wordMatches = w.regExp.exec(theDate);
      if (wordMatches) {
        return dayjs.tz(`${w.startAt.add(offset).format("YYYY-MM-DD")} ${/a|pm$/.test(wordMatches[1]) ? wordMatches[1].replace(/a|pm/, " $&") : wordMatches[1]}`, timezone).toDate();
      }
    }
  }
  return date;
}

const quick = defineSource(async () => {
  const baseURL = "https://www.36kr.com";
  const url = `${baseURL}/newsflashes`;
  const response = await myFetch(url);
  const $ = load(response);
  const news = [];
  const $items = $(".newsflash-item");
  $items.each((_, el) => {
    const $el = $(el);
    const $a = $el.find("a.item-title");
    const url2 = $a.attr("href");
    const title = $a.text();
    const relativeDate = $el.find(".time").text();
    if (url2 && title && relativeDate) {
      news.push({
        url: `${baseURL}${url2}`,
        title,
        id: url2,
        extra: {
          date: parseRelativeDate(relativeDate, "Asia/Shanghai").valueOf()
        }
      });
    }
  });
  return news;
});
const _36kr = defineSource({
  "36kr": quick,
  "36kr-quick": quick
});

const _36kr$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _36kr
});

const baidu = defineSource(async () => {
  const rawData = await myFetch(`https://top.baidu.com/board?tab=realtime`);
  const jsonStr = rawData.match(/<!--s-data:(.*?)-->/s);
  const data = JSON.parse(jsonStr[1]);
  return data.data.cards[0].content.filter((k) => !k.isTop).map((k) => {
    return {
      id: k.rawUrl,
      title: k.word,
      url: k.rawUrl,
      extra: {
        hover: k.desc
      }
    };
  });
});

const baidu$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: baidu
});

function proxyPicture(url, type = "encodeURIComponent") {
  const encoded = type === "encodeBase64URL" ? encodeBase64URL(url) : encodeURIComponent(url);
  return `/api/proxy/img.png?type=${type}&url=${encoded}`;
}

const hotSearch = defineSource(async () => {
  const url = "https://s.search.bilibili.com/main/hotword?limit=30";
  const res = await myFetch(url);
  return res.list.map((k) => ({
    id: k.keyword,
    title: k.show_name,
    url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(k.keyword)}`,
    extra: {
      icon: k.icon && proxyPicture(k.icon)
    }
  }));
});
const bilibili = defineSource({
  "bilibili": hotSearch,
  "bilibili-hot-search": hotSearch
});

const bilibili$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bilibili
});

const cankaoxiaoxi = defineSource(async () => {
  const res = await Promise.all(["zhongguo", "guandian", "gj"].map((k) => myFetch(`https://china.cankaoxiaoxi.com/json/channel/${k}/list.json`)));
  return res.map((k) => k.list).flat().map((k) => ({
    id: k.data.id,
    title: k.data.title,
    extra: {
      date: tranformToUTC(k.data.publishTime)
    },
    url: k.data.url
  })).sort((m, n) => m.extra.date < n.extra.date ? 1 : -1);
});

const cankaoxiaoxi$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: cankaoxiaoxi
});

const subtle = subtle$1;
async function md5(s) {
  try {
    return await myCrypto(s, "MD5");
  } catch {
    return _md5(s);
  }
}
async function myCrypto(s, algorithm) {
  const sUint8 = new TextEncoder().encode(s);
  const hashBuffer = await subtle.digest(algorithm, sUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

const params = {
  appName: "CailianpressWeb",
  os: "web",
  sv: "7.7.5"
};
async function getSearchParams(moreParams) {
  const searchParams = new URLSearchParams({ ...params, ...moreParams });
  searchParams.sort();
  searchParams.append("sign", await md5(await myCrypto(searchParams.toString(), "SHA-1")));
  return searchParams;
}

const depth = defineSource(async () => {
  const apiUrl = `https://www.cls.cn/v3/depth/home/assembled/1000`;
  const res = await myFetch(apiUrl, {
    query: Object.fromEntries(await getSearchParams())
  });
  return res.data.depth_list.sort((m, n) => n.ctime - m.ctime).map((k) => {
    return {
      id: k.id,
      title: k.title || k.brief,
      mobileUrl: k.shareurl,
      pubDate: k.ctime * 1e3,
      url: `https://www.cls.cn/detail/${k.id}`
    };
  });
});
const hot$2 = defineSource(async () => {
  const apiUrl = `https://www.cls.cn/v2/article/hot/list`;
  const res = await myFetch(apiUrl, {
    query: Object.fromEntries(await getSearchParams())
  });
  return res.data.map((k) => {
    return {
      id: k.id,
      title: k.title || k.brief,
      mobileUrl: k.shareurl,
      url: `https://www.cls.cn/detail/${k.id}`
    };
  });
});
const telegraph = defineSource(async () => {
  const apiUrl = `https://www.cls.cn/nodeapi/updateTelegraphList`;
  const res = await myFetch(apiUrl, {
    query: Object.fromEntries(await getSearchParams())
  });
  return res.data.roll_data.filter((k) => !k.is_ad).map((k) => {
    return {
      id: k.id,
      title: k.title || k.brief,
      mobileUrl: k.shareurl,
      pubDate: k.ctime * 1e3,
      url: `https://www.cls.cn/detail/${k.id}`
    };
  });
});
const index$3 = defineSource({
  "cls": telegraph,
  "cls-telegraph": telegraph,
  "cls-depth": depth,
  "cls-hot": hot$2
});

const index$4 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index$3
});

function getRandomDEVICE_ID() {
  const r = [10, 6, 6, 6, 14];
  const id = r.map((i) => Math.random().toString(36).substring(2, i));
  return id.join("-");
}
async function get_app_token() {
  const DEVICE_ID = getRandomDEVICE_ID();
  const now = Math.round(Date.now() / 1e3);
  const hex_now = `0x${now.toString(16)}`;
  const md5_now = await md5(now.toString());
  const s = `token://com.coolapk.market/c67ef5943784d09750dcfbb31020f0ab?${md5_now}$${DEVICE_ID}&com.coolapk.market`;
  const md5_s = await md5(encodeBase64(s));
  const token = md5_s + DEVICE_ID + hex_now;
  return token;
}
async function genHeaders() {
  return {
    "X-Requested-With": "XMLHttpRequest",
    "X-App-Id": "com.coolapk.market",
    "X-App-Token": await get_app_token(),
    "X-Sdk-Int": "29",
    "X-Sdk-Locale": "zh-CN",
    "X-App-Version": "11.0",
    "X-Api-Version": "11",
    "X-App-Code": "2101202",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 10; Redmi K30 5G MIUI/V12.0.3.0.QGICMXM) (#Build; Redmi; Redmi K30 5G; QKQ1.191222.002 test-keys; 10) +CoolMarket/11.0-2101202"
  };
}

const index$1 = defineSource({
  coolapk: async () => {
    const url = "https://api.coolapk.com/v6/page/dataList?url=%2Ffeed%2FstatList%3FcacheExpires%3D300%26statType%3Dday%26sortField%3Ddetailnum%26title%3D%E4%BB%8A%E6%97%A5%E7%83%AD%E9%97%A8&title=%E4%BB%8A%E6%97%A5%E7%83%AD%E9%97%A8&subTitle=&page=1";
    const r = await myFetch(url, {
      headers: await genHeaders()
    });
    if (!r.data.length) throw new Error("Failed to fetch");
    return r.data.filter((k) => k.id).map((i) => {
      var _a;
      return {
        id: i.id,
        title: i.editor_title || load(i.message).text().split("\n")[0],
        url: i.shareUrl,
        extra: {
          info: (_a = i.targetRow) == null ? void 0 : _a.subTitle
          // date: new Date(i.dateline * 1000).getTime(),
        }
      };
    });
  }
});

const index$2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index$1
});

const douyin = defineSource(async () => {
  const url = "https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1";
  const cookie = (await $fetch.raw("https://www.douyin.com/passport/general/login_guiding_strategy/?aid=6383")).headers.getSetCookie();
  const res = await myFetch(url, {
    headers: {
      cookie: cookie.join("; ")
    }
  });
  return res.data.word_list.map((k) => {
    return {
      id: k.sentence_id,
      title: k.word,
      url: `https://www.douyin.com/hot/${k.sentence_id}`
    };
  });
});

const douyin$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: douyin
});

const express = defineSource(async () => {
  const baseURL = "https://www.fastbull.com";
  const html = await myFetch(`${baseURL}/cn/express-news`);
  const $ = cheerio.load(html);
  const $main = $(".news-list");
  const news2 = [];
  $main.each((_, el) => {
    var _a, _b;
    const a = $(el).find(".title_name");
    const url = a.attr("href");
    const titleText = a.text();
    const title = (_b = (_a = titleText.match(/【(.+)】/)) == null ? void 0 : _a[1]) != null ? _b : titleText;
    const date = $(el).attr("data-date");
    if (url && title && date) {
      news2.push({
        url: baseURL + url,
        title: title.length < 4 ? titleText : title,
        id: url,
        pubDate: Number(date)
      });
    }
  });
  return news2;
});
const news$1 = defineSource(async () => {
  const baseURL = "https://www.fastbull.com";
  const html = await myFetch(`${baseURL}/cn/news`);
  const $ = cheerio.load(html);
  const $main = $(".trending_type");
  const news2 = [];
  $main.each((_, el) => {
    const a = $(el);
    const url = a.attr("href");
    const title = a.find(".title").text();
    const date = a.find("[data-date]").attr("data-date");
    if (url && title && date) {
      news2.push({
        url: baseURL + url,
        title,
        id: url,
        pubDate: Number(date)
      });
    }
  });
  return news2;
});
const fastbull = defineSource(
  {
    "fastbull": express,
    "fastbull-express": express,
    "fastbull-news": news$1
  }
);

const fastbull$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: fastbull
});

const gelonghui = defineSource(async () => {
  const baseURL = "https://www.gelonghui.com";
  const html = await myFetch("https://www.gelonghui.com/news/");
  const $ = cheerio.load(html);
  const $main = $(".article-content");
  const news = [];
  $main.each((_, el) => {
    const a = $(el).find(".detail-right>a");
    const url = a.attr("href");
    const title = a.find("h2").text();
    const info = $(el).find(".time > span:nth-child(1)").text();
    const relatieveTime = $(el).find(".time > span:nth-child(3)").text();
    if (url && title && relatieveTime) {
      news.push({
        url: baseURL + url,
        title,
        id: url,
        extra: {
          date: parseRelativeDate(relatieveTime, "Asia/Shanghai").valueOf(),
          info
        }
      });
    }
  });
  return news;
});

const gelonghui$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: gelonghui
});

const trending = defineSource(async () => {
  const baseURL = "https://github.com";
  const html = await myFetch("https://github.com/trending?spoken_language_code=");
  const $ = cheerio.load(html);
  const $main = $("main .Box div[data-hpc] > article");
  const news = [];
  $main.each((_, el) => {
    const a = $(el).find(">h2 a");
    const title = a.text().replace(/\n+/g, "").trim();
    const url = a.attr("href");
    const star = $(el).find("[href$=stargazers]").text().replace(/\s+/g, "").trim();
    const desc = $(el).find(">p").text().replace(/\n+/g, "").trim();
    if (url && title) {
      news.push({
        url: `${baseURL}${url}`,
        title,
        id: url,
        extra: {
          info: `\u2730 ${star}`,
          hover: desc
        }
      });
    }
  });
  return news;
});
const github = defineSource({
  "github": trending,
  "github-trending-today": trending
});

const github$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: github
});

const hackernews = defineSource(async () => {
  const baseURL = "https://news.ycombinator.com";
  const html = await myFetch(baseURL);
  const $ = cheerio.load(html);
  const $main = $(".athing");
  const news = [];
  $main.each((_, el) => {
    const a = $(el).find(".titleline a").first();
    const title = a.text();
    const id = $(el).attr("id");
    const score = $(`#score_${id}`).text();
    const url = `${baseURL}/item?id=${id}`;
    if (url && id && title) {
      news.push({
        url,
        title,
        id,
        extra: {
          info: score
        }
      });
    }
  });
  return news;
});

const hackernews$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: hackernews
});

const ithome = defineSource(async () => {
  const response = await myFetch("https://www.ithome.com/list/");
  const $ = cheerio.load(response);
  const $main = $("#list > div.fl > ul > li");
  const news = [];
  $main.each((_, el) => {
    const $el = $(el);
    const $a = $el.find("a.t");
    const url = $a.attr("href");
    const title = $a.text();
    const date = $(el).find("i").text();
    if (url && title && date) {
      const isAd = (url == null ? void 0 : url.includes("lapin")) || ["\u795E\u5238", "\u4F18\u60E0", "\u8865\u8D34", "\u4EAC\u4E1C"].find((k) => title.includes(k));
      if (!isAd) {
        news.push({
          url,
          title,
          id: url,
          pubDate: parseRelativeDate(date, "Asia/Shanghai").valueOf()
        });
      }
    }
  });
  return news.sort((m, n) => n.pubDate > m.pubDate ? 1 : -1);
});

const ithome$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: ithome
});

const jin10 = defineSource(async () => {
  const timestamp = Date.now();
  const url = `https://www.jin10.com/flash_newest.js?t=${timestamp}`;
  const rawData = await myFetch(url);
  const jsonStr = rawData.replace(/^var\s+newest\s*=\s*/, "").replace(/;*$/, "").trim();
  const data = JSON.parse(jsonStr);
  return data.filter((k) => {
    var _a;
    return (k.data.title || k.data.content) && !((_a = k.channel) == null ? void 0 : _a.includes(5));
  }).map((k) => {
    var _a;
    const text = (k.data.title || k.data.content).replace(/<\/?b>/g, "");
    const [, title, desc] = (_a = text.match(/^【([^】]*)】(.*)$/)) != null ? _a : [];
    return {
      id: k.id,
      title: title != null ? title : text,
      pubDate: parseRelativeDate(k.time, "Asia/Shanghai").valueOf(),
      url: `https://flash.jin10.com/detail/${k.id}`,
      extra: {
        hover: desc,
        info: !!k.important && "\u2730"
      }
    };
  });
});

const jin10$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: jin10
});

const kaopu = defineSource(
  async () => {
    const res = await Promise.all(["https://kaopucdn.azureedge.net/jsondata/news_list_beta_hans_0.json", "https://kaopucdn.azureedge.net/jsondata/news_list_beta_hans_1.json"].map((url) => myFetch(url)));
    return res.flat().filter((k) => ["\u8D22\u65B0", "\u516C\u89C6"].every((h) => k.publisher !== h)).map((k) => {
      return {
        id: k.link,
        title: k.title,
        pubDate: k.pubDate,
        extra: {
          hover: k.description,
          info: k.publisher
        },
        url: k.link
      };
    });
  }
);

const kaopu$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: kaopu
});

const kuaishou = defineSource(async () => {
  const html = await myFetch("https://www.kuaishou.com/?isHome=1");
  const matches = html.match(/window\.__APOLLO_STATE__\s*=\s*(\{.+?\});/);
  if (!matches) {
    throw new Error("\u65E0\u6CD5\u83B7\u53D6\u5FEB\u624B\u70ED\u699C\u6570\u636E");
  }
  const data = JSON.parse(matches[1]);
  const hotRankId = data.defaultClient.ROOT_QUERY['visionHotRank({"page":"home"})'].id;
  const hotRankData = data.defaultClient[hotRankId];
  return hotRankData.items.filter((k) => data.defaultClient[k.id].tagType !== "\u7F6E\u9876").map((item) => {
    const hotSearchWord = item.id.replace("VisionHotRankItem:", "");
    const hotItem = data.defaultClient[item.id];
    return {
      id: hotSearchWord,
      title: hotItem.name,
      url: `https://www.kuaishou.com/search/video?searchKey=${encodeURIComponent(hotItem.name)}`,
      extra: {
        icon: hotItem.iconUrl && proxyPicture(hotItem.iconUrl)
      }
    };
  });
});

const kuaishou$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: kuaishou
});

const hot$1 = defineSource(async () => {
  const res = await myFetch("https://linux.do/top/daily.json");
  return res.topic_list.topics.filter((k) => k.visible && !k.archived && !k.pinned).map((k) => ({
    id: k.id,
    title: k.title,
    url: `https://linux.do/t/topic/${k.id}`
  }));
});
const latest = defineSource(async () => {
  const res = await myFetch("https://linux.do/latest.json?order=created");
  return res.topic_list.topics.filter((k) => k.visible && !k.archived && !k.pinned).map((k) => ({
    id: k.id,
    title: k.title,
    pubDate: new Date(k.created_at).valueOf(),
    url: `https://linux.do/t/topic/${k.id}`
  }));
});
const linuxdo = defineSource({
  "linuxdo": latest,
  "linuxdo-latest": latest,
  "linuxdo-hot": hot$1
});

const linuxdo$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: linuxdo
});

const producthunt = defineSource(async () => {
  const baseURL = "https://www.producthunt.com";
  const html = await myFetch(baseURL);
  const $ = cheerio.load(html);
  const $main = $("[data-test=homepage-section-0] [data-test^=post-item]");
  const news = [];
  $main.each((_, el) => {
    var _a;
    const a = $(el).find("a").first();
    const url = a.attr("href");
    const title = $(el).find("a[data-test^=post-name]").text().replace(/^\d+\.\s*/, "");
    const id = (_a = $(el).attr("data-test")) == null ? void 0 : _a.replace("post-item-", "");
    const vote = $(el).find("[data-test=vote-button]").text();
    if (url && id && title) {
      news.push({
        url: `${baseURL}${url}`,
        title,
        id,
        extra: {
          info: `\u25B3\uFE0E ${vote}`
        }
      });
    }
  });
  return news;
});

const producthunt$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: producthunt
});

const solidot = defineSource(async () => {
  const baseURL = "https://www.solidot.org";
  const html = await myFetch(baseURL);
  const $ = cheerio.load(html);
  const $main = $(".block_m");
  const news = [];
  $main.each((_, el) => {
    var _a;
    const a = $(el).find(".bg_htit a").last();
    const url = a.attr("href");
    const title = a.text();
    const date_raw = (_a = $(el).find(".talk_time").text().match(/发表于(.*?分)/)) == null ? void 0 : _a[1];
    const date = date_raw == null ? void 0 : date_raw.replace(/[年月]/g, "-").replace("\u65F6", ":").replace(/[分日]/g, "");
    if (url && title && date) {
      news.push({
        url: baseURL + url,
        title,
        id: url,
        pubDate: parseRelativeDate(date, "Asia/Shanghai").valueOf()
      });
    }
  });
  return news;
});

const solidot$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: solidot
});

const sputniknewscn = defineSource(async () => {
  const response = await myFetch("https://sputniknews.cn/services/widget/lenta/");
  const $ = cheerio.load(response);
  const $items = $(".lenta__item");
  const news = [];
  $items.each((_, el) => {
    const $el = $(el);
    const $a = $el.find("a");
    const url = $a.attr("href");
    const title = $a.find(".lenta__item-text").text();
    const date = $a.find(".lenta__item-date").attr("data-unixtime");
    if (url && title && date) {
      news.push({
        url: `https://sputniknews.cn${url}`,
        title,
        id: url,
        extra: {
          date: new Date(Number(`${date}000`)).getTime()
        }
      });
    }
  });
  return news;
});

const sputniknewscn$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: sputniknewscn
});

const thepaper = defineSource(async () => {
  const url = "https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar";
  const res = await myFetch(url);
  return res.data.hotNews.map((k) => {
    return {
      id: k.contId,
      title: k.name,
      url: `https://www.thepaper.cn/newsDetail_forward_${k.contId}`,
      mobileUrl: `https://m.thepaper.cn/newsDetail_forward_${k.contId}`
    };
  });
});

const thepaper$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: thepaper
});

const tieba = defineSource(async () => {
  const url = "https://tieba.baidu.com/hottopic/browse/topicList";
  const res = await myFetch(url);
  return res.data.bang_topic.topic_list.map((k) => {
    return {
      id: k.topic_id,
      title: k.topic_name,
      url: k.topic_url
    };
  });
});

const tieba$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: tieba
});

const toutiao = defineSource(async () => {
  const url = "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc";
  const res = await myFetch(url);
  return res.data.map((k) => {
    var _a;
    return {
      id: k.ClusterIdStr,
      title: k.Title,
      url: `https://www.toutiao.com/trending/${k.ClusterIdStr}/`,
      extra: {
        icon: ((_a = k.LabelUri) == null ? void 0 : _a.url) && proxyPicture(k.LabelUri.url, "encodeBase64URL")
      }
    };
  });
});

const toutiao$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: toutiao
});

const share = defineSource(async () => {
  const res = await Promise.all(["create", "ideas", "programmer", "share"].map((k) => myFetch(`https://www.v2ex.com/feed/${k}.json`)));
  return res.map((k) => k.items).flat().map((k) => {
    var _a;
    return {
      id: k.id,
      title: k.title,
      extra: {
        date: (_a = k.date_modified) != null ? _a : k.date_published
      },
      url: k.url
    };
  }).sort((m, n) => m.extra.date < n.extra.date ? 1 : -1);
});
const v2ex = defineSource({
  "v2ex": share,
  "v2ex-share": share
});

const v2ex$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: v2ex
});

const live = defineSource(async () => {
  const apiUrl = `https://api-one.wallstcn.com/apiv1/content/lives?channel=global-channel&limit=30`;
  const res = await myFetch(apiUrl);
  return res.data.items.map((k) => {
    return {
      id: k.id,
      title: k.title || k.content_text,
      extra: {
        date: k.display_time * 1e3
      },
      url: k.uri
    };
  });
});
const news = defineSource(async () => {
  const apiUrl = `https://api-one.wallstcn.com/apiv1/content/information-flow?channel=global-channel&accept=article&limit=30`;
  const res = await myFetch(apiUrl);
  return res.data.items.filter((k) => k.resource_type !== "ad" && k.resource.type !== "live" && k.resource.uri).map(({ resource: h }) => {
    return {
      id: h.id,
      title: h.title || h.content_short,
      extra: {
        date: h.display_time * 1e3
      },
      url: h.uri
    };
  });
});
const hot = defineSource(async () => {
  const apiUrl = `https://api-one.wallstcn.com/apiv1/content/articles/hot?period=all`;
  const res = await myFetch(apiUrl);
  return res.data.day_items.map((h) => {
    return {
      id: h.id,
      title: h.title,
      url: h.uri
    };
  });
});
const wallstreetcn = defineSource({
  "wallstreetcn": live,
  "wallstreetcn-quick": live,
  "wallstreetcn-news": news,
  "wallstreetcn-hot": hot
});

const wallstreetcn$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: wallstreetcn
});

const weibo = defineSource(async () => {
  const url = "https://weibo.com/ajax/side/hotSearch";
  const res = await myFetch(url);
  return res.data.realtime.filter((k) => !k.is_ad).map((k) => {
    const keyword = k.word_scheme ? k.word_scheme : `#${k.word}#`;
    return {
      id: k.word,
      title: k.word,
      extra: {
        icon: k.icon && {
          url: proxyPicture(k.icon),
          scale: 1.5
        }
      },
      url: `https://s.weibo.com/weibo?q=${encodeURIComponent(keyword)}`,
      mobileUrl: `https://m.weibo.cn/search?containerid=231522type%3D1%26q%3D${encodeURIComponent(keyword)}&_T_WM=16922097837&v_p=42`
    };
  });
});

const weibo$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: weibo
});

const hotstock = defineSource(async () => {
  const url = "https://stock.xueqiu.com/v5/stock/hot_stock/list.json?size=30&_type=10&type=10";
  const cookie = (await $fetch.raw("https://xueqiu.com/hq")).headers.getSetCookie();
  const res = await myFetch(url, {
    headers: {
      cookie: cookie.join("; ")
    }
  });
  return res.data.items.filter((k) => !k.ad).map((k) => ({
    id: k.code,
    url: `https://xueqiu.com/s/${k.code}`,
    title: k.name,
    extra: {
      info: `${k.percent}% ${k.exchange}`
    }
  }));
});
const xueqiu = defineSource({
  "xueqiu": hotstock,
  "xueqiu-hotstock": hotstock
});

const xueqiu$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: xueqiu
});

const zaobao = defineSource(async () => {
  const response = await myFetch("https://www.zaochenbao.com/realtime/", {
    responseType: "arrayBuffer"
  });
  const base = "https://www.zaochenbao.com";
  const utf8String = iconv.decode(Buffer.from(response), "gb2312");
  const $ = cheerio.load(utf8String);
  const $main = $("div.list-block>a.item");
  const news = [];
  $main.each((_, el) => {
    var _a, _b;
    const a = $(el);
    const url = a.attr("href");
    const title = (_a = a.find(".eps")) == null ? void 0 : _a.text();
    const date = (_b = a.find(".pdt10")) == null ? void 0 : _b.text().replace(/-\s/g, " ");
    if (url && title && date) {
      news.push({
        url: base + url,
        title,
        id: url,
        pubDate: parseRelativeDate(date, "Asia/Shanghai").valueOf()
      });
    }
  });
  return news.sort((m, n) => n.pubDate > m.pubDate ? 1 : -1);
});

const zaobao$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: zaobao
});

const zhihu = defineSource({
  zhihu: async () => {
    const url = "https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=20&desktop=true";
    const res = await myFetch(url);
    return res.data.map((k) => {
      var _a, _b, _c;
      const urlId = (_b = (_a = k.target.url) == null ? void 0 : _a.match(/(\d+)$/)) == null ? void 0 : _b[1];
      return {
        id: k.target.id,
        title: k.target.title,
        extra: {
          icon: ((_c = k.card_label) == null ? void 0 : _c.night_icon) && proxyPicture(k.card_label.night_icon)
        },
        url: `https://www.zhihu.com/question/${urlId || k.target.id}`
      };
    });
  }
});

const zhihu$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: zhihu
});

const x = /*#__PURE__*/Object.freeze({
  __proto__: null,
  _36kr: _36kr$1,
  baidu: baidu$1,
  bilibili: bilibili$1,
  cankaoxiaoxi: cankaoxiaoxi$1,
  cls: index$4,
  coolapk: index$2,
  douyin: douyin$1,
  fastbull: fastbull$1,
  gelonghui: gelonghui$1,
  github: github$1,
  hackernews: hackernews$1,
  ithome: ithome$1,
  jin10: jin10$1,
  kaopu: kaopu$1,
  kuaishou: kuaishou$1,
  linuxdo: linuxdo$1,
  producthunt: producthunt$1,
  solidot: solidot$1,
  sputniknewscn: sputniknewscn$1,
  thepaper: thepaper$1,
  tieba: tieba$1,
  toutiao: toutiao$1,
  v2ex: v2ex$1,
  wallstreetcn: wallstreetcn$1,
  weibo: weibo$1,
  xueqiu: xueqiu$1,
  zaobao: zaobao$1,
  zhihu: zhihu$1
});

const getters = function() {
  const getters2 = {};
  typeSafeObjectEntries(x).forEach(([id, x2]) => {
    if (x2.default instanceof Function) {
      Object.assign(getters2, { [id]: x2.default });
    } else {
      Object.assign(getters2, x2.default);
    }
  });
  return getters2;
}();

const index = defineEventHandler(async (event) => {
  var _a, _b;
  try {
    const query = getQuery(event);
    const latest = query.latest !== void 0 && query.latest !== "false";
    let id = query.id;
    const isValid = (id2) => !id2 || !sources[id2] || !getters[id2];
    if (isValid(id)) {
      const redirectID = (_b = (_a = sources) == null ? void 0 : _a[id]) == null ? void 0 : _b.redirect;
      if (redirectID) id = redirectID;
      if (isValid(id)) throw new Error("Invalid source id");
    }
    const cacheTable = await getCacheTable();
    const now = Date.now();
    let cache;
    if (cacheTable) {
      cache = await cacheTable.get(id);
      if (cache) {
        if (now - cache.updated < sources[id].interval) {
          return {
            status: "success",
            id,
            updatedTime: now,
            items: cache.items
          };
        }
        if (now - cache.updated < TTL) {
          if (!latest || !event.context.disabledLogin && !event.context.user) {
            return {
              status: "cache",
              id,
              updatedTime: cache.updated,
              items: cache.items
            };
          }
        }
      }
    }
    try {
      const newData = (await getters[id]()).slice(0, 30);
      if (cacheTable && newData.length) {
        if (event.context.waitUntil) event.context.waitUntil(cacheTable.set(id, newData));
        else await cacheTable.set(id, newData);
      }
      logger.success(`fetch ${id} latest`);
      return {
        status: "success",
        id,
        updatedTime: now,
        items: newData
      };
    } catch (e) {
      if (cache) {
        return {
          status: "cache",
          id,
          updatedTime: cache.updated,
          items: cache.items
        };
      } else {
        throw e;
      }
    }
  } catch (e) {
    logger.error(e);
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "Internal Server Error"
    });
  }
});

export { index as default };
