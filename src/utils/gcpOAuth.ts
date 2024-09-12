import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GCP_CLIENT_ID,
  process.env.GCP_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/gcp/callback`,
  
);

export function getAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/logging.read',
    'https://www.googleapis.com/auth/cloud-platform.read-only'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

export async function getToken(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export { oauth2Client };
