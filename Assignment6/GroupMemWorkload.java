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
public class GroupMemWorkload extends Workload {
   // Should be no more than 100000 (the number of users in the db).
   private static final int TIMES = 100000;
   //private static final int TIMES = 1;

   private static final int MAX_GROUP_ID = 100;

   private static final String DESCRIPTION = "Some task description.";
   private static final String DATE = "2012-12-12";
   private static final int CONTIG_ID = 5;

   private String[] userIds;
   private String[] groupIds;
   private Random rand;

   private DBCollection contigColl;
   private DBCollection annotationColl;
   private DBCollection userColl;
   private DBCollection groupColl;
   /**
    * Fetch the user ids here, and preserve the connection.
    */
   public GroupMemWorkload() {
      // Keeping as a string to reduce conversion time.
      userIds = new String[TIMES];
      groupIds = new String[TIMES];
      rand = new Random(4);
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

   protected void cleanupMySQL() {
      super.cleanupMySQL();

      userIds = null;
      groupIds = null;
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

   protected Stats executeCouchImpl() {
      String data = null;
      JSONObject jsonUser = null;
      JSONObject jsonGroup = null;
      JSONArray users = null;
      int groupId = 0;
      JSONObject task = new JSONObject();
      /**try {
         task.put("contig_id", "" + CONTIG_ID);
         task.put("end_date", DATE);
         task.put("desc", DESCRIPTION);
      } catch (JSONException ex) {
         System.err.println("Error creating core task object.");
         ex.printStackTrace(System.err);
         return null;
      }**/

      for (int i = 0; i < TIMES; i++) {
         try {
            //Get a random group from Couchbase
            groupId = rand.nextInt(MAX_GROUP_ID) + 1;
            data = (String)client.get("Groups-" + groupId);
            //Make group into JSON and extract the users from the group
            jsonGroup = new JSONObject(data);
            users = jsonGroup.getJSONArray("users");
            if(0 < users.length()) {
               //Debug System.out.println(users.get(0)); 
               //Remove the first user from that group
               JSONObject removedUser = (JSONObject) users.get(0);
               users.remove(0);
               //Put the modified user list back into the group JSON
               jsonGroup.remove("users");
               jsonGroup.put("users", users);
               //Overwrite the group in Couchbase
               client.set("Groups-" + groupId, 0, jsonGroup.toString());
               //Get the same group back from Couchbase
               data = (String)client.get("Groups-" + groupId);
               //Make group into JSON and extract the users from the group
               jsonGroup = new JSONObject(data);
               users = jsonGroup.getJSONArray("users");
               //Put the user back into the group
               users.put(0, removedUser);
               //Debug users = jsonGroup.getJSONArray("users");
               //Debug System.out.println(users.get(0)); 
               jsonGroup.remove("users");
               jsonGroup.put("users", users);
               //Overwrite the group in Couchbase
               client.set("Groups-" + groupId, 0, jsonGroup.toString());
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
        
      for (int i = 0; i < TIMES; i++) {
         userIds[i] = "" + (rand.nextInt(100000)+1);
         groupIds[i] = "" + (rand.nextInt(100)+1);
      }

      contigColl = db.getCollection("contigs");
      annotationColl = db.getCollection("annotations");
      userColl = db.getCollection("users");
      groupColl = db.getCollection("groups");
   }

   protected void cleanupMongo() {
      super.cleanupMongo();

      userIds = null;
      groupIds = null;
   }


   protected Stats executeMongoImpl() {
      DBObject jsonUser = null;
      DBObject jsonGroup = null;
      ArrayList<String> users = null;

      for (int i = 0; i < TIMES; i++) {
         try {
            BasicDBObject groupQuery = new BasicDBObject("group_id", groupIds[i]);
                 
            groupColl.update(groupQuery, 
                         new BasicDBObject("$pull", new BasicDBObject("users",userIds[i])));

            groupColl.update(new BasicDBObject("group_id", groupIds[TIMES-i-1]), 
                          new BasicDBObject("$push", new BasicDBObject("users",userIds[i]))); 
         } catch (Exception ex) {
            System.err.println("Error fetching profile: " + ex);
            ex.printStackTrace(System.err);
         }
      }
      return new Stats(); 
   }
}
