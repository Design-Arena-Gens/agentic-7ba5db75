import { getAgentResponse } from "@/lib/agent";
import { AgentRequestPayload } from "@/types/agent";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<AgentRequestPayload>;
    if (!payload?.query) {
      return NextResponse.json(
        { error: "The assistant needs a query to proceed." },
        { status: 400 }
      );
    }

    const response = await getAgentResponse({
      query: payload.query,
      vision: payload.vision,
      enabledTools: payload.enabledTools ?? {
        search: true,
        knowledge: true,
        community: true,
        system: true
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Agent handler failed", error);
    return NextResponse.json(
      { error: "Agent failed to complete the request." },
      { status: 500 }
    );
  }
}
