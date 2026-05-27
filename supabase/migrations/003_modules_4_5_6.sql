-- ══════════════════════════════════════════════════════════════════════
-- Migration 003 — Modules 4, 5 & 6 + Full Scenario Seeding
-- Project: CyberSense — Cybersecurity Awareness Training Against
--          Cyberbullying for University Students
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New Query → paste → Run
--
-- WHAT THIS DOES:
--   Part A  Migrates hardcoded Module 1/2/3 scenarios into the DB
--   Part B  Inserts new Module 4, 5 & 6 rows into modules table
--   Part C  Inserts 5 scenarios for Module 4 (Chat Simulator)
--   Part D  Inserts 5 scenarios for Module 5 (Rapid Sorter)
--   Part E  Inserts 3 scenarios for Module 6 (Network Defense)
-- ══════════════════════════════════════════════════════════════════════


-- ── PART A: Seed existing Module 1 scenarios (Chat Simulator) ────────
-- Guards with WHERE NOT EXISTS so it is safe to re-run.

INSERT INTO public.scenarios
  (module_id, sender_name, message_text,
   choice_1_text, choice_1_correct, choice_1_title, choice_1_body,
   choice_2_text, choice_2_correct, choice_2_title, choice_2_body)
SELECT * FROM (VALUES

  (1, 'AnonymousHater99',
   'You''re so pathetic. Everyone in your batch is laughing at your presentation today. Delete your account before I leak your embarrassing photos.',
   '1. Reply angrily and demand to know who they are.',
   false,
   '<span style=''color:#ff003c;''>ESCALATION</span>',
   'Engaging with cyberbullies gives them exactly what they want: a reaction. It usually escalates the harassment.',
   '2. Do not reply. Take a screenshot, and block the account.',
   true,
   '<span style=''color:#00ff66;''>CORRECT PROTOCOL</span>',
   'Perfect. Documenting evidence and cutting off communication removes the bully''s power immediately.'
  ),

  (1, 'BestFriend (New Number)',
   'Hey! I got locked out of my main IG. Can you send me the verification code that just went to your phone so I can get back in?',
   '1. Send the code. They are my best friend.',
   false,
   '<span style=''color:#ff003c;''>ACCOUNT HIJACKED</span>',
   'This is an impersonation attack. By sending the code, you just allowed a hacker to bypass 2FA and hijack YOUR account.',
   '2. Call your friend directly on their normal number to verify.',
   true,
   '<span style=''color:#00ff66;''>THREAT EVADED</span>',
   'Excellent. Always verify out-of-band when someone asks for sensitive security codes.'
  ),

  (1, 'Gossip Channel',
   'OMG! Is this a video of YOU at the campus party last night?? 😱 Look: <span style="color:#ff003c;text-decoration:underline;">http://campus-gossip-leaks.com/video49</span>',
   '1. Click the link to see what the video is about.',
   false,
   '<span style=''color:#ff003c;''>MALWARE INFECTION</span>',
   'Cyberbullies often use gossip or fake leak links to phish credentials or drop malware onto your device.',
   '2. Ignore the link and report the channel for bullying.',
   true,
   '<span style=''color:#00ff66;''>SAFE</span>',
   'Great decision. You avoided a phishing trap disguised as social drama.'
  ),

  (1, 'Unknown Contact',
   'I know where you live. I have your address and I am going to post it publicly online unless you send RM500 to my crypto wallet.',
   '1. Do not reply, save the evidence, and report to authorities/police.',
   true,
   '<span style=''color:#00ff66;''>CRISIS AVERTED</span>',
   'This is a severe Doxxing and Blackmail threat. Always involve the authorities rather than paying scammers.',
   '2. Pay the RM500 so they don''t post your address.',
   false,
   '<span style=''color:#ff003c;''>EXTORTION FAILED</span>',
   'Paying extortionists never guarantees they will delete the data. It only marks you as a willing target for future attacks.'
  ),

  (1, 'Library Wifi (Admin)',
   'Your browsing history violates university policy. We will notify your faculty dean unless you click here to verify your identity.',
   '1. Click to verify. I don''t want to get in trouble.',
   false,
   '<span style=''color:#ff003c;''>PHISHED</span>',
   'This is a fear-based social engineering attack. Official networks will never threaten you via text message to verify identity.',
   '2. Delete the message. It is a fear-based scam.',
   true,
   '<span style=''color:#00ff66;''>THREAT NEUTRALIZED</span>',
   'Spot on. Scammers use authority and fear to bypass your critical thinking.'
  )

) AS v(module_id, sender_name, message_text,
       choice_1_text, choice_1_correct, choice_1_title, choice_1_body,
       choice_2_text, choice_2_correct, choice_2_title, choice_2_body)
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE module_id = 1);


