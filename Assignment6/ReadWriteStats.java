import java.util.ArrayList;
import java.util.List;

/**
 * Special stats to keep track of the time between reads and writes.
 */
public class ReadWriteStats extends Stats {
   private Util.AverageStats readStats;
   private Util.AverageStats writeStats;
   private Util.AverageStats totalStats;

   public ReadWriteStats(List<Long> readTimes, List<Long> writeTimes) {
      readStats = Util.averageStats(readTimes);
      writeStats = Util.averageStats(writeTimes);

      List<Long> totalTimes = new ArrayList<Long>(2000000);
      totalTimes.addAll(readTimes);
      totalTimes.addAll(writeTimes);
      totalStats = Util.averageStats(totalTimes);
   }

   public String toString() {
      return super.toString() + "\n" +
             String.format("Reads After Writes of Same Document:\n" +
                           "   Min: %f\n" +
                           "   Max: %f\n" +
                           "   Mean: %f\n" +
                           "   Median: %f\n" +
                           "   Standard Deviation: %f\n",
                           readStats.min, readStats.max,
                           readStats.mean, readStats.median,
                           readStats.stdDev) +
             String.format("Writes After Reads of Same Document:\n" +
                           "   Min: %f\n" +
                           "   Max: %f\n" +
                           "   Mean: %f\n" +
                           "   Median: %f\n" +
                           "   Standard Deviation: %f\n",
                           writeStats.min, writeStats.max,
                           writeStats.mean, writeStats.median,
                           writeStats.stdDev) +
             String.format("Combined:\n" +
                           "   Min: %f\n" +
                           "   Max: %f\n" +
                           "   Mean: %f\n" +
                           "   Median: %f\n" +
                           "   Standard Deviation: %f",
                           totalStats.min, totalStats.max,
                           totalStats.mean, totalStats.median,
                           totalStats.stdDev);
   }
}
