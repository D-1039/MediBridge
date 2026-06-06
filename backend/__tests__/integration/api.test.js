const request = require("supertest");

jest.mock("../../src/repositories/medicineRepository", () => ({
  findApproved: jest.fn().mockResolvedValue([]),
  countApproved: jest.fn().mockResolvedValue(0),
}));

const app = require("../../src/app");

describe("API integration", () => {
  it("GET /api/health returns 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("POST /api/auth/register validates input", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "bad", password: "123" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/medicines returns marketplace list", async () => {
    const res = await request(app).get("/api/medicines");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.medicines).toEqual([]);
  });
});