-- ── PART A cont.: Seed existing Module 2 scenarios (Rapid Sorter) ────

INSERT INTO public.scenarios_sorter (module_id, scenario_text, is_threat)
SELECT * FROM (VALUES
  (2, 'Anonymous Comment: ''Go k1ll yourself, nobody likes you.''', true),
  (2, 'WhatsApp Group: ''Hey guys, are we still meeting at the library for the group study today?''', false),
  (2, 'DM: ''I have private photos of you. Send me RM500 via crypto or I am posting them to Twitter.''', true),
  (2, 'Email from University Library: ''Reminder: Your borrowed textbook is due tomorrow.''', false),
  (2, 'Text: ''OMG look at what Sarah just posted about you on TikTok! Click here to see: [fake-link.com]''', true)
) AS v(module_id, scenario_text, is_threat)
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios_sorter WHERE module_id = 2);


-- ── PART A cont.: Seed existing Module 3 scenarios (Network Defense) ─

INSERT INTO public.scenarios_defense
  (module_id, threat_text, correct_node, correct_tool, feedback_text)
SELECT * FROM (VALUES
  (3, 'A stranger is sending harassing DMs on Instagram.',
   'ig', 'block',
   'Correct! Use Block & Report on Instagram to stop the harasser.'),
  (3, 'Someone is trying to brute-force your WhatsApp account.',
   'wa', 'mfa',
   'Correct! Enable 2FA/MFA on your WhatsApp to prevent unauthorised access.'),
  (3, 'Your campus email appears in a data breach. Strangers can find your profile.',
   'email', 'privacy',
   'Correct! Adjust Privacy Settings to limit exposure of your email data.')
) AS v(module_id, threat_text, correct_node, correct_tool, feedback_text)
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios_defense WHERE module_id = 3);


-- ══════════════════════════════════════════════════════════════════════
-- PART B: Insert Modules 4, 5 & 6
-- All three modules are scoped to: cyberbullying awareness for
-- university students, covering social engineering, phishing embedded
-- in harassment, and personal data protection.
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO public.modules (title, description, game_mode, question_limit, status)
VALUES
  (
    'Social Engineering & Impersonation',
    'Recognise phishing and impersonation attacks disguised as classmate or lecturer messages in a university setting.',
    'chat', 5, 'active'
  ),
  (
    'Cyberbullying Threat Classifier',
    'Rapidly classify university campus messages as cyberbullying threats or safe communications.',
    'sorter', 5, 'active'
  ),
  (
    'Campus Account Shield',
    'Apply the correct security tool to defend your university social media and academic accounts from bullying-based attacks.',
    'defense', 3, 'active'
  );


-- ══════════════════════════════════════════════════════════════════════
-- PART C: Module 4 — Social Engineering & Impersonation (Chat Simulator)
--
-- Focus: Social engineering attacks that use impersonation of people
-- within the university ecosystem (classmates, lecturers, admins) to
-- manipulate students — a common cyberbullying tactic.
-- SA Level: Perception (spotting the red flag) + Comprehension (why it works)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO public.scenarios
  (module_id, sender_name, message_text,
   choice_1_text, choice_1_correct, choice_1_title, choice_1_body,
   choice_2_text, choice_2_correct, choice_2_title, choice_2_body)
