import { describe, expect, it } from "vitest";
import { questionBank } from "@/lib/questions";
import { scoreDiagnostic } from "@/lib/scoring";
import { SubmissionPayload } from "@/lib/types";

function buildResponses(value: number): Record<string, number> {
  return Object.fromEntries(questionBank.map((question) => [question.id, value]));
}

describe("scoreDiagnostic", () => {
  it("returns a perfect score when every response is strongest", () => {
    const payload: SubmissionPayload = {
      profile: {
        stage: "growth",
        businessType: "services",
        teamSize: "11-25",
        revenueBand: "500k-2m"
      },
      responses: buildResponses(5)
    };

    const result = scoreDiagnostic(payload);

    expect(result.overallScore).toBe(100);
    expect(result.overallLabel).toBe("advantaged");
    expect(result.roadmap).toHaveLength(4);
  });

  it("surfaces finance and operations when those sections lag behind", () => {
    const responses = buildResponses(4);
    responses["finance-visibility"] = 1;
    responses["finance-unit-economics"] = 1;
    responses["operations-delivery"] = 2;
    responses["operations-bottlenecks"] = 2;

    const payload: SubmissionPayload = {
      profile: {
        stage: "scale",
        businessType: "ecommerce",
        teamSize: "26-50",
        revenueBand: "2m+"
      },
      responses
    };

    const result = scoreDiagnostic(payload);

    expect(result.sectionScores.find((item) => item.section === "finance")?.label).toBe("fragile");
    expect(result.roadmap[0]?.section).toBe("finance");
    expect(result.roadmap[1]?.section).toBe("operations");
  });
});
