import base64url from "base64url";

export interface TimespanedId {
  salt: string,
  ttl: number
}

export const randomId = (len: number) => {
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return [...Array(len)].map(() => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
};

export const randomTimespanedId = (len: number, lifespan: number) => (
  base64url.encode(JSON.stringify({
    salt: randomId(len),
    ttl: Date.now() + lifespan * 1000
  }))
);

export const decodeTimespanedId = (id: string): TimespanedId => (
  JSON.parse(base64url.decode(id))
);
  