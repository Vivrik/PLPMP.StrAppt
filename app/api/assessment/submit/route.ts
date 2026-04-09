import { NextResponse } from "next/server";
import { z } from "zod";
import { questionBank } from "@/lib/questions";
import { createSubmission } from "@/lib/repository";
import { scoreDiagnostic } from "@/lib/scoring";

const submissionSchema = z.object({
  profile: z.object({
    stage: z.enum(["idea", "launch", "growth", "scale"]),
    businessType: z.enum(["services", "ecommerce", "saas", "local", "agency", "other"]),
    teamSize: z.enum(["solo", "2-10", "11-25", "26-50", "51+"]),
    revenueBand: z.enum(["pre-revenue", "0-100k", "100k-500k", "500k-2m", "2m+"])
  }),
  responses: z.record(z.string(), z.number().min(1).max(5))
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = submissionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Assessment payload is invalid.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const expectedIds = new Set(questionBank.map((question) => question.id));
  const receivedIds = Object.keys(parsed.data.responses);

  if (receivedIds.length < questionBank.length) {
    return NextResponse.json(
      { error: "Please answer every assessment question before continuing." },
      { status: 400 }
    );
  }

  const unexpected = receivedIds.find((id) => !expectedIds.has(id));

  if (unexpected) {
    return NextResponse.json({ error: `Unknown question id: ${unexpected}` }, { status: 400 });
  }

  const summary = scoreDiagnostic(parsed.data);
  const record = await createSubmission(parsed.data, summary);

  return NextResponse.json({
    id: record.id,
    summary: record.summary
  });
}
