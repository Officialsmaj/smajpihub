import { Router } from "express";

export default function mountPaymentsEndpoints(router: Router) {
  router.post("/incomplete", async (_req, res) => {
    return res.status(200).json({ message: "Pi payments are temporarily disabled. No payment was processed." });
  });

  router.post("/approve", async (_req, res) => {
    return res.status(200).json({ message: "Pi payments are temporarily disabled. No payment was approved." });
  });

  router.post("/complete", async (_req, res) => {
    return res.status(200).json({ message: "Pi payments are temporarily disabled. No payment was completed." });
  });

  router.post("/cancelled_payment", async (_req, res) => {
    return res.status(200).json({ message: "Pi payments are temporarily disabled. No cancellation was recorded." });
  });

  router.post("/failed", async (_req, res) => {
    return res.status(200).json({ message: "Pi payments are temporarily disabled. Order remains pending." });
  });
}
