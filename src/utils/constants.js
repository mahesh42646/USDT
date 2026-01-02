// Platform Constants (fallback values - use useSettings() hook for dynamic values)
export const PLATFORM_NAME = 'GroandInvest';
export const PLATFORM_DESCRIPTION = 'USDT-based investment platform with referral system';
export const PLATFORM_TAGLINE = 'Invest in USDT, Earn Daily Rewards';

// Helper function to get platform name from settings or fallback
export const getPlatformName = (settings) => {
  return settings?.appName || PLATFORM_NAME;
};

// Contact Information
export const CONTACT_EMAIL = 'support@groandinvest.com';
export const CONTACT_PHONE = '+1 (555) 123-4567';

// Social Media Links (update with actual links when available)
export const SOCIAL_LINKS = {
  facebook: '#',
  twitter: '#',
  linkedin: '#',
};

