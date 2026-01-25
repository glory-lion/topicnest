-- Delete the user 'charity' so it can be recreated with a password
DELETE FROM users WHERE username = 'charity';

-- Or to clear all users and start fresh:
-- DELETE FROM users;
