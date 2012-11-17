import java.util.Collections;
import java.util.List;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Helper for stuff and things.
 */
public class Util {
   /**
    * Don't be an ass and pass in an empty list.
    */
   public static AverageStats averageStats(List<Long> numbers) {
      double min = Double.MAX_VALUE;
      double max = Double.MIN_VALUE;
      double mean = 0;

      Collections.sort(numbers);
      for (Number num : numbers) {
         if (num.doubleValue() < min) {
            min = num.doubleValue();
         }

         if (num.doubleValue() > max) {
            max = num.doubleValue();
         }

         mean += num.doubleValue();
      }

      mean /= numbers.size();
      double median = numbers.size() % 2 == 0 ?
            (numbers.get(numbers.size() / 2).doubleValue() +
               numbers.get(numbers.size() / 2 - 1).doubleValue()) / 2
            : numbers.get((int)(numbers.size() / 2)).doubleValue();

      double stdDev = 0;
      for (Number num : numbers) {
         stdDev += Math.pow(num.doubleValue() - mean, 2);
      }
      stdDev = Math.sqrt(stdDev / numbers.size());

      return new AverageStats(min, max, mean, median, stdDev);
   }

   public static boolean doUpdate(Connection conn, String update) {
      Statement statement = null;
      boolean rtn = false;

      try {
         // Get a statement from the connection
         statement = conn.createStatement();

         // Execute the update
         statement.executeUpdate(update);

         rtn = true;
      } catch (Exception ex) {
         System.err.println("Error doing update: " + ex);
         ex.printStackTrace(System.err);
         rtn = false;
      } finally {
         try {
            if (statement != null) {
               statement.close();
               statement = null;
            }
         } catch (SQLException sqlEx) {
            // ... oh well.
            System.err.println("Error Closing results.");
         }
      }

      return rtn;
   }

   // The results will still be fetched so the driver doesn't try any crafty lazy fetching.
   public static boolean doThrowAwayResultsQuery(Connection conn, String query) {
      Statement statement = null;
      ResultSet results = null;
      boolean rtn = false;

      try {
         // Get a statement from the connection
         statement = conn.createStatement();

         // Execute the query
         results = statement.executeQuery(query);

         int colCount = results.getMetaData().getColumnCount();
         String resultString;

         if (results.next()) {
            do {
               for (int index = 1; index <= colCount; index++) {
                  resultString = results.getString(index);
               }
            } while (results.next());
         }

         rtn = true;
      } catch (Exception ex) {
         System.err.println("Error doing query: " + ex);
         ex.printStackTrace(System.err);
         rtn = false;
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

      return rtn;
   }


   public static boolean doStringListQuery(Connection conn, String query, String[] resultArray) {
      Statement statement = null;
      ResultSet results = null;
      boolean rtn = false;

      try {
         // Get a statement from the connection
         statement = conn.createStatement();

         // Execute the query
         results = statement.executeQuery(query);

         if (results.next()) {
            int count = 0;
            do {
               resultArray[count++] = results.getString(1);
            } while (results.next());
         }

         rtn = true;
      } catch (Exception ex) {
         System.err.println("Error doing query: " + ex);
         ex.printStackTrace(System.err);
         rtn = false;
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

      return rtn;
   }

   public static class AverageStats {
      public double min;
      public double max;
      public double mean;
      public double median;
      public double stdDev;

      public AverageStats(double min, double max, double mean,
                          double median, double stdDev) {
         this.min = min;
         this.max = max;
         this.mean = mean;
         this.median = median;
         this.stdDev = stdDev;
      }
   }
}
