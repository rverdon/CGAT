import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Date;
import java.util.HashMap;

import java.text.SimpleDateFormat;

import org.json.JSONException;
import org.json.JSONObject;

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
   // DON'T TOUCH THIS NUMBER. I need to keep it consistent for testing. -Eriq
   //private static final int TIMES = 10000;
   private static final int TIMES = 1;
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

   protected void initCouch() {
      super.initCouch();

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

   protected Stats executeCouchImpl() {
      String json = "";
      
      for (int i = 0; i < TIMES; i++) {
         int uploaderId = rand.nextInt(TIMES)+1;
         int newContigId = 9000 + i;
         String user_json = (String)client.get("Users-"+uploaderId);

         try {
            JSONObject user = new JSONObject(user_json);
            String name = user.getJSONObject("meta").getString("user_name");
         
            json = contigToJSON(newContigId, "contig-" + randomString(15), rand.nextInt(10)+1, 
                                      seqs.get(rand.nextInt(seqs.size())), 
                                      uploaderId, randomString(7), randomString(20), 
                                      randomString(10), new Date(), name,
                                      new ArrayList<Integer>(),
                                      new HashMap<String, ArrayList<Integer>>());
         }
         catch (Exception e) {
            System.err.println("Caught an error uploading a contig. ERROR: " + e);
         }

         client.set("Contigs-" + newContigId, 0, json); 
      }      


      json = null;
      return new Stats();
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

   private static String contigToJSON(int contigId, String name, int diff, String seq, 
                                      int uploader, String source, String species, 
                                      String status, Date create, String uploader_name,
                                      ArrayList<Integer> expertAnnos,
                                      HashMap<String, ArrayList<Integer>> isoforms) {
       return "{\n" + "   \"contig_id\": \"" + contigId + "\",\n" +
                   "   \"expert_annotations\": [\n" + listToJSON(expertAnnos) + "\n   ],\n" +
                   "   \"isoform_names\": {\n" + isoformsToJSON(isoforms) + "\n" +
                   "   },\n" +
                   "   \"meta\": {\n" +
                   "        \"difficulty\": \"" + diff + "\",\n" +
                   "        \"name\": \"" + name + "\",\n" +
                   "        \"source\": \"" + source + "\",\n" +
                   "        \"species\": \"" + species + "\",\n" +
                   "        \"status\": \"" + status + "\",\n" +
                   "        \"upload_date\": \"" + create + "\",\n" +
                   "        \"uploader\": \"" + uploader + "\",\n" +
                   "        \"uploader_name\": \"" + uploader_name + "\"\n" +
                   "   },\n" +
                   "   \"sequence\": \"" + seq + "\"\n}"; 
   }
   
   private static String isoformsToJSON(HashMap<String, ArrayList<Integer>> isoforms) {
      String ret = "";

      for (String key: isoforms.keySet()) {
         ArrayList<Integer> ids = isoforms.get(key);
         ret += "       \"" + key + "\": [\n" +
                        extraIndentsListToJSON(ids) + "\n" +
                "        ],\n";
                
      }
      if(ret.length() >= 2) {
         return ret.substring(0, ret.length()-2);
      }
      return ret;
   }

   private static String extraIndentsListToJSON(ArrayList<?> list) {
      String ret = "";

      for (int i = 0; i < list.size(); i++) {
         ret += "          \"" + list.get(i) + "\"";
         if (i != list.size() - 1) {
            ret+= ",\n";
         }
      }
      return ret;
   }

   private static String listToJSON(ArrayList<?> list) {
      String ret = "";

      for (int i = 0; i < list.size(); i++) {
         ret += "       \"" + list.get(i) + "\"";
         if (i != list.size() - 1) {
            ret+= ",\n";
         }
      }
      return ret;
   }
}

