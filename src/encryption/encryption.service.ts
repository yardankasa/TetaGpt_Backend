import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;
  private readonly salt: string = 'H2wXJeDJsZMWosj93OMtxNrVKcoJF7KS'; // این را در .env قرار دهید
  private readonly ivLength = 16;
  private readonly authTagLength = 16;
  private readonly algorithm = 'aes-256-gcm';

  constructor() {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret) {
      throw new Error('ENCRYPTION_SECRET is not set in environment variables');
    }
    this.key = scryptSync(secret, this.salt, 32);
  }

  encrypt(text: string): string {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('hex');
  }

  decrypt(encryptedText: string): string {
    try {
      const data = Buffer.from(encryptedText, 'hex');
      const iv = data.slice(0, this.ivLength);
      const authTag = data.slice(this.ivLength, this.ivLength + this.authTagLength);
      const encrypted = data.slice(this.ivLength + this.authTagLength);

      const decipher = createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    } catch (error) {
      // اگر رمزگشایی با خطا مواجه شد، یک خطای مشخص برگردانید
      throw new Error('Decryption failed. Invalid data or key.');
    }
  }
}
