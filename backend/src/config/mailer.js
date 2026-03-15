import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv";

dotenv.config();

// 🔐 Setup Brevo Client
const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// 📩 OTP Email Function
export async function sendOTPEmail(email, otp) {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is missing in environment variables");
    }

    if (!process.env.SMTP_FROM) {
      throw new Error("SMTP_FROM is missing in environment variables");
    }

    const response = await apiInstance.sendTransacEmail({
      sender: {
        name: "GoCart Official",
        email: process.env.SMTP_FROM, // ⚠️ Ye email Brevo me verified hona chahiye
      },
      to: [
        {
          email: email,
        },
      ],
      subject: "GoCart - Your Verification Code",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; color: #333333;">
          
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 40px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            
            <tr>
              <td align="center" style="background-color: #0f172a; padding: 25px 20px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">
                  gocart<span style="color: #4f46e5;">.</span>
                </h1>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="margin-top: 0; font-size: 22px; color: #1e293b; font-weight: 700;">Verify Your Account</h2>
                
                <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 25px;">
                  Hello,<br><br>
                  Thank you for choosing GoCart! To securely access your account, please use the One-Time Password (OTP) provided below.
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                  <span style="display: inline-block; background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px 45px; font-size: 36px; font-weight: 800; color: #4f46e5; letter-spacing: 8px;">
                    ${otp}
                  </span>
                </div>
                
                <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 35px;">
                  ⏳ This code is valid for <strong>10 minutes</strong>.
                </p>
                
                <div style="background-color: #fff1f2; border-left: 4px solid #f43f5e; padding: 15px; border-radius: 4px;">
                  <p style="font-size: 13px; color: #9f1239; margin: 0; line-height: 1.5;">
                    <strong>Security Warning:</strong> Never share this OTP with anyone, including GoCart support staff. If you did not request this code, please ignore this email or change your password immediately.
                  </p>
                </div>
              </td>
            </tr>
            
            <tr>
              <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                  &copy; ${new Date().getFullYear()} GoCart. All rights reserved.<br>
                  This is an automated message, please do not reply to this email.
                </p>
              </td>
            </tr>
            
          </table>
          
        </body>
        </html>
      `,
    });

    console.log("✅ Email sent successfully:", response);
    return true;

  } catch (error) {
    console.error("❌ Brevo Email Error:", error.response?.body || error.message);
    return false;
  }
}