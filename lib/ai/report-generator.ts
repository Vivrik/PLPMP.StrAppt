import OpenAI from "openai";
import { DiagnosticSummary, SubmissionRecord } from "@/lib/types";

function buildFallbackReport(summary: DiagnosticSummary, submission: SubmissionRecord): {
  html: string;
  text: string;
} {
  const roadmapItems = summary.roadmap
    .map(
      (item) =>
        `<li><strong>${item.order}. ${item.title}</strong> (${item.timeframe})<br/>${item.rationale}</li>`
    )
    .join("");

  const strengths = summary.topStrengths.map((item) => `<li>${item}</li>`).join("");
  const risks = summary.topRisks.map((item) => `<li>${item}</li>`).join("");

  const html = `
    <article>
      <h1>${submission.contact?.company ?? submission.contact?.name ?? "Your"} Business Diagnostic</h1>
      <p>Overall score: <strong>${summary.overallScore}/100</strong> (${summary.overallLabel})</p>
      <h2>Top strengths</h2>
      <ul>${strengths}</ul>
      <h2>Primary risks</h2>
      <ul>${risks}</ul>
      <h2>90-day roadmap</h2>
      <ol>${roadmapItems}</ol>
    </article>
  `.trim();

  const text = [
    `Overall score: ${summary.overallScore}/100 (${summary.overallLabel})`,
    "Top strengths:",
    ...summary.topStrengths.map((item) => `- ${item}`),
    "Primary risks:",
    ...summary.topRisks.map((item) => `- ${item}`),
    "90-day roadmap:",
    ...summary.roadmap.map((item) => `${item.order}. ${item.title} (${item.timeframe}) - ${item.rationale}`)
  ].join("\n");

  return { html, text };
}

export async function generatePolishedReport(
  summary: DiagnosticSummary,
  submission: SubmissionRecord
): Promise<{ html: string; text: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackReport(summary, submission);
  }

  const client = new OpenAI({ apiKey });
  const structuredSummary = JSON.stringify(summary, null, 2);

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You write concise, practical business advisory reports for founders and SMB owners. Stay grounded in the provided structured findings and do not invent metrics."
        },
        {
          role: "user",
          content: `Create a polished business diagnostic report in HTML with sections for executive summary, strengths, risks, and 90-day roadmap. Use this data:\n${structuredSummary}`
        }
      ]
    });

    const text = response.output_text?.trim();

    if (!text) {
      return buildFallbackReport(summary, submission);
    }

    return {
      html: text,
      text: text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    };
  } catch {
    return buildFallbackReport(summary, submission);
  }
}
