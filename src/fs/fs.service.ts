import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';

@Injectable()
export class FsService {
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // file not found, no action required
        console.log(`deleteFile - File ${filePath} does not exist.`);
      } else {
        throw err;
      }
    }
  }
}
