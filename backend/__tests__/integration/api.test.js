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

  it("returns 401 and stays available for repeated invalid tokens", async () => {
    const first = await request(app)
      .post("/api/medicines/ocr-suggest")
      .set("Authorization", "Bearer invalid-token")
      .attach("image", Buffer.from("not an image"), "medicine.jpg");
    const second = await request(app)
      .post("/api/medicines/ocr-suggest")
      .set("Authorization", "Bearer expired-token")
      .attach("image", Buffer.from("not an image"), "medicine.jpg");

    expect(first.status).toBe(401);
    expect(first.body).toMatchObject({
      success: false,
      message: "Invalid or expired token",
      code: "UNAUTHORIZED",
    });
    expect(second.status).toBe(401);
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
