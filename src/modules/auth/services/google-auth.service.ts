import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import googleConfiguration from 'src/config/google.config';

@Injectable()
export class GoogleAuthService {
  private readonly client: OAuth2Client;
  private readonly logger = new Logger(GoogleAuthService.name);

  constructor(@Inject(googleConfiguration.KEY) private googleConfig: ConfigType<typeof googleConfiguration>) {
    this.client = new OAuth2Client({
      clientId: googleConfig.clientID,
      clientSecret: googleConfig.clientSecret,
    });
  }

  async verifyToken(token: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.googleConfig.clientID,
      });

      return ticket.getPayload();
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }
}
