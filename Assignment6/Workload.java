import java.util.*;
import java.net.URI;

import java.sql.Connection;
import java.sql.DriverManager;

import com.couchbase.client.CouchbaseClient;

import com.mongodb.MongoClient;
import com.mongodb.MongoException;
import com.mongodb.WriteConcern;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.DBCursor;
import com.mongodb.ServerAddress;
import com.mongodb.ReadPreference;

/**
 * The base class for all workloads.
 */
public abstract class Workload {
   protected Connection conn;
   protected CouchbaseClient client;

   protected MongoClient mongoClient;
   protected DB db;

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

   /**
    * Do whatever setup must be done to initialize the Couch version of the workload.
    */
   protected void initCouch() {
      try {
         List<URI> uris = new LinkedList<URI>();
         uris.add(URI.create(TestMaster.COUCH_URI));
         client = new CouchbaseClient(uris, "default", "");
      } catch (Exception ex) {
         System.err.println("Failed to get the CouchBase Connection: " + ex);
         ex.printStackTrace(System.err);
         throw new RuntimeException();
      }
   }

   protected void cleanupCouch() {
      client.shutdown();
      client = null;
   }


   /**
    * Do the assigned workload using the MongoDB Cluster.
    */
   public Stats executeMongo() {
      initMongo();

      long startTime = System.currentTimeMillis();
      Stats stats = executeMongoImpl();
      long finalTime = System.currentTimeMillis();

      stats.setRunningTime(finalTime - startTime);

      cleanupMongo();

      return stats;
   }


   /**
    * Do whatever setup must be done to initialize the Couch version of the workload.
    */
   protected void initMongo() {

      try {
         mongoClient = new MongoClient(Arrays.asList(new ServerAddress("localhost", 27017)));

         mongoClient.setReadPreference(ReadPreference.secondaryPreferred());

         db = mongoClient.getDB("cgat");
         db.setWriteConcern(WriteConcern.NONE);
      } catch (Exception e) {
         System.err.println("Error: problems connecting to mongo servers");
      }
   }

   protected void cleanupMongo() {
      mongoClient.close();
   }

   /**
    * The actual work for the Mysql.
    */
   protected abstract Stats executeMySQLImpl();


   /**
    * The actual work for the CouchDB.
    */
   protected abstract Stats executeCouchImpl();

   /**
    * The actual work for the MongoDB.
    */
   protected abstract Stats executeMongoImpl();
}
