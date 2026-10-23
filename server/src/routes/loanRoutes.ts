import { Router } from "express";
import {
  createLoan,
  getLoan,
  getSummary,
  listLoans,
  repayLoan,
} from "../controller/loanController";
import { uploadReceipt } from "../middleware/uploadMiddleware";
import { validate } from "../middleware/validationMiddleware";
import { createLoanSchema, loanIdSchema } from "../schema/loan";

const router = Router();

router.get("/", listLoans);
// must stay above /:id or "summary" gets treated as an id
router.get("/summary", getSummary);
router.get("/:id", validate(loanIdSchema, "params"), getLoan);
router.post("/", uploadReceipt, validate(createLoanSchema), createLoan);
router.patch("/:id/repay", validate(loanIdSchema, "params"), repayLoan);

export default router;
