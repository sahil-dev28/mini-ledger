import { Router } from "express";
import { requestOtp, verifyOtp } from "../controller/authController";
import { validate } from "../middleware/validationMiddleware";
import { requestOtpSchema, verifyOtpSchema } from "../schema/auth";

const router = Router();

router.post("/request-otp", validate(requestOtpSchema), requestOtp);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);

export default router;
