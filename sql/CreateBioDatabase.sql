
DROP TABLE Users;
CREATE TABLE Users (
   UserId INT UNSIGNED NOT NULL AUTO_INCREMENT,
   FirstName VARCHAR(20) NOT NULL,
   LastName VARCHAR(40) NOT NULL,
   UserName VARCHAR(40) NOT NULL,
   Email VARCHAR(60) NOT NULL,
   Pass VARCHAR(64) NOT NULL,
   Salt VARCHAR(64) NOT NULL,
   LastLoginDate DATETIME NOT NULL,
   RegistrationDate DATETIME NOT NULL,
   Level INT NOT NULL,
   Role VARCHAR(10) NOT NULL,
   Exp INT NOT NULL,
   PRIMARY KEY ( UserId )
);

DROP TABLE Groups;
CREATE TABLE Groups (
   GroupId INT UNSIGNED NOT NULL AUTO_INCREMENT,
   Name VARCHAR(80) NOT NULL,
   GroupDescription TEXT NOT NULL,
   CreateDate DATETIME NOT NULL,
   PRIMARY KEY ( GroupId )
);

DROP TABLE Contigs;
CREATE TABLE Contigs (
   ContigId INT UNSIGNED NOT NULL AUTO_INCREMENT,
   Name VARCHAR(40) NOT NULL,
   Difficulty FLOAT NOT NULL,
   Sequence TEXT NOT NULL,
   UploaderId INT UNSIGNED NOT NULL,
   Source VARCHAR(20) NOT NULL,
   Species VARCHAR(100) NOT NULL,
   Status VARCHAR(20) NOT NULL,
   CreateDate DATETIME NOT NULL,
   PRIMARY KEY ( ContigId )
);

DROP TABLE GroupMembership;
CREATE TABLE GroupMembership (
   GroupId INT UNSIGNED NOT NULL,
   UserId INT UNSIGNED NOT NULL,
   PRIMARY KEY ( GroupId, UserId )
);

DROP TABLE Tasks;
CREATE TABLE Tasks (
   UserId INT UNSIGNED NOT NULL,
   ContigId INT UNSIGNED NOT NULL,
   Description TEXT NOT NULL,
   EndDate DATETIME NOT NULL,
   UNIQUE(UserId, ContigId),
   INDEX(UserId)
);

DROP TABLE Annotations;
CREATE TABLE Annotations (
   AnnotationId INT UNSIGNED NOT NULL AUTO_INCREMENT,
   GeneId INT NOT NULL,
   StartPos INT UNSIGNED NOT NULL,
   EndPos INT UNSIGNED NOT NULL,
   ReverseComplement BOOL NOT NULL,
   PartialSubmission BOOL NOT NULL,
   ExpertSubmission BOOL NOT NULL,   
   ContigId INT UNSIGNED NOT NULL,
   UserId INT UNSIGNED NOT NULL,
   CreateDate DATETIME NOT NULL,
   LastModifiedDate DATETIME NOT NULL,
   FinishedDate DATETIME NOT NULL,
   Incorrect BOOL NOT NULL,
   ExpertIncorrect BOOL NOT NULL,
   ExpGained INT NOT NULL,
   PRIMARY KEY ( AnnotationId ),
   INDEX(UserId)
);

DROP TABLE Exons;
CREATE TABLE Exons (
   ExonId INT UNSIGNED NOT NULL AUTO_INCREMENT,
   StartPos INT UNSIGNED NOT NULL,
   EndPos INT UNSIGNED NOT NULL,
   AnnotationId INT NOT NULL,
   PRIMARY KEY ( ExonId )
);

DROP TABLE GeneNames;
CREATE TABLE GeneNames (
   GeneId INT NOT NULL AUTO_INCREMENT,
   Name VARCHAR(255) NOT NULL,
   PRIMARY KEY ( GeneId )
);


DROP TABLE CollabAnnotations;
CREATE TABLE CollabAnnotations (
   CollabAnnotationId INT UNSIGNED NOT NULL AUTO_INCREMENT,
   GeneId INT NOT NULL,
   StartPos INT UNSIGNED NOT NULL,
   EndPos INT UNSIGNED NOT NULL,
   ReverseComplement BOOL NOT NULL,  
   ContigId INT UNSIGNED NOT NULL,
   CreateDate DATETIME NOT NULL,
   LastModifiedDate DATETIME NOT NULL,
   PRIMARY KEY ( AnnotationId ),
   INDEX(UserId)
);

DROP TABLE CollabExons;
CREATE TABLE CollabExons (
   ExonId INT UNSIGNED NOT NULL AUTO_INCREMENT,
   StartPos INT UNSIGNED NOT NULL,
   EndPos INT UNSIGNED NOT NULL,
   CollabAnnotationId INT NOT NULL,
   PRIMARY KEY ( ExonId )
);
