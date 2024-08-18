import axiosInstance from "./axios";

export class AuthApiServices {
  static verifyEmail = async ({ email }) => {
    try {
      const res = await axiosInstance.post("/email-verify", {
        email: email,
      });

      return {
        data: res.data,
        error: false,
      };
    } catch (err) {
      return {
        data: err?.response?.data,
        error: true,
      };
    }
  };

  static removeAccount = async ({ email }) => {
    try {
      const res = await axiosInstance.post("/remove-email", {
        email: email,
      });

      return {
        data: res.data,
        error: false,
      };
    } catch (err) {
      return {
        data: err?.response?.data,
        error: true,
      };
    }
  };

  static resendVerificationEmail = async ({ email }) => {
    try {
      const res = await axiosInstance.post("/resend-verification-email", {
        email: email,
      });

      return {
        data: res.data,
        error: false,
      };
    } catch (err) {
      return {
        data: err?.response?.data,
        error: true,
      };
    }
  };
}
