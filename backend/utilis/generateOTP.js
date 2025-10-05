const otpGenerator = require("otp-generator");

function generateOTP() {
  const OTP = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
    alphabets: false,
  });

  return OTP;
}

module.exports = { generateOTP };
