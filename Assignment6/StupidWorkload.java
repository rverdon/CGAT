import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * This one measures time between reads and writes of the same document.
 * Ryan thinks that it is stupid.
 */
public class StupidWorkload extends Workload {
   //private static final int TIMES = 100000;
   private static final int TIMES = 10;

   private String[] randomStrings;

   /**
    * Do setup in constructor to avoid artifically slowing down the experiment.
    */
   public StupidWorkload() {
      randomStrings = new String[TIMES];

      // Seed it so it is repeatable.
      Random rand = new Random(4);

      for (int i = 0; i < TIMES; i++) {
         randomStrings[i] = "" + rand.nextInt();
      }
   }

   protected Stats executeMySQLImpl() {
      String readQuery = "SELECT name FROM ReadWriteTest WHERE id = 1";
      String writeUpdate = "UPDATE ReadWriteTest SET name = '%s' WHERE id = 1";
      List<Long> readAfterWriteTimes = new ArrayList<Long>(TIMES);
      List<Long> writeAfterReadTimes = new ArrayList<Long>(TIMES);

      Statement statement = null;
      ResultSet results = null;

      try {
         // Get a statement from the connection
         statement = conn.createStatement();

         long time = System.currentTimeMillis();

         for (int i = 0; i < TIMES; i++) {
            results = statement.executeQuery(readQuery);

            if (i != 0) {
               readAfterWriteTimes.add(System.currentTimeMillis() - time);
            }

            time = System.currentTimeMillis();
            statement.executeUpdate(String.format(writeUpdate, randomStrings[i]));
            writeAfterReadTimes.add(System.currentTimeMillis() - time);

            time = System.currentTimeMillis();
         }
      } catch (Exception ex) {
         System.err.println("Error getting read/write times.");
         ex.printStackTrace(System.err);
      } finally {
         try {
            if (results != null) {
               results.close();
               results = null;
            }

            if (statement != null) {
               statement.close();
               statement = null;
            }
         } catch (SQLException sqlEx) {
            // ... oh well.
            System.err.println("Error Closing results.");
         }
      }

      return new ReadWriteStats(readAfterWriteTimes, writeAfterReadTimes);
   }

   protected void initCouch() {
      super.initCouch();

      // Make an initial set of the key.
      client.set("ReadAfterWrite-1", 0, "0");
   }

   protected Stats executeCouchImpl() {
      List<Long> readAfterWriteTimes = new ArrayList<Long>(TIMES);
      List<Long> writeAfterReadTimes = new ArrayList<Long>(TIMES);
      long time = System.currentTimeMillis();
      Object throwAway;

      for (int i = 0; i < TIMES; i++) {
         throwAway = client.get("ReadAfterWrite-1");

         if (i != 0) {
            readAfterWriteTimes.add(System.currentTimeMillis() - time);
         }

         time = System.currentTimeMillis();
         client.set("ReadAfterWrite-1", 0, randomStrings[i]);
         writeAfterReadTimes.add(System.currentTimeMillis() - time);

         time = System.currentTimeMillis();
      }

      return new ReadWriteStats(readAfterWriteTimes, writeAfterReadTimes);
   }
}
