import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * This one measures fetching a complete user's profile.
 */
public class ProfileWorkload extends Workload {
   // Should be no more than 100000 (the number of users in the db).
   private static final int TIMES = 1000000;
   //private static final int TIMES = 1;

   private String[] userIds;

   /**
    * Fetch the user ids here, and preserve the connection.
    */
   public ProfileWorkload() {
      // Keeping as a string to reduce conversion time.
      userIds = new String[TIMES];
   }

   protected void initMySQL() {
      super.initMySQL();

      String query = "SELECT UserId FROM Users ORDER BY RAND(0) LIMIT " + TIMES;
      if (!Util.doStringListQuery(conn, query, userIds)) {
         System.err.println("Couldn't get User ids.");
         throw new RuntimeException();
      }
   }

   protected void cleanupMysql() {
      super.cleanupMySQL();

      userIds = null;
   }

   protected Stats executeMySQLImpl() {
      String userQuery = "SELECT * FROM Users u WHERE UserId = %s";

      String groupsQuery = "SELECT *" +
                          " FROM GroupMembership gm JOIN Groups g USING (GroupId)" +
                          " WHERE UserId = %s";

      String historyQuery = "SELECT a.AnnotationId, a.StartPos, a.EndPos, a.ReverseComplement, a.ExpertSubmission, a.CreateDate, a.LastModifiedDate, a.FinishedDate, a.Incorrect, a.ExpertIncorrect, a.ExpGained," +
                            " c.Name, c.Difficulty, c.UploaderId, c.Source, c.Species, c.Status, c.CreateDate," +
                            " g.Name" +
                            " FROM Annotations a JOIN Contigs c USING (ContigId) JOIN GeneNames g USING (GeneId)" +
                            " WHERE UserId = %s AND PartialSubmission = FALSE";

      String partialsQuery = "SELECT a.AnnotationId, a.StartPos, a.EndPos, a.ReverseComplement, a.ExpertSubmission, a.CreateDate, a.LastModifiedDate, a.FinishedDate," +
                             " c.Name, c.Difficulty, c.UploaderId, c.Source, c.Species, c.Status, c.CreateDate," +
                             " g.Name" +
                             " FROM Annotations a JOIN Contigs c USING (ContigId) JOIN GeneNames g USING (GeneId)" +
                             " WHERE UserId = %s AND PartialSubmission = TRUE";

      String tasksQuery = "SELECT t.ContigId, t.Description, t.EndDate," +
                          " c.Name, c.Difficulty, c.UploaderId, c.Source, c.Species, c.Status, c.CreateDate," +
                          " u.UserName as UploaderName" +
                          " FROM Tasks t JOIN Contigs c USING (ContigId) JOIN Users u on (c.UploaderId = u.UserId)" +
                          " WHERE t.UserId = %s";

      for (int i = 0; i < TIMES; i++) {
         Util.doThrowAwayResultsQuery(conn, String.format(userQuery, userIds[i]));
         Util.doThrowAwayResultsQuery(conn, String.format(groupsQuery, userIds[i]));
         Util.doThrowAwayResultsQuery(conn, String.format(historyQuery, userIds[i]));
         Util.doThrowAwayResultsQuery(conn, String.format(partialsQuery, userIds[i]));
         Util.doThrowAwayResultsQuery(conn, String.format(tasksQuery, userIds[i]));
      }

      return new Stats();
   }

   protected void initCouch() {
   }

   protected Stats executeCouchImpl() {
      // Nope
      throw new UnsupportedOperationException();
   }
}
