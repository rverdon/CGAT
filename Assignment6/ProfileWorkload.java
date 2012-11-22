import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * This one measures fetching a complete user's profile.
 */
public class ProfileWorkload extends Workload {
   private static final int MAX_USERS = 100000;

   //private static final int TIMES = 1000000;
   private static final int TIMES = 1;

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
      super.initCouch();
      Random rand = new Random(4);

      for (int i = 0; i < TIMES; i++) {
         userIds[i] = "" + (rand.nextInt(MAX_USERS) + 1);
      }
   }

   protected void cleanupCouch() {
      super.cleanupCouch();

      userIds = null;
   }

   protected Stats executeCouchImpl() {
      String data = null;
      JSONObject jsonUser = null;
      JSONArray groups = null;
      JSONArray history = null;
      JSONArray partials = null;
      JSONArray tasks = null;

      // THis shouldn't even be necessary, but I am being neurotic.
      Object throwAway = null;

      for (int i = 1; i <= TIMES; i++) {
         try {
            // I saw the api just casting, so I will too.
            data = (String)client.get("Users-" + i);
            //TEST
            System.out.println(data);

            jsonUser = new JSONObject(data);

            // Expand groups
            groups = jsonUser.getJSONArray("groups");
            for (int j = 0; j < groups.length(); j++) {
               String groupId = groups.getString(j);

               // The next step would be trivial, get the groups name form the JSON.
               throwAway = client.get("Groups-" + groupId);

               //TEST
               System.out.println(throwAway);
            }

            // Expand history
            history = jsonUser.getJSONArray("history");
            for (int j = 0; j < history.length(); j++) {
               JSONObject historyJson = history.getJSONObject(j);
               String annotationId = historyJson.getString("anno_id");

               throwAway = client.get("Annotations-" + annotationId);

               //TEST
               System.out.println(throwAway);
            }

            // Expand partials
            partials = jsonUser.getJSONArray("incomplete_annotations");
            for (int j = 0; j < partials.length(); j++) {
               String annotationId = partials.getString(j);

               throwAway = client.get("Annotations-" + annotationId);

               //TEST
               System.out.println(throwAway);
            }

            // Expand tasks
            tasks = jsonUser.getJSONArray("tasks");
            for (int j = 0; j < tasks.length(); j++) {
               JSONObject taskJson = tasks.getJSONObject(j);
               String contigId = taskJson.getString("contig_id");

               throwAway = client.get("Contigs-" + contigId);

               //TEST
               System.out.println(throwAway);
            }
         } catch (JSONException jsonEx) {
            System.err.println("Error parsing json (" + data + "): " + jsonEx);
            jsonEx.printStackTrace(System.err);
         } catch (Exception ex) {
            System.err.println("Error fetching profile: " + ex);
            ex.printStackTrace(System.err);
         }
      }

      return new Stats();
   }
}
