export class UserAgent {
  public static getOS(): string {
    const ua: string = window.navigator.userAgent.toLowerCase();
    if (ua.indexOf('windows nt') !== -1) return 'Windows OS';
    if (ua.indexOf('android') !== -1) return 'Android OS';
    if (ua.indexOf('iphone') !== -1 || ua.indexOf('ipad') !== -1) return 'iOS';
    if (ua.indexOf('mac os x') !== -1) return 'Mac OS';
    return 'unknown OS';
  }
  public static getBrowser(): string {
    const userAgent: string = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('msie') !== -1 || userAgent.indexOf('trident') !== -1) return 'Internet Explorer';
    if (userAgent.indexOf('edge') !== -1) return 'Microsoft Edge';
    if (userAgent.indexOf('chrome') !== -1) return 'Chromium Browser';
    if (userAgent.indexOf('safari') !== -1) return 'Safari';
    if (userAgent.indexOf('firefox') !== -1) return 'Firefox';
    if (userAgent.indexOf('opera') !== -1) return 'Opera';
    return 'Unknown Browser';
  }
};
