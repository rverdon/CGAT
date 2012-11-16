import java.util.ArrayList;
import java.util.List;

/**
 * The main testing class.
 * This will run all the registered workloads and output the stats.
 */
public class TestMaster {
   public static void main(String[] args) {
      Workload[] workloads = {new StupidWorkload()};

      for (Workload workload : workloads) {
         System.out.println("Running Workload [" + workload.getClass().getCanonicalName() + "]...");
         Stats results = workload.executeMySQL();
         System.out.println("Completed Workload [" + workload.getClass().getCanonicalName() + "]...");
         System.out.println(results + "\n");
      }
   }
}
