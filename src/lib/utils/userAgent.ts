export class UserAgent {
  public static getOS(): string {
    const ua: string = window.navigator.userAgent.toLowerCase();
    if (ua.indexOf('windows nt') !== -1) return 'Windows OS';
    if (ua.indexOf('android') !== -1) return 'Android OS';
    if (ua.indexOf('iphone') !== -1 || ua.indexOf('ipad') !== -1) return 'iOS';
    if (ua.indexOf('mac os x') !== -1) return 'Mac OS';
    return 'Unknown OS';
  }
  public static getBrowser(): string {
    const ua: string = window.navigator.userAgent.toLowerCase();
    if (ua.indexOf('msie') !== -1 || ua.indexOf('trident') !== -1) return 'Internet Explorer';
    if (ua.indexOf('edge') !== -1) return 'Microsoft Edge';
    if (ua.indexOf('chrome') !== -1) return 'Chromium Browser';
    if (ua.indexOf('safari') !== -1) return 'Safari';
    if (ua.indexOf('firefox') !== -1) return 'Firefox';
    if (ua.indexOf('opera') !== -1) return 'Opera';
    return 'Unknown Browser';
  }
};