VALUES

  -- Scenario 4.1: Fake lecturer asking for student portal credentials
  (
    (SELECT id FROM public.modules WHERE title = 'Social Engineering & Impersonation' LIMIT 1),
    'Dr. Hafiz (Lecture Group)',
    'Hi, I need to access your student portal submission to re-grade it due to a system error. Please reply with your student ID and portal password so I can log in on your behalf.',
    '1. Send the details. My lecturer needs access for my grade.',
    false,
    '<span style=''color:#ff003c;''>CREDENTIALS STOLEN</span>',
    'Lecturers never require your password to access your submissions — they have admin-level access already. This is social engineering exploiting fear of academic consequences.',
    '2. Decline politely. Tell them to use the official grade appeal process.',
    true,
    '<span style=''color:#00ff66;''>SOCIAL ENGINEERING BLOCKED</span>',
    'Well done. No legitimate university staff will ever ask for your password. If there is a system error, it is handled by the IT department — not through your credentials.'
  ),

  -- Scenario 4.2: Classmate impersonation to obtain embarrassing photos
  (
    (SELECT id FROM public.modules WHERE title = 'Social Engineering & Impersonation' LIMIT 1),
    'Amirah_0192 (Classmate)',
    'Heyy, someone in our WhatsApp group is spreading edited photos of you. They sent me the folder link — want me to forward it to you? Just send me your Google Drive access so we can delete the files together.',
    '1. Send the Google access. I want those photos removed immediately.',
    false,
    '<span style=''color:#ff003c;''>ACCOUNT HIJACKED</span>',
    'This is a fear-based impersonation attack. The threat of embarrassing content creates panic that bypasses your critical thinking. A classmate has no legitimate reason to need your Google credentials.',
    '2. Do not share any credentials. Report the situation to your university counselor and IT department.',
    true,
    '<span style=''color:#00ff66;''>MANIPULATION RESISTED</span>',
    'Correct. Cyberbullies use the threat of leaked content to pressure victims into handing over account access. You cannot share your way out of a doxxing threat — escalate to authorities instead.'
  ),

  -- Scenario 4.3: Fake Student Affairs email demanding personal info
  (
    (SELECT id FROM public.modules WHERE title = 'Social Engineering & Impersonation' LIMIT 1),
    'student-affairs@mmu-portal.online',
    'Dear Student, Your MMU scholarship is at risk due to a discrepancy in your records. You must verify your full IC number, home address, and phone number within 48 hours at this link to avoid cancellation.',
    '1. Fill in the form immediately. I cannot afford to lose my scholarship.',
    false,
    '<span style=''color:#ff003c;''>IDENTITY THEFT</span>',
    'The email domain "mmu-portal.online" is NOT an official MMU domain (mmu.edu.my). You just submitted your IC, address and phone — enough for identity fraud. Always check the sender domain first.',
    '2. Ignore the link. Visit the official MMU student portal directly to verify your scholarship status.',
    true,
    '<span style=''color:#00ff66;''>PHISHING EVADED</span>',
    'Smart call. Urgency plus personal data requests are hallmarks of identity phishing. Always verify through official channels, not links in unsolicited emails.'
  ),

  -- Scenario 4.4: Fake campus survey that harvests credentials
  (
    (SELECT id FROM public.modules WHERE title = 'Social Engineering & Impersonation' LIMIT 1),
    'Campus Feedback System',
    'You have been selected to rate your lecturer anonymously. Your opinion is 100% confidential. Please log in with your student portal credentials to submit: <span style="color:#ff003c;text-decoration:underline;">mmu-feedback-survey.com/login</span>',
    '1. Log in and fill the survey. It is anonymous so it is safe.',
    false,
    '<span style=''color:#ff003c;''>CREDENTIALS HARVESTED</span>',
    'The domain "mmu-feedback-survey.com" is a fake lookalike site — not an official MMU domain. Legitimate university surveys never require your student portal password.',
    '2. Do not log in. Report the link to your university IT security team.',
    true,
    '<span style=''color:#00ff66;''>CREDENTIAL HARVEST BLOCKED</span>',
    'Correct. Fake survey pages that mimic your university portal are a common credential-harvesting tactic. The dead giveaway: a legitimate survey would never need your login password.'
  ),

  -- Scenario 4.5: Fake group admin demanding phone number
  (
    (SELECT id FROM public.modules WHERE title = 'Social Engineering & Impersonation' LIMIT 1),
    'FYP Group Admin (Razif)',
    'Hi everyone, I am updating the group contact list for the department. Please reply with your full name, current phone number, and IC number so we can keep the record accurate for our faculty.',
    '1. Reply with the information. It is just for the department record.',
    false,
    '<span style=''color:#ff003c;''>PERSONAL DATA EXPOSED</span>',
    'Collecting IC numbers via WhatsApp message is never a legitimate university procedure. This data can be used for identity theft, SIM-swapping, or targeted harassment. Department records are handled through official HR/admin systems.',
    '2. Do not share. Contact the real group admin through a verified channel to check if this request is genuine.',
    true,
    '<span style=''color:#00ff66;''>DATA PROTECTED</span>',
    'Good judgement. Even if the requestor seems trustworthy, sensitive personal data (IC number, phone) should never be shared over informal channels. Always verify the request out-of-band.'
  );


