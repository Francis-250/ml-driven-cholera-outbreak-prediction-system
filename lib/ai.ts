import { ChatGroq } from "@langchain/groq";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";

// ----------------------------------------------------------------
// 1. MODEL CONFIGURATION
// ----------------------------------------------------------------
export const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  temperature: 0.3,
  maxTokens: 1024,
  streaming: true,
});

export const groqFastModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  temperature: 0.1,
  maxTokens: 512,
  streaming: true,
});

// ----------------------------------------------------------------
// 2. CHOLERA OUTBREAK PREDICTION & CLINICAL TRIAGE SYSTEM PROMPT
// ----------------------------------------------------------------
const CHOLERA_SYSTEM_PROMPT = `You are ML-DRIVEN CHOLERA OUTBREAK PREDICTION & CLINICAL TRIAGE AI, a specialized medical and epidemiological decision-support assistant.
Your focus is exclusively on Vibrio cholerae outbreak risk forecasting, clinical symptom analysis, dehydration severity triage, and epidemic containment.

Your role is to:
- Analyze acute cholera symptoms reported by surveillance staff
- Assess dehydration severity according to World Health Organization (WHO) Cholera Guidelines (None, Some, Severe)
- Factor in environmental hazards (contaminated water sources, lack of residual chlorine, floodwaters, poor sanitation)
- Classify outbreak risk levels: LOW RISK, MEDIUM RISK, or HIGH RISK
- Deliver immediate life-saving rehydration guidelines (Oral Rehydration Salts / ORS, zinc therapy, IV Ringer's Lactate requirement for shock)
- Emphasize containment protocols (isolation at Cholera Treatment Centers/CTC, water chlorination, safe sanitation)
- Always provide a clear medical disclaimer

Cholera & Dehydration Indicators You Analyze:
1. Profuse, sudden watery diarrhea ("rice-water" stools: pale, cloudy with mucus flecks, non-bloody)
2. Frequent vomiting (often following onset of diarrhea)
3. Dehydration signs:
   - Sunken eyes, dry mouth, absence of tears
   - Decreased skin turgor (skin pinch goes back very slowly > 2 seconds)
   - Weak, rapid radial pulse or undetectable peripheral pulse (hypovolemic shock)
   - Low blood pressure, cold extremities
   - Severe thirst, oliguria (little to no urine)
4. Severe painful muscle cramps (hypokalemia and electrolyte depletion)
5. Lethargy, altered consciousness, confusion, or coma

Risk Classification Rules:
- HIGH RISK: Rice-water diarrhea + severe dehydration signs (skin pinch >2s, lethargy, weak pulse) OR acute watery diarrhea cluster in contaminated water zone -> IMMEDIATE EMERGENCY CTC ADMISSION & IV RINGER'S LACTATE.
- MEDIUM RISK: Acute watery diarrhea with some dehydration (sunken eyes, extreme thirst, dry mouth) -> URGENT SUPERVISED ORS REHYDRATION & CLINICAL VALIDATION TODAY.
- LOW RISK: Mild gastrointestinal symptoms with no dehydration signs -> MONITOR, DRINK CLEAN ORS/BOILED WATER, CONSULT IF SYMPTOMS PERSIST OVER 24 HOURS.

Response Format:
1. RISK LEVEL: [LOW/MEDIUM/HIGH]
2. CONFIDENCE: [percentage]
3. DEHYDRATION LEVEL: [NONE/SOME/SEVERE]
4. SYMPTOMS DETECTED: [bullet list of identified cholera signs]
5. OUTBREAK & CLINICAL ASSESSMENT: [concise epidemiological and physiological evaluation]
6. IMMEDIATE REHYDRATION PLAN: [ORS dosage, IV necessity, zinc supplementation]
7. WATER & HYGIENE CONTAINMENT: [safe water boiling/chlorination, hand hygiene, isolation]
8. DISCLAIMER: Always conclude with an urgent medical disclaimer emphasizing that cholera can be fatal within hours without rehydration.`;

// ----------------------------------------------------------------
// 3. PROMPT TEMPLATES
// ----------------------------------------------------------------
export const choleraAssessmentPrompt = ChatPromptTemplate.fromMessages([
  ["system", CHOLERA_SYSTEM_PROMPT],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
]);

