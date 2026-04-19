/*
  # Fix mutable search_path on publish_email_slot_to_listing

  ## Security Fix
  - Sets `search_path = ''` on the `publish_email_slot_to_listing` function
  - All table references are fully qualified with the `public.` schema prefix
  - Prevents search_path injection attacks on SECURITY DEFINER functions
*/

CREATE OR REPLACE FUNCTION public.publish_email_slot_to_listing(slot_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
slot_record public.email_submission_slots%ROWTYPE;
new_listing_id uuid;
parsed_subscribers integer;
parsed_original_price integer;
parsed_discount_price integer;
parsed_slots_available integer;
parsed_deadline timestamptz;
BEGIN
SELECT * INTO slot_record
FROM public.email_submission_slots
WHERE id = slot_id;

IF NOT FOUND THEN
RAISE EXCEPTION 'Slot not found: %', slot_id;
END IF;

parsed_subscribers := COALESCE(
NULLIF(regexp_replace(slot_record.audience_size, '[^0-9]', '', 'g'), '')::integer,
0
);

parsed_original_price := COALESCE(
NULLIF(regexp_replace(slot_record.original_price, '[^0-9]', '', 'g'), '')::integer,
0
);

parsed_discount_price := COALESCE(
NULLIF(regexp_replace(slot_record.discount_price, '[^0-9]', '', 'g'), '')::integer,
parsed_original_price
);

parsed_slots_available := COALESCE(
NULLIF(regexp_replace(COALESCE(slot_record.slots_available, '1'), '[^0-9]', '', 'g'), '')::integer,
1
);

parsed_deadline := COALESCE(
NULLIF(slot_record.deadline_date, ''),
(now() + interval '7 days')
)::timestamptz;

INSERT INTO public.listings (
media_type,
media_owner_name,
media_company_name,
property_name,
audience,
location,
subscribers,
open_rate,
slot_type,
date_label,
deadline_at,
original_price,
discounted_price,
slots_remaining,
slots_total,
past_advertisers,
seller_email,
description,
status,
created_at
) VALUES (
COALESCE(NULLIF(lower(slot_record.media_type), ''), 'newsletter'),
COALESCE(NULLIF(slot_record.publisher_name, ''), NULLIF(slot_record.media_name, ''), 'Unknown Publisher'),
COALESCE(NULLIF(slot_record.publisher_name, ''), NULLIF(slot_record.media_name, ''), 'Unknown Publisher'),
COALESCE(NULLIF(slot_record.media_name, ''), 'Unnamed Opportunity'),
COALESCE(NULLIF(slot_record.category, ''), 'General'),
COALESCE(NULLIF(slot_record.geography, ''), 'Global'),
parsed_subscribers,
COALESCE(NULLIF(slot_record.open_rate, ''), NULL),
COALESCE(NULLIF(slot_record.placement_type, ''), COALESCE(NULLIF(slot_record.opportunity_type, ''), 'Sponsored Placement')),
COALESCE(NULLIF(slot_record.send_date, ''), to_char(now() + interval '7 days', 'Day, DD Month YYYY')),
parsed_deadline,
parsed_original_price,
parsed_discount_price,
parsed_slots_available,
parsed_slots_available,
CASE
WHEN slot_record.past_advertisers_text IS NOT NULL AND slot_record.past_advertisers_text <> ''
THEN string_to_array(slot_record.past_advertisers_text, ',')
ELSE ARRAY[]::text[]
END,
COALESCE((
SELECT sender_email FROM public.email_submissions WHERE id = slot_record.submission_id
), ''),
COALESCE(NULLIF(slot_record.description, ''), ''),
'live',
now()
)
RETURNING id INTO new_listing_id;

UPDATE public.email_submission_slots
SET
status = 'published',
listing_id = new_listing_id,
updated_at = now()
WHERE id = slot_id;

RETURN new_listing_id;
END;
$function$;
