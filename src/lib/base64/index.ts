import { encode as e } from './encode';
import { decode as d } from './decode';

export default class Base64 {
  public static encode(ab: ArrayBuffer): string {
    return e(ab);
  }
  public static decode(base64Str: string): ArrayBuffer {
    return d(base64Str);
  }
}
