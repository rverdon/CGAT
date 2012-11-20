import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Date;

import java.text.SimpleDateFormat;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.PreparedStatement;

/**
 * This one measures uploading a ton of contigs.
 */
public class ContigUploadWorkload extends Workload {
   // Should be no more than 9999999999999999999999999999
   private static final int TIMES = 10000;
   //private static final int TIMES = 5;
   private static final int MIN_SEQ_LENGTH = 45000;
   private static final int MAX_ADDITIONAL_LENGTH = 15001;

   private ArrayList<String> seqs;
   private String[] userIds;
   private Random rand;

   /**
    * Precomputes a list of 100 random sequences of varying lengths.
    */
   public ContigUploadWorkload() {
      seqs = new ArrayList<String>();
      rand = new Random(1242414);
      userIds = new String[TIMES];
   }

   protected void initMySQL() {
      super.initMySQL();

      String query = "SELECT UserId FROM Users ORDER BY RAND(0) LIMIT " + TIMES;
      if (!Util.doStringListQuery(conn, query, userIds)) {
         System.err.println("Couldn't get User ids.");
         throw new RuntimeException();
      }

      for (int i = 0; i < TIMES; i++) {
         int extra_length = rand.nextInt(MAX_ADDITIONAL_LENGTH);
         seqs.add(randomSequence(MIN_SEQ_LENGTH + extra_length));
      }
   }

   protected void cleanupMySQL() {
      super.cleanupMySQL();

      seqs.clear();
      seqs = null;
      userIds = null;
   }

   protected Stats executeMySQLImpl() {
      String insertQuery = "INSERT INTO Contigs (Name, Difficulty, Sequence, UploaderId, Source, Species, Status, CreateDate) VALUES (?,?,?,?,?,?,?,?)";

      try {
         PreparedStatement pstmt = conn.prepareStatement(insertQuery);

         for (int i = 0; i < TIMES; i++) {
            pstmt.setString(1, "contig-" + randomString(15));
            pstmt.setString(2, randomDouble());
            pstmt.setString(3, seqs.get(rand.nextInt(seqs.size())));
            pstmt.setString(4, userIds[rand.nextInt(TIMES)]);
            pstmt.setString(5, randomString(7));
            pstmt.setString(6, randomString(20));
            pstmt.setString(7, randomString(10));
            pstmt.setString(8, randomDate());
            pstmt.executeUpdate();
         }
         pstmt.close();
      }
      catch (Exception e) {
         //got here, DGAF
      }

      return new Stats();
   }

   protected void initCouch() {
   }

   protected Stats executeCouchImpl() {
      // Nope
      throw new UnsupportedOperationException();
   }

   private String randomSequence(int length) {
      String choices = "CGAT";
      StringBuilder stringb = new StringBuilder(length);
      for (int i = 0; i < length; i++) {
         stringb.append(choices.charAt(rand.nextInt(choices.length())));
      }
      return stringb.toString();
   }

   private String randomDouble() {
      return String.valueOf(rand.nextDouble());
   }

   private String randomString(int length) {
      String choices = "0123456789ABCDEFGHIJKLMOPQRSTUVXYZ";
      StringBuilder stringb = new StringBuilder(length);
      for (int i = 0; i < length; i++) {
         stringb.append(choices.charAt(rand.nextInt(choices.length())));
      }
      return stringb.toString();
   }

   private String randomDate() {
      SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
      return formatter.format(new Date());
   }
}

