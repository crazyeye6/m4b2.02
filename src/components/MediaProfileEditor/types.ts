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
  'Business', 'Marketing', 'Finance & Investing', 'Entrepreneurship',
  'Technology', 'AI & Data', 'E-commerce & Retail', 'Creator Economy',
  'Health & Wellness', 'Fitness & Sport', 'Food & Drink', 'Travel & Lifestyle',
  'Fashion & Beauty', 'Climate & Sustainability', 'Real Estate', 'Crypto & Web3',
  'Education', 'Personal Finance', 'HR & Careers', 'Politics & News',
  'Science & Research', 'Design & UX', 'Dev & Engineering', 'Gaming',
  'Entertainment & Culture', 'Parenting & Family', 'Religion & Faith', 'Other',
];

export const GEOGRAPHIES = ['Global', 'US', 'UK', 'US / UK', 'Europe', 'Canada', 'Australia', 'Asia', 'APAC', 'LATAM', 'Middle East', 'Other'];

export const AUDIENCE_TYPES = ['B2B', 'B2C', 'Founders / Operators', 'Investors', 'Developers', 'Consumers', 'Mixed', 'Other'];

export const FREQUENCIES = ['Daily', 'Weekdays', '3x / week', 'Weekly', 'Bi-weekly', 'Monthly'];

export const AD_FORMAT_OPTIONS = [
  'Featured sponsor (top)', 'Banner + mention', 'Dedicated send', 'Native ad / sponsored content',
  'Footer sponsor', 'Solo blast', 'Social shoutout', 'Classified ad',
];
