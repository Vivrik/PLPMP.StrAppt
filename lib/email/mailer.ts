import { SubmissionRecord } from "@/lib/types";
import { Resend } from "resend";

export interface EmailDeliveryResult {
  status: "sent" | "failed";
  providerId?: string;
  error?: string;
}

export async function deliverReportEmail(
  submission: SubmissionRecord
): Promise<EmailDeliveryResult> {
  if (!submission.contact?.email) {
    return { status: "failed", error: "Missing recipient email." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.REPORT_SENDER_EMAIL;

  if (!apiKey || !sender) {
    return {
      status: "failed",
      error: "Email provider is not configured. Add RESEND_API_KEY and REPORT_SENDER_EMAIL."
    };
  }

  const resend = new Resend(apiKey);

  try {
    const response = await resend.emails.send({
      from: sender,
      to: submission.contact.email,
      subject: "Your business diagnostic roadmap",
      html: submission.reportHtml ?? "<p>Your report is ready.</p>",
      text: submission.reportText ?? "Your report is ready."
    });

    return { status: "sent", providerId: response.data?.id };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown email delivery error."
    };
  }
}
