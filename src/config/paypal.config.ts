import { registerAs } from "@nestjs/config";

export default registerAs('paypal', () => ({
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  onboardReturnUrl: process.env.PAYPAL_ONBOARD_RETURN_URL,
}))