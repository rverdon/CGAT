SELECT * FROM Users u WHERE UserId = 1;

-- Group Membership
SELECT *
FROM GroupMembership gm JOIN Groups g USING (GroupId)
WHERE UserId = 1;

-- History
SELECT a.AnnotationId, a.StartPos, a.EndPos, a.ReverseComplement, a.ExpertSubmission, a.CreateDate, a.LastModifiedDate, a.FinishedDate, a.Incorrect, a.ExpertIncorrect, a.ExpGained,
       c.Name, c.Difficulty, c.UploaderId, c.Source, c.Species, c.Status, c.CreateDate,
       g.Name
FROM Annotations a JOIN Contigs c USING (ContigId) JOIN GeneNames g USING (GeneId)
WHERE UserId = 1 AND PartialSubmission = FALSE;

-- Incompletes
SELECT a.AnnotationId, a.StartPos, a.EndPos, a.ReverseComplement, a.ExpertSubmission, a.CreateDate, a.LastModifiedDate, a.FinishedDate,
       c.Name, c.Difficulty, c.UploaderId, c.Source, c.Species, c.Status, c.CreateDate,
       g.Name
FROM Annotations a JOIN Contigs c USING (ContigId) JOIN GeneNames g USING (GeneId)
WHERE UserId = 1 AND PartialSubmission = TRUE;

-- Tasks
SELECT t.ContigId, t.Description, t.EndDate,
       c.Name, c.Difficulty, c.UploaderId, c.Source, c.Species, c.Status, c.CreateDate,
       u.UserName as UploaderName
FROM Tasks t JOIN Contigs c USING (ContigId) JOIN Users u on (c.UploaderId = u.UserId)
WHERE t.UserId = 1;
