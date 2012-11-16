/**
 * The sttistics associated with a Workload.
 */
public class Stats {
   private long runningTimeMSecs;

   public Stats() {
      runningTimeMSecs = -1;
   }

   public void setRunningTime(long time) {
      runningTimeMSecs = time;
   }

   public String toString() {
      return String.format("Run Time %dms", runningTimeMSecs);
   }
}
