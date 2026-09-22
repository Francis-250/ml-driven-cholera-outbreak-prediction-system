import dns from "node:dns";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore in environments where not supported
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async ({ to, subject, html, text }: EmailOptions) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail =
      process.env.BREVO_SENDER_EMAIL ?? process.env.BREVO_EMAIL_USER;
    const senderName = process.env.BREVO_SENDER_NAME || "ML-Driven Cholera Outbreak Prediction System";

    if (!apiKey) {
      console.error("Email error: BREVO_API_KEY is not configured");
      return false;
    }

    if (!senderEmail) {
      console.error("Email error: BREVO_SENDER_EMAIL is not configured");
      return false;
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        ...(text ? { textContent: text } : {}),
      }),
    });

    const responseText = await response.text();
    let responseBody: unknown = responseText;

    try {
      responseBody = responseText ? JSON.parse(responseText) : null;
    } catch {
      // Brevo can return a non-JSON proxy response.
    }

    if (!response.ok) {
      console.error("Brevo email error:", {
        status: response.status,
        response: responseBody,
      });
      return false;
    }

    console.log("Email sent to:", to);
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};

export const sendEmailOrThrow = async (options: EmailOptions) => {
  const sent = await sendEmail(options);

  if (!sent) {
    throw new Error("Email delivery failed. Check the Brevo sender configuration.");
  }
};

export const sendStaffAlertEmail = async ({
  patientName,
  assessmentId,
  riskLevel,
  confidenceScore,
  district,
}: {
  patientName: string;
  assessmentId: string;
  riskLevel: string;
  confidenceScore: number;
  district?: string;
}) => {
  const alertEmail =
    process.env.STAFF_ALERT_EMAIL ||
    process.env.BREVO_EMAIL_USER ||
    process.env.BREVO_SENDER_EMAIL;

  if (!alertEmail) {
    return false;
  }

  return sendEmail({
    to: alertEmail,
    subject: `[CHOLERA OUTBREAK ALERT] High-risk case reported: ${patientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px;">
        <h2 style="color: #b91c1c;">⚠️ High-Risk Cholera Case Alert</h2>
        <p>A high-risk cholera / severe dehydration report has been registered and requires immediate surveillance staff validation.</p>
        <p><strong>Case Subject / Reporter:</strong> ${patientName}</p>
        ${district ? `<p><strong>District / Hotspot:</strong> ${district}</p>` : ""}
        <p><strong>Risk Level:</strong> <span style="color: #dc2626; font-weight: bold;">${riskLevel}</span></p>
        <p><strong>Prediction Confidence:</strong> ${Math.round(confidenceScore * 100)}%</p>
        <p><strong>Case ID:</strong> ${assessmentId}</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="font-size: 12px; color: #6b7280;">ML-Driven Cholera Outbreak Prediction System - Rapid Surveillance Unit</p>
      </div>
    `,
  });
};

export const sendAssessmentResultEmail = async ({
  to,
  patientName,
  riskLevel,
  confidenceScore,
  recommendation,
}: {
  to: string;
  patientName: string;
  riskLevel: string;
  confidenceScore: number;
  recommendation: string;
}) => {
  return sendEmail({
    to,
    subject: `Your Cholera Symptom Assessment Result: ${riskLevel} Risk`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <h2>Cholera Assessment & Rehydration Guidance</h2>
        <p>Hello ${patientName},</p>
        <p>Your cholera symptom assessment has been processed by our AI prediction system.</p>
        <p><strong>Calculated Risk Level:</strong> <strong>${riskLevel}</strong></p>
        <p><strong>Confidence:</strong> <strong>${Math.round(confidenceScore * 100)}%</strong></p>
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0;">
          <p style="margin: 0; font-weight: 500;">Actionable Recommendation:</p>
          <p style="margin: 5px 0 0 0;">${recommendation}</p>
        </div>
        <p style="font-size: 13px; color: #475569;">
          <strong>Important Life-Saving Note:</strong> If you or the patient experience severe watery diarrhea, drink Oral Rehydration Salts (ORS) solution immediately after every loose stool. Visit the nearest health center without delay.
        </p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #94a3b8; font-size: 11px;">ML-Driven Cholera Outbreak Prediction System</p>
      </div>
    `,
  });
};

