declare module 'jsonwebtoken' {
  export function sign(payload: any, secretOrPrivateKey: string | Buffer, options?: any): string;
  export function verify(token: string, secretOrPublicKey: string | Buffer, options?: any): any;
  export function decode(token: string, options?: any): any;
  const jsonwebtoken: {
    sign: typeof sign;
    verify: typeof verify;
    decode: typeof decode;
  };
  export default jsonwebtoken;
}
