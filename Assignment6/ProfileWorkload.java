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

import com.mongodb.MongoClient;
import com.mongodb.MongoException;
import com.mongodb.WriteConcern;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.DBCursor;
import com.mongodb.ServerAddress;

/**
 * This one measures fetching a complete user's profile.
 */
public class ProfileWorkload extends Workload {
   private static final int MAX_USERS = 100000;

   // DON'T TOUCH THIS NUMBER. I need to keep it consistent for testing. -Eriq
   private static final int TIMES = 100000;
   //private static final int TIMES = 1;

   private String[] userIds;
   private DBCollection contigColl;
   private DBCollection annotationColl;
   private DBCollection userColl;
   private DBCollection groupColl;
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
            jsonUser = new JSONObject(data);

            // Expand groups
            groups = jsonUser.getJSONArray("groups");
            for (int j = 0; j < groups.length(); j++) {
               String groupId = groups.getString(j);

               // The next step would be trivial, get the groups name form the JSON.
               throwAway = client.get("Groups-" + groupId);
            }

            // Expand history
            history = jsonUser.getJSONArray("history");
            for (int j = 0; j < history.length(); j++) {
               JSONObject historyJson = history.getJSONObject(j);
               String annotationId = historyJson.getString("anno_id");

               throwAway = client.get("Annotations-" + annotationId);
            }

            // Expand partials
            partials = jsonUser.getJSONArray("incomplete_annotations");
            for (int j = 0; j < partials.length(); j++) {
               String annotationId = partials.getString(j);

               throwAway = client.get("Annotations-" + annotationId);
            }

            // Expand tasks
            tasks = jsonUser.getJSONArray("tasks");
            for (int j = 0; j < tasks.length(); j++) {
               JSONObject taskJson = tasks.getJSONObject(j);
               String contigId = taskJson.getString("contig_id");

               throwAway = client.get("Contigs-" + contigId);
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

   protected void initMongo() {
      super.initMongo();
      Random rand = new Random(4);

      for (int i = 0; i < TIMES; i++) {
         userIds[i] = "" + (rand.nextInt(MAX_USERS) + 1);
      }

      contigColl = db.getCollection("contigs");
      annotationColl = db.getCollection("annotations");
      userColl = db.getCollection("users");
      groupColl = db.getCollection("groups");
   }

   protected void cleanupMongo() {
      super.cleanupMongo();

      userIds = null;
   }

   protected Stats executeMongoImpl() {
      // THis shouldn't even be necessary, but I am being neurotic.
      Object throwAway = null;

      List<String> groups = null;
      List<DBObject> history = null;
      List<String> partials = null;
      List<DBObject> tasks = null;

      for (int i = 1; i <= TIMES; i++) {
         try {
            BasicDBObject userQuery = new BasicDBObject("user_id", String.valueOf(i));
            DBCursor cursor = userColl.find(userQuery);
 
            DBObject user = cursor.next(); 

            // Expand groups
            groups = (List<String>)user.get("groups");
            BasicDBObject groupQuery = new BasicDBObject("group_id", new BasicDBObject("$in",groups));
            DBCursor gcursor = groupColl.find(groupQuery);

            // Expand history
            history = (List<DBObject>)user.get("history");
            ArrayList<String> aIds = new ArrayList<String>();
            for (int j = 0; j < history.size(); j++) {
               DBObject hist = history.get(j);
               aIds.add((String)hist.get("anno_id"));
            }
            BasicDBObject histQuery = new BasicDBObject("annotation_id", new BasicDBObject("$in", aIds));
            DBCursor hcursor = annotationColl.find(histQuery);

  
            // Expand partials
            partials = (List<String>)user.get("incomplete_annotations");
            BasicDBObject partQuery = new BasicDBObject("annotation_id", new BasicDBObject("$in",partials));
            DBCursor pcursor = annotationColl.find(partQuery);
            

            // Expand tasks
            tasks = (List<DBObject>)user.get("tasks");
            ArrayList<String> cIds = new ArrayList<String>();
            for (int j = 0; j < tasks.size(); j++) {
               DBObject hist = tasks.get(j);
               cIds.add((String)hist.get("contig_id"));
            }

            BasicDBObject meta = new BasicDBObject("meta", 1);
            BasicDBObject conQuery = new BasicDBObject("contig_id", new BasicDBObject("$in",cIds));
            DBCursor ccursor = contigColl.find(conQuery, meta);

         } catch (Exception ex) {
            System.err.println("Error fetching profile: " + ex);
            ex.printStackTrace(System.err);
         }
      }
      throwAway = null;
 
      return new Stats();
   }
}
