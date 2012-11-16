import java.util.Collections;
import java.util.List;

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
