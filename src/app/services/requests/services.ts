export const latency = 50;

const mapping: string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");

export function decode(encode: string) : string {
  let decoded: number[] = [];

  for(let i = 0; i < 4; i++) {
    const i1 = encode.charAt(i * 2), i2 = encode.charAt(i * 2 + 1);

    if(i1 != undefined && i2 != undefined)
      decoded.push(mapping.indexOf(i1) * 10 + mapping.indexOf(i2))
  }

  return decoded.join(".")
}

export function getWS(code: string) : string {
  return `ws://${code}:7777`;
}
