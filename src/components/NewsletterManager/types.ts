export interface NewsletterFormData {
  name: string;
  publisher_name: string;
  subscriber_count: string;
  avg_open_rate: string;
  niche: string;
  primary_geography: string;
  send_frequency: string;
  description: string;
  website_url: string;
}

export const NEWSLETTER_NICHES = [
  'B2B SaaS', 'Marketing', 'Finance', 'Fintech', 'Startup', 'Tech', 'AI',
  'eCommerce', 'Health & Wellness', 'Fitness', 'Food', 'Travel', 'Fashion & Beauty',
  'Education', 'Crypto', 'Investing', 'Real Estate', 'Climate', 'Sports', 'Entertainment',
  'Creator Economy', 'HR & People', 'Product', 'Design', 'Dev & Engineering', 'True Crime',
  'Comedy', 'Business', 'News', 'Science', 'History', 'Other',
];

export const SEND_FREQUENCIES = [
  'Daily', '3x per week', 'Twice weekly', 'Weekly', 'Bi-weekly', 'Monthly',
];

export const GEOGRAPHIES = [
  'US', 'UK', 'US / UK', 'Ireland / UK / US', 'UK / Europe', 'Europe',
  'Global', 'APAC', 'LATAM', 'Canada', 'Australia', 'Middle East',
];

export const BLANK_FORM: NewsletterFormData = {
  name: '',
  publisher_name: '',
  subscriber_count: '',
  avg_open_rate: '',
  niche: '',
  primary_geography: '',
  send_frequency: '',
  description: '',
  website_url: '',
};
