import * as crypto from 'crypto';

export class FilesystemUtils {
  static generateChecksum(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  }

  static getSafeTempFileName(prefix: string): string {
    const randomStr = crypto.randomBytes(8).toString('hex');
    return `${prefix}_${randomStr}.tmp`;
  }
}
