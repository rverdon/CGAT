import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.sql.Date;

/**
 * This one measures fetching a complete user's profile.
 */
public class PublishWorkload extends Workload {
   private static final int TIMES = 10000;

   private String[] userIds, annotationIds, exp;

   private Connection conn;

   /**
    * Fetch the user ids here, and preserve the connection.
    */
   public PublishWorkload() {
      userIds = new String[TIMES];
      annotationIds = new String[TIMES];

      try {
         Class.forName("com.mysql.jdbc.Driver");

         conn = DriverManager.getConnection(TestMaster.DB_URL,
                                            TestMaster.DB_USER,
                                            TestMaster.DB_PASS);
      } catch (Exception ex) {
         System.err.println("Failed to get the DB Connection, we are boned.");
         throw new RuntimeException();
      }

      String query = randQuery("UserId, AnnotationId", "Annotations", TIMES);
      if (!Util.doStrStrListQuery(conn, query, userIds, annotationIds)) {
         System.err.println("Couldn't get annotation information.");
         throw new RuntimeException();
      }
   }

   private String randQuery(String attr, String table, int numTuples) {
      return String.format("SELECT %s FROM %s ORDER BY RAND(4) LIMIT %d",
                           attr, table, numTuples);
   }

   private static String currDate() {
      SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
      return formatter.format(new Date(System.currentTimeMillis()));
   }

   protected Stats executeMySQLImpl() {
      String userXPQuery = "UPDATE Users " +
                           "SET Exp = Exp + %s " +
                           "WHERE UserId = %s";

      String annotationUpdateQuery = "UPDATE Annotations " +
                                     "SET PartialSubmission = 0, " +
                                         "FinishedDate = '%s', " +
                                         "ExpGained = %s " +
                                     "WHERE AnnotationId = %s";

      Random rand = new Random();
      for (int i = 0; i < TIMES; i++) {
         String getExpQuery = "SELECT CAST(Difficulty AS UNSIGNED) as Difficulty " +
                              "FROM Contigs join Annotations using (ContigId) " +
                              "WHERE AnnotationId = " + annotationIds[i];

         String annotationExp = Util.doQuery(conn, getExpQuery);
         if (annotationExp != null) {
            Util.doUpdate(conn, String.format(userXPQuery,
                                              annotationExp,
                                              userIds[i]));

            Util.doUpdate(conn, String.format(annotationUpdateQuery,
                                              currDate(),
                                              annotationExp,
                                              annotationIds[i]));
         }
         else { System.err.println("Invalid query"); }
      }

      return new Stats();
   }

   protected Stats executeCouchImpl() {
      // Nope
      throw new UnsupportedOperationException();
   }
}