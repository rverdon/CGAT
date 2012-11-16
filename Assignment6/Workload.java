/**
 * The base class for all workloads.
 */
public abstract class Workload {
   /**
    * Do the assigned workload using the MySQL Cluster.
    */
   public Stats executeMySQL() {
      long startTime = System.currentTimeMillis();
      Stats stats = executeMySQLImpl();
      long finalTime = System.currentTimeMillis();

      stats.setRunningTime(finalTime - startTime);

      return stats;
   }

   /**
    * Do the assigned workload using the CouchDB Cluster.
    */
   public Stats executeCouch() {
      long startTime = System.currentTimeMillis();
      Stats stats = executeCouchImpl();
      long finalTime = System.currentTimeMillis();

      stats.setRunningTime(finalTime - startTime);

      return stats;
   }

   /**
    * The actual work for the Mysql.
    */
   protected abstract Stats executeMySQLImpl();

   /**
    * The actual work for the CouchDB.
    */
   protected abstract Stats executeCouchImpl();
}
