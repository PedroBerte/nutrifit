import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { resetSelfManagedStore } from "../../src/modules/self-managed/self-managed.store";
import { prisma } from "../../src/prisma";

describe("Bonds flow", () => {
  const app = createApp();

  beforeEach(async () => {
    await resetSelfManagedStore();
    await prisma.customerProfessionalBond.deleteMany();
    await prisma.user.deleteMany({ where: { email: { in: ["personal@test.com", "customer@test.com"] } } });
  });

  it("personal creates bond with customer", async () => {
    // Register two self-managed users to simulate personal + customer
    const personalRes = await request(app).post("/auth/self-managed/register").send({
      name: "Personal", email: "personal@test.com", password: "12345678",
    });
    const customerRes = await request(app).post("/auth/self-managed/register").send({
      name: "Customer", email: "customer@test.com", password: "12345678",
    });

    const personalToken = personalRes.body.token;
    const customerId = customerRes.body.user.id;

    const bondRes = await request(app)
      .post("/bonds")
      .set("Authorization", `Bearer ${personalToken}`)
      .send({ customerId, professionalId: personalRes.body.user.id });

    expect(bondRes.status).toBe(201);
    expect(bondRes.body.customerId).toBe(customerId);

    const myBondsRes = await request(app)
      .get("/bonds/sent")
      .set("Authorization", `Bearer ${personalToken}`);

    expect(myBondsRes.status).toBe(200);
    expect(myBondsRes.body).toHaveLength(1);
  });
});
