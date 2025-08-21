export class SigninMessage {
  domain: string;
  publicKey: string;
  nonce: string;
  statement?: string;

  constructor(domain: string, publicKey: string, nonce: string, statement?: string) {
    this.domain = domain;
    this.publicKey = publicKey;
    this.nonce = nonce;
    this.statement = statement;
  }

  prepare(): string {
    return `${this.domain} wants you to sign in with your Solana account:\n${this.publicKey}${this.statement ? `\n\n${this.statement}` : ''}\n\nNonce: ${this.nonce}`;
  }
}
