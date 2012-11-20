import java.sql.Connection;
import java.sql.DriverManager;

/**
 * The base class for all workloads.
 */
public abstract class Workload {
   protected Connection conn;

   // See if we can get a clean connection.
   public static void main(String[] args) {
      Connection conn;

      try {
         // Instantiate the DB Driver
         Class.forName("com.mysql.jdbc.Driver");

         conn = DriverManager.getConnection(TestMaster.DB_URL, TestMaster.DB_USER,
                                            TestMaster.DB_PASS);
      } catch (Exception ex) {
         System.err.println("Failed to get the DB Connection.: " + ex);
         throw new RuntimeException();
      }
   }

   /**
    * Do the assigned workload using the MySQL Cluster.
    */
   public Stats executeMySQL() {
      initMySQL();

      long startTime = System.currentTimeMillis();
      Stats stats = executeMySQLImpl();
      long finalTime = System.currentTimeMillis();

      stats.setRunningTime(finalTime - startTime);

      cleanupMySQL();

      return stats;
   }

   /**
    * Do the assigned workload using the CouchDB Cluster.
    */
   public Stats executeCouch() {
      initCouch();

      long startTime = System.currentTimeMillis();
      Stats stats = executeCouchImpl();
      long finalTime = System.currentTimeMillis();

      stats.setRunningTime(finalTime - startTime);

      cleanupCouch();

      return stats;
   }

   protected void cleanupMySQL() {
      try {
         conn.close();
         conn = null;
      } catch (Exception ex) {
         System.err.println("Error closing the connection.");
      }

      System.gc();
   }

   /**
    * Do ehatever setup must be done to initialize the sql version of the workload.
    */
   protected void initMySQL() {
      try {
         // Instantiate the DB Driver
         Class.forName("com.mysql.jdbc.Driver");

         conn = DriverManager.getConnection(TestMaster.DB_URL, TestMaster.DB_USER,
                                            TestMaster.DB_PASS);
      } catch (Exception ex) {
         System.err.println("Failed to get the DB Connection.: " + ex);
         throw new RuntimeException();
      }
   }

   protected void cleanupCouch() {
   }

   /**
    * The actual work for the Mysql.
    */
   protected abstract Stats executeMySQLImpl();

   /**
    * Do ehatever setup must be done to initialize the Couch version of the workload.
    */
   protected abstract void initCouch();

   /**
    * The actual work for the CouchDB.
    */
   protected abstract Stats executeCouchImpl();
}
