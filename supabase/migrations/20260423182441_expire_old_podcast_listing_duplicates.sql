/*
  # Expire old duplicate podcast listings

  The original seeded podcast listings (created 2026-04-22) have been superseded by
  richer replacements. Mark them as expired so they no longer appear in the live feed.
  No data is deleted — status is set to 'expired'.
*/

UPDATE listings
SET status = 'expired'
WHERE id IN (
  'e2edbcb4-015c-4c4e-999b-d41f37cb713d',
  'ddd9b1c8-1cca-4d5f-85e4-b2cde9db0c89',
  '42368e3f-c408-4159-ba6b-b8dafc846539',
  'a8699b25-b6e2-4ffc-a49c-dbd0d6d80481',
  'a5e2f2ec-8a00-4306-9e0a-d2019abbd51e',
  '72e6fd11-667a-441c-a1c5-87316cd370ce',
  '6c809693-329b-418a-b588-2ea038d8b093'
);
