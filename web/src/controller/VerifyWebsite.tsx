import prisma from "@/lib/prisma";

type VerificationData = {
  verificationToken: string;
};

/**
 * Verifies that a website exists in the database using its unique verification token.
 * Throws an error if the token is not found.
 */
export async function verifyWebsite({ verificationToken }: VerificationData) {
  if (!verificationToken) {
    throw new Error("Verification token is required.");
  }

  const website = await prisma.websites.findUnique({
    where: {
      verification_token: verificationToken,
    },
  });

  if (!website) {
    // This is a critical security check.
    throw new Error("Invalid verification token.");
  }

  return website;
}
