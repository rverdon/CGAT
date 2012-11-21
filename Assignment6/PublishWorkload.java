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

import org.json.JSONException;
import org.json.JSONObject;

import com.couchbase.client.CouchbaseClient;
import net.spy.memcached.internal.GetFuture;
import net.spy.memcached.internal.OperationFuture;

/**
 * This one measures fetching a complete user's profile.
 */
public class PublishWorkload extends Workload {
   //private static final int TIMES = 1000000;
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
      /*

      Random rand = new Random(4);

      annotationIdList = new ArrayList<String>(TIMES);
      userIdList = new ArrayList<String>(TIMES);

      for (int repeat = 0; repeat < TIMES; repeat++) {
         annotationIdList.add(String.format("Annotations-%d", rand.nextInt(1000)));
         userIdList.add(String.format("Users-%d", rand.nextInt(100)));
      }
      */
   }

   protected Stats executeCouchImpl() {
      /*
      JSONObject userJSON = null, annotationJSON = null, contigJSON = null;

      for (int iter_ndx = 0; iter_ndx < TIMES; iter_ndx++) {
         Object user = client.get(userIdList.get(iter_ndx));
         Object annotation = client.get(annotationIdList.get(iter_ndx));

         try {
            userJSON = new JSONObject(user.toString());
            annotationJSON = new JSONObject(annotation.toString());

            int contigId = annotationJSON.getInt("contig_id");
            Object contig = client.get("Contigs-" + String.valueOf(contigId));
            contigJSON = new JSONObject(contig.toString());
         }
         catch (Exception ex) {
            System.err.println("Error in PublishWorkload Couchbase code: " + ex);
            System.exit(1);
         }

         //TODO: Still need to increase the experience gained in user meta
         //table as well as add annotation to user history?
      }

      return new Stats();
      */
      throw new UnsupportedOperationException();
   }
}
