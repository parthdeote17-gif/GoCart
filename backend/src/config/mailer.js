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
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Verify Your Account</h2>
          <p>Your OTP is:</p>
          <h1 style="color: #4f46e5; letter-spacing: 4px;">${otp}</h1>
          <p>This code is valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully:", response);
    return true;

  } catch (error) {
    console.error("❌ Brevo Email Error:", error.response?.body || error.message);
    return false;
  }
}