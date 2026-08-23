const { authorize } = require("../../src/middleware/auth");

describe("authorize", () => {
  it("explains the required roles when access is forbidden", () => {
    const request = {
      user: { role: "receiver" },
      method: "POST",
      originalUrl: "/api/medicines/ocr-suggest",
    };

    expect(() => authorize("donor", "admin")(request, {}, jest.fn())).toThrow(
      "Insufficient permissions: role 'receiver' is not allowed; required role: donor or admin"
    );
  });

  it("allows a donor to continue to the upload middleware", () => {
    const next = jest.fn();
    authorize("donor", "admin")(
      { user: { role: "donor" } },
      {},
      next
    );

    expect(next).toHaveBeenCalledTimes(1);
  });
});
