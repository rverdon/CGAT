-- Get all users, let groupId = 1, contigId = 2
REPLACE INTO Tasks (UserId, ContigId, Description, EndDate)
SELECT UserId, 2, 'desc', '2012-12-12'
FROM GroupMembership
WHERE GroupId = 1;
