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

   private String[] userIds, annotationIds, annotationExp;

   private Connection conn;

   /**
    * Fetch the user ids here, and preserve the connection.
    */
   public PublishWorkload() {
      userIds = new String[TIMES];
      annotationIds = new String[TIMES];
      annotationExp = new String[TIMES];

      try {
         Class.forName("com.mysql.jdbc.Driver");

         conn = DriverManager.getConnection(TestMaster.DB_URL, TestMaster.DB_USER,
                                            TestMaster.DB_PASS);
      } catch (Exception ex) {
         System.err.println("Failed to get the DB Connection, we are boned.");
         throw new RuntimeException();
      }

      String query = randQuery("UserId", "Users", TIMES);
      if (!Util.doStringListQuery(conn, query, userIds)) {
         System.err.println("Couldn't get User ids.");
         throw new RuntimeException();
      }

      query = randQuery("AnnotationId, ExpGained", "Annotations", TIMES);
      if (!Util.doStrStrListQuery(conn, query, annotationIds, annotationExp)) {
         System.err.println("Couldn't get Annotation info.");
         throw new RuntimeException();
      }
   }

   private String randQuery(String attr, String table, int numTuples) {
      return String.format("SELECT %s FROM %s ORDER BY RAND(0) LIMIT %d",
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
                                         "FinishedDate = '%s' " +
                                     "WHERE AnnotationId = %s";

      Random rand = new Random();
      for (int i = 0; i < TIMES; i++) {
         Util.doUpdate(conn, String.format(userXPQuery,
                                           annotationExp[i],
                                           userIds[i]));

         Util.doUpdate(conn, String.format(annotationUpdateQuery,
                                           currDate(),
                                           annotationIds[i]));
      }

      return new Stats();
   }

   protected Stats executeCouchImpl() {
      // Nope
      throw new UnsupportedOperationException();
   }
}
