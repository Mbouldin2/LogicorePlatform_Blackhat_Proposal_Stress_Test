import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { sendEmail } from "@/lib/email";

const NOTIFICATION_EMAIL = "nel@strategicvalueplus.com";

interface ContactFormRequest {
  formType: "assessment_request" | "book_call";
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  companySize?: string;
  industry?: string;
  serviceOfInterest?: string;
  message?: string;
  preferredDate?: string;
  preferredTime?: string;
  source?: string;
  pageUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormRequest = await request.json();
    const {
      formType,
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      companySize,
      industry,
      serviceOfInterest,
      message,
      preferredDate,
      preferredTime,
      source = "contact-page",
      pageUrl,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare submission data for Firestore
    const submissionData = {
      formType,
      status: "new" as const,
      firstName,
      lastName,
      email,
      phone: phone || null,
      company: company || null,
      jobTitle: jobTitle || null,
      companySize: companySize || null,
      industry: industry || null,
      serviceOfInterest: serviceOfInterest || null,
      message: message || null,
      preferredDate: preferredDate || null,
      preferredTime: preferredTime || null,
      source,
      pageUrl: pageUrl || null,
      emailSent: false,
      submittedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    let emailSent = false;
    let emailError = "";

    // Send email notification via Resend
    try {
      const subject =
        formType === "book_call"
          ? `New Call Request from ${firstName} ${lastName}`
          : `New Assessment Request from ${firstName} ${lastName}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e293b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .field-label { font-weight: bold; color: #1e293b; }
            .field-value { margin-top: 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${formType === "book_call" ? "New Call Request" : "New Assessment Request"}</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="field-label">Name:</div>
                <div class="field-value">${firstName} ${lastName}</div>
              </div>
              
              <div class="field">
                <div class="field-label">Email:</div>
                <div class="field-value"><a href="mailto:${email}">${email}</a></div>
              </div>
              
              ${phone ? `
              <div class="field">
                <div class="field-label">Phone:</div>
                <div class="field-value">${phone}</div>
              </div>
              ` : ""}
              
              ${company ? `
              <div class="field">
                <div class="field-label">Company:</div>
                <div class="field-value">${company}</div>
              </div>
              ` : ""}
              
              ${jobTitle ? `
              <div class="field">
                <div class="field-label">Job Title:</div>
                <div class="field-value">${jobTitle}</div>
              </div>
              ` : ""}
              
              ${companySize ? `
              <div class="field">
                <div class="field-label">Company Size:</div>
                <div class="field-value">${companySize}</div>
              </div>
              ` : ""}
              
              ${industry ? `
              <div class="field">
                <div class="field-label">Industry:</div>
                <div class="field-value">${industry}</div>
              </div>
              ` : ""}
              
              ${serviceOfInterest ? `
              <div class="field">
                <div class="field-label">Service of Interest:</div>
                <div class="field-value">${serviceOfInterest}</div>
              </div>
              ` : ""}
              
              ${formType === "book_call" && preferredDate ? `
              <div class="field">
                <div class="field-label">Preferred Date:</div>
                <div class="field-value">${preferredDate}</div>
              </div>
              ` : ""}
              
              ${formType === "book_call" && preferredTime ? `
              <div class="field">
                <div class="field-label">Preferred Time:</div>
                <div class="field-value">${preferredTime === "morning" ? "Morning (9am-12pm)" : preferredTime === "afternoon" ? "Afternoon (12pm-5pm)" : preferredTime === "evening" ? "Evening (5pm-7pm)" : preferredTime}</div>
              </div>
              ` : ""}
              
              ${message ? `
              <div class="field">
                <div class="field-label">Message:</div>
                <div class="field-value">${message.replace(/\n/g, "<br>")}</div>
              </div>
              ` : ""}
              
              <div class="footer">
                <p>Submitted from: ${source}${pageUrl ? ` (${pageUrl})` : ""}</p>
                <p>Time: ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await sendEmail({
        to: NOTIFICATION_EMAIL,
        subject,
        html: htmlContent,
        replyTo: email,
      });

      if (!result.success) {
        throw new Error(result.error || "Email send failed");
      }

      emailSent = true;
    } catch (emailErr) {
      console.error("Error sending email:", emailErr);
      emailError =
        emailErr instanceof Error ? emailErr.message : "Unknown error";
    }

    // Store in Firebase
    let docId = "";
    try {
      if (!db) {
        throw new Error("Database not configured");
      }

      const docRef = await addDoc(
        collection(db, COLLECTIONS.CONTACT_FORM_SUBMISSIONS),
        {
          ...submissionData,
          emailSent,
          emailSentAt: emailSent ? Timestamp.now() : null,
          emailError: emailError || null,
        }
      );

      docId = docRef.id;
    } catch (dbErr) {
      console.error("Error storing in Firebase:", dbErr);
      // Don't fail the request if Firebase storage fails, but log it
    }

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
      data: {
        docId,
        emailSent,
      },
    });
  } catch (error) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process form submission" },
      { status: 500 }
    );
  }
}
