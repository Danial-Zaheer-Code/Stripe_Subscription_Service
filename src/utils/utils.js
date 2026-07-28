import jwt from "jsonwebtoken"
import crypto from "crypto"
export function createToken(tokenPayload, duration, secret) {
    const token = jwt.sign(
        tokenPayload,
        secret,
        { expiresIn: duration }
    );
    return token
}

export function generateOTP() {
    return crypto.randomInt(100000, 1000000).toString();
}

export function hasDaysPast(targetDate, daysThreshold) {
    if(!targetDate) {
        return false;
    }

  const givenDate = new Date(targetDate);
  const currentDate = new Date();
  
  const differenceInMs = currentDate - givenDate;
  const msInADay = 1000 * 60 * 60 * 24;
  const daysPast = Math.floor(differenceInMs / msInADay);
  
  return daysPast >= daysThreshold;
}