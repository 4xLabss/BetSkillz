import { sign } from 'tweetnacl';
import bs58 from 'bs58';

export class SigninMessage {
  domain: string;
  publicKey: string;
  nonce: string;
  statement?: string;

  constructor(fields: {
    domain: string;
    publicKey: string;
    nonce: string;
    statement?: string;
  }) {
    this.domain = fields.domain;
    this.publicKey = fields.publicKey;
    this.nonce = fields.nonce;
    this.statement = fields.statement;
  }

  /**
   * Create the message string that will be signed by the user's wallet
   */
  prepare(): string {
    const header = `${this.domain} wants you to sign in with your Solana account:`;
    const address = this.publicKey;

    let message = `${header}\n${address}`;

    if (this.statement) {
      message += `\n\n${this.statement}`;
    }

    const fields: string[] = [];

    if (this.nonce) {
      fields.push(`Nonce: ${this.nonce}`);
    }

    if (fields.length > 0) {
      message += `\n\n${fields.join('\n')}`;
    }

    return message;
  }

  /**
   * Verify the signature against the message and public key
   */
  verify(signature: string): boolean {
    try {
      const messageBytes = new TextEncoder().encode(this.prepare());
      const publicKeyBytes = bs58.decode(this.publicKey);
      const signatureBytes = bs58.decode(signature);

      return sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Validate the message fields
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.domain) {
      errors.push('Domain is required');
    }

    if (!this.publicKey) {
      errors.push('Public key is required');
    }

    if (!this.nonce) {
      errors.push('Nonce is required');
    }

    // Validate public key format (Solana public key is 32 bytes, base58 encoded)
    if (this.publicKey) {
      try {
        const decoded = bs58.decode(this.publicKey);
        if (decoded.length !== 32) {
          errors.push('Invalid public key format');
        }
      } catch {
        errors.push('Invalid public key encoding');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
