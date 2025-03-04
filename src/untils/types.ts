export type JWTPayloadType = {
  id: number;
  role: string;
  name: string;
  email: string;
};

export type AccessTokenType = {
  accessToken: string;
};
