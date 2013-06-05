import com.mongodb.MongoClient;
import com.mongodb.MongoException;
import com.mongodb.WriteConcern;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.DBCursor;
import com.mongodb.ServerAddress;

import java.util.*;
import java.text.SimpleDateFormat;


/**
 * Generate some random Mongo data.
 */
public class GenerateMongoData {
   private static final String DB_URL =
         "jdbc:mysql://ip-10-168-85-10.us-west-1.compute.internal:3306/cgat?autoReconnect=true";
   private static final String DB_USER = "root";
   private static final String DB_PASS = "csc560";

  /*private static int numGeneNames = 500;
   private static int numContigs = 100;
   private static int numGroups =100;
   private static int numUsers = 100000;
   private static int numAnnotations = 1000000;
   private static double groupJoinChance = 0.1;
   private static double taskAssignChance = 0.05;*/

   private static int numGeneNames = 10;
   private static int numContigs = 10;
   private static int numGroups =10;
   private static int numUsers = 10;
   private static int numAnnotations = 100;
   private static double groupJoinChance = 0.1;
   private static double taskAssignChance = 0.05;


   private static Random rand;

   private static HashMap<Integer, ArrayList<Integer>> contigsToAnnotationId;
   private static HashMap<Integer, ArrayList<Integer>> usersToAnnotationId;
   private static HashMap<Integer, Boolean> annotationToExpert;
   private static HashMap<Integer, String> annotationToName;
   private static HashMap<Integer, Boolean> annotationToFinished;
   private static HashMap<Integer, ArrayList<Integer>> groupToUserId;

   public static void main(String[] args) throws Exception {
      MongoClient mongoClient = new MongoClient(Arrays.asList(new ServerAddress("localhost", 27017)));

      DB db = mongoClient.getDB("cgat");
      db.setWriteConcern(WriteConcern.NONE);      

      rand = new Random();

      contigsToAnnotationId = new HashMap<Integer, ArrayList<Integer>>();
      usersToAnnotationId = new HashMap<Integer, ArrayList<Integer>>();
      annotationToExpert = new HashMap<Integer, Boolean>();
      annotationToName = new HashMap<Integer, String>();
      annotationToFinished = new HashMap<Integer, Boolean>();
      groupToUserId = new HashMap<Integer, ArrayList<Integer>>();

      System.out.println("Starting to generate stuff...\n");
      createAnnotations(numAnnotations, db);
      System.out.println(" Finished generating " + numAnnotations + " Annotations");
      createContigs(numContigs, db);
      System.out.println(" Finished generating " + numContigs + " Contigs");
      createUsers(numUsers, db);
      System.out.println(" Finished generating " + numUsers + " Users");
      createGroups(numGroups, db);
      System.out.println(" Finished generating " + numGroups + " Groups");
      
      
      System.out.println("\nDone!");
   }

   private static void createContigs(int count, DB db) throws Exception {
      DBCollection coll = db.getCollection("contigs");
      coll.drop();
      coll = db.createCollection("contigs", null);

      ArrayList<DBObject> docs = new ArrayList<DBObject>();
      

      for (int i = 0; i < count; i++) {
         BasicDBObject doc = new BasicDBObject();

         String contigName = "contig" + (i+1);
         String contigId = String.valueOf(i+1);
         String difficulty = randomDouble();
         String sequence = randomSequence(50000);//SEQUENCE
         String uploaderId = String.valueOf(rand.nextInt(numUsers) + 1);
         String uploaderName = randomString(25);
         String source = randomString(15);
         String species = randomString(40);
         String status = randomString(20);
         String uploadDate = randomDate();


         doc.put("sequence", sequence);
         doc.put("contig_id", contigId);
         

         BasicDBObject meta = new BasicDBObject();
         meta.put("uploader", uploaderId);
         meta.put("uploader_name", uploaderName);
         meta.put("upload_date", uploadDate);
         meta.put("status", status);
         meta.put("species", species);
         meta.put("source", source);
         meta.put("name", contigName);
         meta.put("difficulty", difficulty);

         doc.put("meta", meta);

         int cId = Integer.parseInt(contigId);
  
         ArrayList<Integer> annoIds = contigsToAnnotationId.get(cId);
         if (annoIds != null) {

            ArrayList<String> experts = new ArrayList<String>();
            HashMap<String, ArrayList<Integer>> nameToIds = new HashMap<String,ArrayList<Integer>>();


            for (Integer aId: annoIds) {
               String name = annotationToName.get(aId);
            
               ArrayList<Integer> ids = nameToIds.get(name);
               if(ids == null) {
                  ids = new ArrayList<Integer>();
               }
 
               ids.add(aId);
               nameToIds.put(name, ids);

               if (annotationToExpert.get(aId)) {
                  experts.add(aId.toString());
              }
            }
         
        

            doc.put("expert_annotations", experts);
      

            ArrayList<BasicDBObject> isoNamesToIds = new ArrayList<BasicDBObject>();

            for (String geneName : nameToIds.keySet()) {
               ArrayList<Integer> ids = nameToIds.get(geneName);
               ArrayList<String> idStrings = new ArrayList<String>();
               for(Integer id: ids) {
               idStrings.add(id.toString());
               }

               BasicDBObject isoName = new BasicDBObject(geneName, idStrings);
               isoNamesToIds.add(isoName);
            }
            doc.append("isoform_names", isoNamesToIds);
         }
         else {
            doc.put("expert_annotations", new ArrayList());
            doc.append("isoform_names", new ArrayList());
         }
         docs.add(doc);

      }

      coll.insert(docs);

   }

