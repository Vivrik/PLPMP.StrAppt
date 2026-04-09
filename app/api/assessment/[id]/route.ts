import { NextResponse } from "next/server";
import { getSubmission } from "@/lib/repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const submission = await getSubmission(params.id);

  if (!submission) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  return NextResponse.json(submission);
}
