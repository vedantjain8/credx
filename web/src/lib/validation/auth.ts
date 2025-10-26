import ValidationError from "../error/validationError";

const EMAIL_REGEX =
  /(?:[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+(?:\.[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9\x2d]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export function ValidatePassword(password: string): boolean {
  // Check if password is empty
  // password length must be between 8 and 24 characters
  // must contain at least one uppercase letter
  // must contain at least one lowercase letter
  // must contain at least one number
  // must contain at least one special character

  if (!password || password.length === 0) {
    throw new ValidationError("Password cannot be empty.");
  }

  if (password.length < 8 || password.length > 24) {
    throw new ValidationError(
      "Password must be between 8 and 24 characters long.",
    );
  }

  if (!/[A-Z]/.test(password)) {
    throw new ValidationError(
      "Password must contain at least one uppercase letter.",
    );
  }

  if (!/[a-z]/.test(password)) {
    throw new ValidationError(
      "Password must contain at least one lowercase letter.",
    );
  }

  if (!/[0-9]/.test(password)) {
    throw new ValidationError("Password must contain at least one number.");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw new ValidationError(
      "Password must contain at least one special character.",
    );
  }

  return true;
}

export function ValidateEmail(email: string): boolean {
  if (!email || email.length === 0) {
    throw new ValidationError("Email cannot be empty.");
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError("Invalid email format.");
  }

  return true;
}