   private static void createGroups(int count, DB db) throws Exception {
      DBCollection coll = db.getCollection("groups");
      coll.drop();
      coll = db.createCollection("groups", null);

      ArrayList<DBObject> docs = new ArrayList<DBObject>();

      for (int i = 0; i < count; i++) {
         BasicDBObject doc = new BasicDBObject();

         String groupId = String.valueOf(i+1);
         String name = "group" + (i+1);
         String description = randomString(150);
         String created = randomDate();

         doc.put("group_id", String.valueOf(i+1));
         doc.put("created", created);
         doc.put("description", description);
         doc.put("name", name);

         ArrayList<String> users = new ArrayList<String>();
         if (groupToUserId.get(i) != null) {
            for (Integer uId: groupToUserId.get(i)) {
               users.add(uId.toString());
            }
         }
         doc.put("users", users);

         docs.add(doc);
      }
 
      coll.insert(docs);
   }

   private static void createUsers(int count, DB db) throws Exception {
      DBCollection coll = db.getCollection("users");
      coll.drop();
      coll = db.createCollection("users", null);

      ArrayList<DBObject> docs = new ArrayList<DBObject>();

      for (int i = 0; i < count; i++) {
         BasicDBObject doc = new BasicDBObject();
         
         String userId = String.valueOf(i+1);
         String firstName = randomString(20);
         String lastName = randomString(25);
         String userName = randomString(30);
         String email = randomString(40);
         String pass = randomString(64);
         String salt = randomString(32);
         String lastLogin = randomDate();
         String regDate = randomDate();
         String level = randomInt(5);
         String role = randomString(5);
         String exp = randomInt(7000);

         doc.put("user_id", userId);

         BasicDBObject meta = new BasicDBObject();
         meta.put("email", email);
         meta.put("first_name", firstName);
         meta.put("joined", regDate);
         meta.put("last_login", lastLogin);
         meta.put("last_name", lastName);
         meta.put("level", level);
         meta.put("pass_hash", pass);
         meta.put("salt", salt);
         meta.put("user_name", userName);
         meta.put("exp", exp);
   
         doc.put("meta", meta);

         ArrayList<String> incomplete = new ArrayList<String>();
         ArrayList<BasicDBObject> history = new ArrayList<BasicDBObject>();

         ArrayList<Integer> annoIds = usersToAnnotationId.get(Integer.parseInt(userId));
         for(Integer aId: annoIds) {
            if(annotationToFinished.get(aId)) {
               BasicDBObject hist = new BasicDBObject();
               BasicDBObject metaHist = new BasicDBObject();

               metaHist.put("experience_gained", randomInt(100));
               metaHist.put("date", randomDate());
               hist.put("meta", metaHist);
               hist.put("anno_id", aId.toString());
               history.add(hist);
            }
            else
            { //PARTIAL
               incomplete.add(aId.toString());
            }
         }
         
         doc.put("history", history);
         doc.put("incomplete_annotations", incomplete);


         ArrayList<String> groups = new ArrayList<String>();

         for(int x = 0; x < numGroups; x++) {
            double chance = rand.nextDouble();
            if (chance <= groupJoinChance) {
               groups.add(String.valueOf(x+1));
               ArrayList<Integer> users = groupToUserId.get(x);
               if (users == null) {
                  users = new ArrayList<Integer>();
               }
               users.add(Integer.parseInt(userId));
               groupToUserId.put(x, users);
            }
         }
         doc.put("groups", groups);

         ArrayList<BasicDBObject> tasks = new ArrayList<BasicDBObject>();

         for(int x = 0; x < numContigs; x++) {
            double chance = rand.nextDouble();
            if (chance <= taskAssignChance) {
               BasicDBObject task = new BasicDBObject();
               task.put("desc", randomString(50));
               task.put("contig_id", String.valueOf(x+1));
               task.put("end_date", randomDate());
               tasks.add(task);
            }
         }
         doc.put("tasks", tasks);
 
         docs.add(doc);
      }

      coll.insert(docs);
   }
  
