process.env.OCR_SERVICE_URL = "http://127.0.0.1:65530";

const jwt = require("jsonwebtoken");
const request = require("supertest");

jest.mock("../../src/repositories/userRepository", () => ({
  findById: jest.fn().mockResolvedValue({
    id: "donor-id",
    full_name: "Test Donor",
    email: "donor@example.com",
    role: "donor",
  }),
}));

const app = require("../../src/app");

describe("OCR suggestion error contract", () => {
  it("returns 503 when the OCR service is unreachable", async () => {
    const token = jwt.sign({ sub: "donor-id" }, process.env.JWT_SECRET);
    const response = await request(app)
      .post("/api/medicines/ocr-suggest")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", Buffer.from("not an image"), "medicine.jpg");

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      success: false,
      message: "OCR service unavailable: fetch failed",
      code: "OCR_UNAVAILABLE",
    });
  });
});
