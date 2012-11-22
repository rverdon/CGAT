import java.util.ArrayList;
import java.util.List;

/**
 * The main testing class.
 * This will run all the registered workloads and output the stats.
 */
public class TestMaster {
   // Some constants for DB connections.
   public static final String DB_URL =
         // Real one (internal only).
         "jdbc:mysql://ip-10-168-85-10.us-west-1.compute.internal:3306/cgat?autoReconnect=true";
         // Testing one
         //"jdbc:mysql://localhost:3306/test?autoReconnect=true";
         //"jdbc:mysql://localhost:3306/cgat?autoReconnect=true";
   public static final String DB_USER = "cgat";
   public static final String DB_PASS = "csc560";

   //public static final String COUCH_URI = "http://ec2-204-236-188-48.us-west-1.compute.amazonaws.com:8091/pools";
   public static final String COUCH_URI = "http://ip-10-168-85-10.us-west-1.compute.internal:8091/pools";

   public static void main(String[] args) {
      Workload[] workloads = {
                              //new ContigUploadWorkload(),
                              new ProfileWorkload(),
                              //new AssignTaskWorkload(),
                              //new GroupMemWorkload(),
                              //new PublishWorkload(),
                              //new StupidWorkload(),
                              };

      for (Workload workload : workloads) {
         System.out.println("Running Workload [" + workload.getClass().getCanonicalName() + "]...");
         Stats results = workload.executeCouch();
         System.out.println("Completed Workload [" + workload.getClass().getCanonicalName() + "]...");
         System.out.println(results + "\n");
      }
   }
}