   private static void createAnnotations(int count, DB db) throws Exception {
     
      DBCollection coll = db.getCollection("annotations");
      coll.drop();
      coll = db.createCollection("annotations", null);
      
      ArrayList<DBObject> docs = new ArrayList<DBObject>();


      for (int i = 0; i < count; i++) {
         BasicDBObject doc = new BasicDBObject();
         
         String isoformName = "gene-" + String.valueOf(rand.nextInt(numGeneNames)+1);
         String start = randomInt(7000);
         String end = randomInt(7000);
         String reverseComplement = randomBool();
         String partialSubmission = randomBool();
         String expertSubmission = randomBool();
         String contigId = String.valueOf(rand.nextInt(numContigs)+1);
         String userId = String.valueOf(rand.nextInt(numUsers)+1);
         String annotationId = String.valueOf(i+1);
         String createDate = randomDate();
         String lastModifiedDate = randomDate();
         String finishedDate = randomDate();
         String incorrect = randomBool();
         String expertIncorrect = randomBool();

         doc.put("annotation_id", annotationId);
	 doc.put("isoform_name", isoformName);
         doc.put("start", start);
         doc.put("end", end);
         doc.put("reverse_complement", reverseComplement);
         doc.put("partial", partialSubmission);
         doc.put("expert", expertSubmission);
         doc.put("contig_id", contigId);
         doc.put("user_id", userId);

         BasicDBObject meta = new BasicDBObject();
         meta.put("created", createDate);
         meta.put("last_modified", lastModifiedDate);
         meta.put("finished", finishedDate);
         meta.put("incorrect", incorrect);
         meta.put("expert_incorrect", expertIncorrect);

         doc.put("meta", meta);


         int uId = Integer.parseInt(userId);
         int cId = Integer.parseInt(contigId);
         int aId = Integer.parseInt(annotationId);

         ArrayList<Integer> users = usersToAnnotationId.get(uId);
         ArrayList<Integer> contigs = contigsToAnnotationId.get(cId);
         if(users == null) {
            users = new ArrayList<Integer>();
         }
         if(contigs == null) {
            contigs = new ArrayList<Integer>();
         }


         annotationToExpert.put(aId, Boolean.parseBoolean(expertSubmission));
         annotationToFinished.put(aId, !Boolean.parseBoolean(partialSubmission));
         annotationToName.put(aId, isoformName);
         users.add(aId);
         contigs.add(aId);
         usersToAnnotationId.put(uId, users);
         contigsToAnnotationId.put(cId, contigs); 

         ArrayList<BasicDBObject> exons = new ArrayList<BasicDBObject>();

         for (int e = 0; e < 5; e++) {
            BasicDBObject exon = new BasicDBObject("start", randomInt(5000));
            exon.put("end", randomInt(5000));
            exons.add(exon);
         }
         doc.append("exons", exons);
         docs.add(doc);
 
      }

      coll.insert(docs);

   }


   private static String randomDate() {
      SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
      return formatter.format(new Date());
   }

   private static String randomDouble() {
      return String.valueOf(rand.nextDouble());
   }

   private static String randomInt(int end) {
      return String.valueOf(rand.nextInt(end));
   }

   private static String randomSequence(int length) {
      String choices = "CGAT";
      StringBuilder stringb = new StringBuilder(length);
      for (int i = 0; i < length; i++) {
         stringb.append(choices.charAt(rand.nextInt(choices.length())));
      }
      return stringb.toString();
   }

   private static String randomString(int length) {
      String choices = "0123456789ABCDEFGHIJKLMOPQRSTUVXYZ";
      StringBuilder stringb = new StringBuilder(length);
      for (int i = 0; i < length; i++) {
         stringb.append(choices.charAt(rand.nextInt(choices.length())));
      }
      return stringb.toString();
   }

   private static String randomBool() {
      int testerguything = rand.nextInt();
      return String.valueOf(Math.abs(testerguything % 2) == 1);
   }
    
}
