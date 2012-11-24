import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.Random;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.sql.Date;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.couchbase.client.CouchbaseClient;
import net.spy.memcached.internal.GetFuture;
import net.spy.memcached.internal.OperationFuture;

/**
 * This one measures fetching a complete user's profile.
 */
public class PublishWorkload extends Workload {
   // DON'T TOUCH THIS NUMBER. I need to keep it consistent for testing. -Eriq
   //private static final int TIMES = 100000;
   private static final int TIMES = 10;

   private String[] userIds, annotationIds, exp;
   List<String> annotationIdList, userIdList;

   /**
    * Fetch the user ids here, and preserve the connection.
    */
   public PublishWorkload() {
      userIds = new String[TIMES];
      annotationIds = new String[TIMES];
   }

   private String randQuery(String attr, String table, int numTuples) {
      return String.format("SELECT %s FROM %s ORDER BY RAND(4) LIMIT %d",
                           attr, table, numTuples);
   }

   private static String currDate() {
      SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
      return formatter.format(new Date(System.currentTimeMillis()));
   }

   protected void initMySQL() {
      super.initMySQL();

      String query = randQuery("UserId, AnnotationId", "Annotations", TIMES);
      if (!Util.doStrStrListQuery(conn, query, userIds, annotationIds)) {
         System.err.println("Couldn't get annotation information.");
         throw new RuntimeException();
      }
   }

   protected void cleanupMySQL() {
      super.cleanupMySQL();
      userIds = null;
      annotationIds = null;
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

   protected void initCouch() {
      super.initCouch();

      Random rand = new Random(4);

      annotationIdList = new ArrayList<String>(TIMES);
      userIdList = new ArrayList<String>(TIMES);

      for (int repeat = 0; repeat < TIMES; repeat++) {
         annotationIdList.add(String.format("Annotations-%d", rand.nextInt(1000)));
         userIdList.add(String.format("Users-%d", rand.nextInt(100)));
      }
   }

   protected Stats executeCouchImpl() {
      JSONObject userJSON = null, annotationJSON = null, contigJSON = null;

      for (int iter_ndx = 0; iter_ndx < TIMES; iter_ndx++) {
         String user_id = userIdList.get(iter_ndx);
         String anno_id = annotationIdList.get(iter_ndx);

         /*
          * Retrieve the user and annotation documents. Everything revolves
          * around these (to some extent)
          */
         Object user = client.get(user_id);
         Object annotation = client.get(anno_id);

         try {
            userJSON = new JSONObject(user.toString());
            annotationJSON = new JSONObject(annotation.toString());

            /*###############################################################*/
            //CONTIG DIFFICULTY

            /*
             * Get the contig document based on the contig_id in the annotation
             * document
             */
            String contigId = annotationJSON.getString("contig_id");
            Object contig = client.get("Contigs-" + contigId);
            contigJSON = new JSONObject(contig.toString());

            //Get the difficulty from the contig document
            Integer contigDifficulty = Integer.parseInt(contigJSON.getString("difficulty"));

            /*###############################################################*/
            //USER META

            /*
             * Get the meta object from the user document. This contains the
             * user's total experience
             */
            JSONObject userMeta = new JSONObject(userJSON.getJSONObject("meta"));
            Integer userXP = Integer.parseInt(userMeta.getString("exp"));

            /*
             * The user's total experience is the user's previous experience
             * plus the difficulty of the contig
             */
            int xpTotal = contigDifficulty.intValue() + userXP.intValue();

            //replace the user's experience value in meta with the user's new
            //experience total
            userMeta.put("exp", String.valueOf(xpTotal));

            //replace the user's meta object
            userJSON.put("meta", userMeta);

            /*###############################################################*/
            //USER HISTORY

            /*
             * Add annotation to user history
             */
            JSONArray userHistory = userJSON.getJSONArray("history");

            //build a meta object to add to the user's history array
            JSONObject historyMeta = new JSONObject();
            historyMeta.put("experience_gained", contigDifficulty.toString());
            historyMeta.put("date", this.currDate());

            //add meta object to user's annotation history and the id of the
            //annotation
            JSONObject historyJSON = new JSONObject();

            historyJSON.put("meta", historyMeta);
            historyJSON.put("anno_id", anno_id);

            userHistory.put(historyJSON);

            //re-add the history json to the user's document
            userJSON.put("history", userHistory);

            /*###############################################################*/
            //USER INCOMPLETE ANNOTATIONS

            /*
             * Remove annotation from user's incomplete annotations if it is present
             */
            JSONArray inc_annotations = userJSON.getJSONArray("incomplete_annotations");

            for (int ann_ndx = 0; ann_ndx < inc_annotations.length(); ann_ndx++) {
               String inc_annotation = userHistory.getString(ann_ndx);

               if (annotationIdList.get(iter_ndx).equals(inc_annotation)) {
                  inc_annotations.remove(ann_ndx);
                  break;
               }
            }
            userJSON.put("incomplete_annotations", inc_annotations);

            /*###############################################################*/
            //ANNOTATION META

            /*
             * Modify annotation to be marked as finished.
             */
            JSONObject annotationMeta = annotationJSON.getJSONObject("meta");
            annotationMeta.put("finished", this.currDate());
            annotationMeta.put("last_modified", this.currDate());

            annotationJSON.put("meta", annotationMeta);

            /*###############################################################*/

            /*
             * Overwrite the old user and annotation documents with the updated
             * user and annotation documents
             */
            client.set(user_id, 0, userJSON);
            client.set(anno_id, 0, annotationJSON);
         }
         catch (Exception ex) {
            System.err.println("Error in PublishWorkload Couchbase code: " + ex);
            System.exit(1);
         }

      }

      return new Stats();
   }
}
