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
public class GroupMemWorkload extends Workload {
   // Should be no more than 100000 (the number of users in the db).
   //private static final int TIMES = 1000000;
   private static final int TIMES = 1;

   private String[] userIds;
   private String[] groupIds;

   /**
    * Fetch the user ids here, and preserve the connection.
    */
   public GroupMemWorkload() {
      // Keeping as a string to reduce conversion time.
      userIds = new String[TIMES];
      groupIds = new String[TIMES];
   }

   protected void initMySQL() {
      super.initMySQL();

      String query = "SELECT UserId FROM Users ORDER BY RAND(0) LIMIT " + TIMES;
      if (!Util.doStringListQuery(conn, query, userIds)) {
         System.err.println("Couldn't get User ids.");
         throw new RuntimeException();
      }
      query = "SELECT GroupId FROM Groups ORDER BY RAND(0) LIMIT " + TIMES;
      if (!Util.doStringListQuery(conn, query, groupIds)) {
         System.err.println("Couldn't get Group ids.");
         throw new RuntimeException();
      }
   }

   protected Stats executeMySQLImpl() {
      String deleteGroupQuery = "DELETE GM FROM GroupMembership GM JOIN Users U USING (UserId) JOIN Groups G USING (GroupId) WHERE U.UserId=%s AND G.GroupId=%s";
      String joinGroupQuery = "INSERT IGNORE INTO GroupMembership (UserId, GroupId) VALUES (%s, %s)";

      for (int i = 0; i < TIMES; i++) {
         Util.doUpdate(conn, String.format(deleteGroupQuery, userIds[i], groupIds[i]));
         Util.doUpdate(conn, String.format(joinGroupQuery, userIds[i], groupIds[i]));
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
