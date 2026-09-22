import { NextRequest, NextResponse } from "next/server";
import { classifyCholeraRisk, calculateEnvironmentalOutbreakRisk } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms, district, waterSource, waterContaminationLevel, chlorineResidual, sanitationScore, rainfallMm, floodRisk } = body;

    if (!symptoms && !waterContaminationLevel) {
      return NextResponse.json(
        { error: "At least 'symptoms' or 'waterContaminationLevel' must be provided." },
        { status: 400 }
      );
    }

    let clinicalPrediction = null;
    if (symptoms) {
      clinicalPrediction = await classifyCholeraRisk(symptoms, district, waterSource);
    }

    let environmentalRisk = null;
    if (waterContaminationLevel) {
      environmentalRisk = calculateEnvironmentalOutbreakRisk({
        waterContaminationLevel,
        chlorineResidual: chlorineResidual ?? null,
        sanitationScore: sanitationScore ?? null,
        rainfallMm: rainfallMm ?? null,
        floodRisk: Boolean(floodRisk),
      });
    }

    return NextResponse.json({
      success: true,
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      timestamp: new Date().toISOString(),
      clinicalPrediction,
      environmentalRisk,
    });
  } catch (error) {
    console.error("[API AI Predict Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal AI prediction error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    endpoint: "/api/ai/predict",
    description: "ML-Driven Cholera Outbreak & Clinical Triage Prediction API",
  });
}