export const choleraClassificationPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a cholera outbreak risk and dehydration severity classifier. Analyze the reported symptoms, clinical signs, and environmental context. Return ONLY a valid JSON object.
    
    Return this exact JSON structure:
    {{
      "riskLevel": "LOW" | "MEDIUM" | "HIGH",
      "confidenceScore": <number between 0 and 1>,
      "detectedSymptoms": ["symptom1", "symptom2"],
      "dehydrationLevel": "NONE" | "SOME" | "SEVERE",
      "choleraRiskScore": <number 0-10 based on severity of dehydration and classic cholera presentation>,
      "fastScore": <number 0-4 matching number of critical cholera danger signs detected>,
      "requiresEmergency": <boolean, true if severe dehydration, shock, or high cholera risk>,
      "recommendation": "<one sentence clear actionable life-saving recommendation>"
    }}
    
    Do not include any markdown backticks or commentary outside the JSON object.`,
  ],
  ["human", "Patient symptoms & environmental indicators: {symptoms}"],
]);

// ----------------------------------------------------------------
// 4. OUTPUT PARSERS & HELPERS
// ----------------------------------------------------------------
export const stringParser = new StringOutputParser();

export interface CholeraRiskAssessmentResult {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  confidenceScore: number;
  detectedSymptoms: string[];
  dehydrationLevel: "NONE" | "SOME" | "SEVERE";
  choleraRiskScore: number;
  fastScore: number;
  requiresEmergency: boolean;
  recommendation: string;
}

export const choleraSymptomLabels: Record<string, string> = {
  profuse_watery_diarrhea: "Profuse watery diarrhea (rice-water stool)",
  severe_vomiting: "Severe effortless vomiting",
  dehydration_sunken_eyes: "Sunken eyes and dry mucous membranes",
  skin_pinch_tenting: "Loss of skin elasticity (skin pinch tenting >2s)",
  muscle_cramps: "Severe painful muscle / leg cramps",
  rapid_weak_pulse: "Rapid, weak or faint radial pulse",
  extreme_thirst: "Excessive or unquenchable thirst",
  lethargy_weakness: "Extreme lethargy, confusion or weakness",
  low_urine: "Little to no urination (oliguria)",
  nausea: "Nausea and abdominal discomfort",
};

export type RiskAssessmentResult = CholeraRiskAssessmentResult;

export const parseCholeraJson = (text: string): CholeraRiskAssessmentResult => {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      riskLevel: parsed.riskLevel || "MEDIUM",
      confidenceScore: typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : 0.75,
      detectedSymptoms: Array.isArray(parsed.detectedSymptoms) ? parsed.detectedSymptoms : [],
      dehydrationLevel: parsed.dehydrationLevel || (parsed.riskLevel === "HIGH" ? "SEVERE" : "SOME"),
      choleraRiskScore: typeof parsed.choleraRiskScore === "number" ? parsed.choleraRiskScore : (parsed.riskLevel === "HIGH" ? 8 : 4),
      fastScore: typeof parsed.fastScore === "number" ? parsed.fastScore : (parsed.riskLevel === "HIGH" ? 3 : 1),
      requiresEmergency: Boolean(parsed.requiresEmergency ?? (parsed.riskLevel === "HIGH")),
      recommendation: parsed.recommendation || "Seek prompt medical care and begin Oral Rehydration Salts (ORS) immediately.",
    };
  } catch {
    return {
      riskLevel: "MEDIUM",
      confidenceScore: 0.6,
      detectedSymptoms: ["Watery diarrhea"],
      dehydrationLevel: "SOME",
      choleraRiskScore: 5,
      fastScore: 2,
      requiresEmergency: false,
      recommendation: "Begin oral rehydration solution (ORS) immediately and visit the nearest health clinic.",
    };
  }
};

// ----------------------------------------------------------------
// 5. RUNNABLE CHAINS
// ----------------------------------------------------------------
export const choleraAssessmentChain = RunnableSequence.from([
  choleraAssessmentPrompt,
  groqModel,
  stringParser,
]);

export const choleraClassificationChain = RunnableSequence.from([
  choleraClassificationPrompt,
  groqFastModel,
  stringParser,
]);

// ----------------------------------------------------------------
// 6. TYPES
// ----------------------------------------------------------------
export interface AssessmentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamCholeraAssessmentParams {
  symptoms: string;
  chatHistory?: AssessmentMessage[];
  patientAge?: number;
  patientGender?: string;
  district?: string;
  waterSource?: string;
}

export type StreamAssessmentParams = StreamCholeraAssessmentParams;

export function formatChatHistory(
  chatHistory: AssessmentMessage[],
): BaseMessage[] {
  return chatHistory.map((msg) =>
    msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content),
  );
}

// ----------------------------------------------------------------
// 7. CORE SERVER FUNCTIONS
// ----------------------------------------------------------------

/**
 * Stream a comprehensive Cholera Outbreak & Clinical Assessment
 */
export async function streamCholeraAssessment({
  symptoms,
  chatHistory = [],
  patientAge,
  patientGender,
  district,
  waterSource,
}: StreamCholeraAssessmentParams): Promise<AsyncIterable<string>> {
  const contextualInput = `
    ${patientAge ? `Patient Age: ${patientAge}` : ""}
    ${patientGender ? `Patient Gender: ${patientGender}` : ""}
    ${district ? `District / Location: ${district}` : ""}
    ${waterSource ? `Primary Water Source: ${waterSource}` : ""}
    Reported Symptoms & Observations: ${symptoms}
    Please analyze these symptoms for cholera risk, dehydration severity, and provide life-saving rehydration protocols.
  `.trim();

  const formattedHistory = formatChatHistory(chatHistory);

  return choleraAssessmentChain.stream({
    input: contextualInput,
    chat_history: formattedHistory,
  });
}

/**
 * Backward compatibility alias
 */
export const streamStrokeAssessment = streamCholeraAssessment;

/**
 * Structured JSON risk classification for Cholera & Dehydration
 */
export async function classifyCholeraRisk(
  symptoms: string,
  district?: string,
  waterSource?: string,
): Promise<CholeraRiskAssessmentResult> {
  try {
    const input = [
      symptoms,
      district ? `District: ${district}` : "",
      waterSource ? `Water source: ${waterSource}` : "",
    ].filter(Boolean).join(" | ");

    const result = await choleraClassificationChain.invoke({ symptoms: input });
    return parseCholeraJson(result);
  } catch (error) {
    console.error("[Cholera AI Classification Error]:", error);
    return {
      riskLevel: "MEDIUM",
      confidenceScore: 0.5,
      detectedSymptoms: ["Watery diarrhea"],
      dehydrationLevel: "SOME",
      choleraRiskScore: 5,
      fastScore: 2,
      requiresEmergency: false,
      recommendation:
        "Unable to complete AI triage. Begin Oral Rehydration Solution (ORS) immediately and visit the nearest Cholera Treatment Center.",
    };
  }
}

/**
 * Backward compatibility alias
 */
export const classifyStrokeRisk = classifyCholeraRisk;

/**
 * Predict regional outbreak risk from environmental and surveillance indicators
 */
export function calculateEnvironmentalOutbreakRisk(params: {
  waterContaminationLevel: string; // SAFE, MODERATE, HIGH, CRITICAL
  chlorineResidual?: number | null; // mg/L (< 0.2 is high risk)
  sanitationScore?: number | null; // 0-100 (< 50 is poor)
  rainfallMm?: number | null; // rainfall > 30mm increases runoff/contamination
  floodRisk?: boolean;
}): {
  riskScore: number; // 0 - 100
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  alertMessage: string;
} {
  let score = 20;

  switch (params.waterContaminationLevel.toUpperCase()) {
    case "CRITICAL":
      score += 45;
      break;
    case "HIGH":
      score += 35;
      break;
    case "MODERATE":
      score += 20;
      break;
    case "SAFE":
      score -= 10;
      break;
  }

  if (typeof params.chlorineResidual === "number") {
    if (params.chlorineResidual < 0.2) score += 20;
    else if (params.chlorineResidual >= 0.5) score -= 15;
  }

  if (typeof params.sanitationScore === "number") {
    if (params.sanitationScore < 40) score += 20;
    else if (params.sanitationScore > 75) score -= 10;
  }

  if (typeof params.rainfallMm === "number" && params.rainfallMm > 25) {
    score += 15;
  }

  if (params.floodRisk) {
    score += 20;
  }

  const normalizedScore = Math.min(Math.max(Math.round(score), 5), 98);
  const riskLevel = normalizedScore >= 70 ? "HIGH" : normalizedScore >= 40 ? "MEDIUM" : "LOW";

  const alertMessage =
    riskLevel === "HIGH"
      ? "CRITICAL OUTBREAK HAZARD: Elevated water contamination and environmental vulnerability detected. Issue public boil-water advisory and mobilize chlorination teams immediately."
      : riskLevel === "MEDIUM"
        ? "MODERATE RISK: Water safety or environmental factors show heightened cholera risk. Intensify monitoring and household water treatment."
        : "LOW RISK: Environmental water safety parameters are currently within acceptable limits.";

  return {
    riskScore: normalizedScore,
    riskLevel,
    alertMessage,
  };
}

/**
 * Get recommendation copy + metadata for a given cholera risk level
 */
export function getCholeraRiskRecommendation(riskLevel: "LOW" | "MEDIUM" | "HIGH"): {
  message: string;
  action: string;
  color: string;
  urgent: boolean;
} {
  const recommendations = {
    HIGH: {
      message:
        "⚠️ SEVERE CHOLERA & DEHYDRATION RISK. Proceed immediately to the nearest Cholera Treatment Center (CTC) or Emergency Hospital. Administer Oral Rehydration Salts (ORS) continuously en route. IV fluid resuscitation may be required.",
      action: "EMERGENCY_REHYDRATION_TRANSFER",
      color: "red",
      urgent: true,
    },
    MEDIUM: {
      message:
        "⚡ MODERATE CHOLERA RISK DETECTED. Start drinking Oral Rehydration Salts (ORS) solution immediately (1 cup after every loose stool). Visit a health clinic or dispensary today for medical evaluation.",
      action: "START_ORS_AND_CLINIC_VISIT",
      color: "orange",
      urgent: true,
    },
    LOW: {
      message:
        "ℹ️ LOW CHOLERA RISK. Maintain strict hydration with clean, boiled or chlorinated water and ORS. Practice thorough handwashing with soap. If diarrhea increases or vomiting occurs, seek medical attention.",
      action: "MONITOR_HYDRATION_AND_HYGIENE",
      color: "green",
      urgent: false,
    },
  };

  return recommendations[riskLevel];
}

/**
 * Backward compatibility alias
 */
export const getRiskRecommendation = getCholeraRiskRecommendation;
