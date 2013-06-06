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
 * This one measures assigning a task to an arbitraty group.
 * This is pretty much exacly a 50% R/W Workload.
 *
 * Note: GroupIds range from (1, 100).
 */
public class AssignTaskWorkload extends Workload {
   // Should be no more than 100000 (the number of users in the db).
   // DON'T TOUCH THIS NUMBER. I need to keep it consistent for testing. -Eriq
   private static final int TIMES = 100000;
   //private static final int TIMES = 1;

   private static final int MAX_GROUP_ID = 100;

   private static final String DESCRIPTION = "Some task description.";
   private static final String DATE = "2012-12-12";
   private static final int CONTIG_ID = 2;

   private DBCollection contigColl;
   private DBCollection annotationColl;
   private DBCollection userColl;
   private DBCollection groupColl;

   private Random rand;

   /**
    * Fetch the user ids here, and preserve the connection.
    */
   public AssignTaskWorkload() {
      rand = new Random(4);
   }

   protected Stats executeMySQLImpl() {
      String assignTaskInsert = String.format("REPLACE INTO Tasks (UserId, ContigId, Description, EndDate)" +
                                              " SELECT UserId, %d, '%s', '%s'" +
                                              " FROM GroupMembership" +
                                              " WHERE GroupId = %%d",
                                              CONTIG_ID, DESCRIPTION, DATE);

      for (int i = 0; i < TIMES; i++) {
         Util.doUpdate(conn, String.format(assignTaskInsert, (rand.nextInt() % MAX_GROUP_ID) + 1));
      }

      return new Stats();
   }

   protected Stats executeCouchImpl() {
      String data = null;
      JSONObject jsonUser = null;
      JSONObject jsonGroup = null;
      JSONArray users = null;

      JSONObject task = new JSONObject();
      try {
         // Since the rest of the db stringifys their numbers, stringify this.
         task.put("contig_id", "" + CONTIG_ID);
         task.put("end_date", DATE);
         task.put("desc", DESCRIPTION);
      } catch (JSONException ex) {
         System.err.println("Error creating core task object.");
         ex.printStackTrace(System.err);
         return null;
      }

      for (int i = 1; i <= TIMES; i++) {
         try {
            data = (String)client.get("Groups-" + (rand.nextInt(MAX_GROUP_ID) + 1));
            jsonGroup = new JSONObject(data);
            users = jsonGroup.getJSONArray("users");

            // assign the task to every user in the group we randomly selected
            for (int j = 0; j < users.length(); j++) {
               String userId = users.getJSONObject(j).getString("user_id");

               jsonUser = new JSONObject((String)client.get("Users-" + userId));
               // Update the user's tasks.
               jsonUser.put("tasks", jsonUser.getJSONArray("tasks").put(task));

               // Rewrite the user.
               client.set("Users-" + userId, 0, jsonUser.toString());
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

      contigColl = db.getCollection("contigs");
      annotationColl = db.getCollection("annotations");
      userColl = db.getCollection("users");
      groupColl = db.getCollection("groups");
   }

   protected void cleanupMongo() {
      super.cleanupMongo();
   }
  
   protected Stats executeMongoImpl() {
      DBObject jsonUser = null;
      DBObject jsonGroup = null;
      List<String> users = null;
      ArrayList<DBObject> tasks = null;

      BasicDBObject task = new BasicDBObject();
      
      // Since the rest of the db stringifys their numbers, stringify this.
      task.put("contig_id", "" + CONTIG_ID);
      task.put("end_date", DATE);
      task.put("desc", DESCRIPTION);

      for (int i = 1; i <= TIMES; i++) {
         try {
            BasicDBObject groupQuery = new BasicDBObject("group_id", "" + (rand.nextInt(MAX_GROUP_ID) + 1));
            DBCursor gcursor = groupColl.find(groupQuery, new BasicDBObject("users", 1));
 
            jsonGroup = gcursor.next(); 

            users = (List<String>)jsonGroup.get("users");
          
            userColl.update(new BasicDBObject("user_id", new BasicDBObject("$in", users)),
                            new BasicDBObject("$push", new BasicDBObject("tasks",task)));

         } catch (Exception ex) {
            System.err.println("Error fetching profile: " + ex);
            ex.printStackTrace(System.err);
         }
      }
      return new Stats();
   }
}