-- ══════════════════════════════════════════════════════════════════════
-- PART D: Module 5 — Cyberbullying Threat Classifier (Rapid Sorter)
--
-- Focus: University campus communications — classify as cyberbullying
-- threat or safe message. Builds Perception-level Situation Awareness
-- around the linguistic patterns of online aggression among students.
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO public.scenarios_sorter (module_id, scenario_text, is_threat)
VALUES
  -- Threat: exclusion and group shaming
  (
    (SELECT id FROM public.modules WHERE title = 'Cyberbullying Threat Classifier' LIMIT 1),
    'WhatsApp Group: ''Everyone vote — should we remove Aiman from the FYP group? He is dragging us all down and is too stupid to contribute.''',
    true
  ),
  -- Safe: academic coordination
  (
    (SELECT id FROM public.modules WHERE title = 'Cyberbullying Threat Classifier' LIMIT 1),
    'Discord: ''Hey team, I just pushed the updated slides to the shared folder. Can everyone review by tonight before our meeting?''',
    false
  ),
  -- Threat: targeted doxxing threat
  (
    (SELECT id FROM public.modules WHERE title = 'Cyberbullying Threat Classifier' LIMIT 1),
    'Instagram DM: ''I found your home address and your parents'' phone numbers. Keep quiet about what you saw or I will post everything in our faculty group.''',
    true
  ),
  -- Safe: normal campus notice
  (
    (SELECT id FROM public.modules WHERE title = 'Cyberbullying Threat Classifier' LIMIT 1),
    'Faculty Email: ''Reminder — the Moodle quiz for CSC3024 closes on Friday at 11:59 PM. Please submit before the deadline.''',
    false
  ),
  -- Threat: impersonation + humiliation link
  (
    (SELECT id FROM public.modules WHERE title = 'Cyberbullying Threat Classifier' LIMIT 1),
    'Telegram: ''I made a poll rating the most embarrassing students in your batch. You''re ranked #1 lol 😂 Vote here: [rate-my-classmates.net]''',
    true
  );


-- ══════════════════════════════════════════════════════════════════════
-- PART E: Module 6 — Campus Account Shield (Network Defense)
--
-- Focus: Applying the correct cybersecurity tool to protect university
-- student social media and academic accounts from bullying-based attacks.
-- Uses same nodes as Module 3 (ig, wa, email) — no code changes needed.
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO public.scenarios_defense
  (module_id, threat_text, correct_node, correct_tool, feedback_text)
VALUES
  (
    (SELECT id FROM public.modules WHERE title = 'Campus Account Shield' LIMIT 1),
    'A group of classmates created a fake Instagram account using your photo and name to post embarrassing content about you to your university peers.',
    'ig', 'block',
    'Correct! Use Block & Report on Instagram to take down the impersonation account. Meta''s report system can remove fake accounts that impersonate real users.'
  ),
  (
    (SELECT id FROM public.modules WHERE title = 'Campus Account Shield' LIMIT 1),
    'Someone is attempting to hijack your WhatsApp account by repeatedly requesting the 6-digit SMS verification code, then calling you to pressure you into reading it aloud.',
    'wa', 'mfa',
    'Correct! Enable Two-Step Verification (2FA) on WhatsApp immediately. This adds a PIN that prevents account takeover even if someone intercepts your SMS code.'
  ),
  (
    (SELECT id FROM public.modules WHERE title = 'Campus Account Shield' LIMIT 1),
    'A cyberbully found your campus email address and full name by searching your publicly visible university profile page, and is now sending targeted harassment emails.',
    'email', 'privacy',
    'Correct! Adjust Privacy Settings on your university profile to limit what personal information is publicly searchable. Reducing your digital footprint cuts off the bully''s ability to find and target you.'
  );


-- ══════════════════════════════════════════════════════════════════════
-- END OF MIGRATION 003
-- After running:
--   • 3 new active modules appear on /admin/modules (IDs 4, 5, 6)
--   • Modules 1/2/3 scenarios are also seeded in the DB (future dynamic use)
--   • All content is scoped to: cyberbullying + university students
--   • Module 6 uses existing ig/wa/email nodes (no code changes needed)
-- ══════════════════════════════════════════════════════════════════════
