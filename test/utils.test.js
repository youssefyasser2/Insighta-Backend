const assert = require("node:assert/strict");
const test = require("node:test");
const DateUtils = require("../utils/dateUtils");
const ResponseUtils = require("../utils/responseUtils");

test("DateUtils identifies expired dates", () => {
  assert.equal(DateUtils.isExpired(new Date(Date.now() - 1000)), true);
  assert.equal(DateUtils.isExpired(new Date(Date.now() + 60_000)), false);
});

test("ResponseUtils builds success responses", () => {
  const res = {
    payload: null,
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  ResponseUtils.success(res, "ok", { id: 1 });
  assert.deepEqual(res.payload, { success: true, message: "ok", data: { id: 1 } });
});

test("ResponseUtils builds error responses", () => {
  const res = {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  ResponseUtils.error(res, "bad", 422);
  assert.equal(res.statusCode, 422);
  assert.deepEqual(res.payload, { success: false, message: "bad" });
});
