export type MediaProfileFormData = {
  newsletter_name: string;
  tagline: string;
  category: string;
  audience_summary: string;
  primary_geography: string;
  audience_type: string;
  subscriber_count: string;
  open_rate: string;
  publishing_frequency: string;
  ad_formats: string[];
  past_advertisers: string;
  media_kit_url: string;
  sample_issue_url: string;
  website_url: string;
  logo_url: string;
};

export const EMPTY_FORM: MediaProfileFormData = {
  newsletter_name: '',
  tagline: '',
  category: '',
  audience_summary: '',
  primary_geography: '',
  audience_type: '',
  subscriber_count: '',
  open_rate: '',
  publishing_frequency: '',
  ad_formats: [],
  past_advertisers: '',
  media_kit_url: '',
  sample_issue_url: '',
  website_url: '',
  logo_url: '',
};

export const CATEGORIES = [
  'SaaS / Tech', 'Marketing', 'Finance / Investing', 'Business / Entrepreneurship',
  'E-commerce / DTC', 'Creator Economy', 'AI / Data', 'Health / Wellness',
  'Climate / Sustainability', 'Real Estate', 'Crypto / Web3', 'General Business', 'Other',
];

export const GEOGRAPHIES = ['Global', 'US', 'UK', 'Europe', 'Canada', 'Australia', 'Asia', 'Latin America', 'Other'];

export const AUDIENCE_TYPES = ['B2B', 'B2C', 'Founders / Operators', 'Investors', 'Developers', 'Consumers', 'Mixed', 'Other'];

export const FREQUENCIES = ['Daily', 'Weekdays', '3x / week', 'Weekly', 'Bi-weekly', 'Monthly'];

export const AD_FORMAT_OPTIONS = [
  'Featured sponsor (top)', 'Banner + mention', 'Dedicated send', 'Native ad / sponsored content',
  'Footer sponsor', 'Solo blast', 'Podcast ad read', 'Social shoutout',
];
