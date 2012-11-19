import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import java.util.Date;
import java.util.Random;
import java.util.ArrayList;
import java.util.HashMap;



/**
 * Copy the SQL data into JSON format, then send it to Couchbase.
 */
public class MoveSQLDataToCouch {
   private static final String DB_URL = "jdbc:mysql://localhost:3306/test?autoReconnect=true";
   private static final String DB_USER = "";
   private static final String DB_PASS = "";

   public static void main(String[] args) throws Exception {
      Connection conn = null;

    
      try {
         // Instantiate the DB Driver
         Class.forName("com.mysql.jdbc.Driver");

         conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
      } catch (Exception ex) {         
         System.err.println("Cannot connect to DB: " + ex);
      }
      
      System.out.println("Starting to move the stuff...\n");
      moveUsers(conn);
      System.out.println("-Finished moving users.");
      moveGroups(conn);
      System.out.println("-Finished moving groups.");
      moveContigs(conn);
      System.out.println("-Finished moving contigs.");
      moveAnnotations(conn);
      System.out.println("-Finished moving annotations.");
      moveCollabAnnotations(conn);
      System.out.println("-Finished moving collab annotations.");
     
      System.out.println("\nDone!");
   }


   private static void moveUsers(Connection conn) throws Exception {
      String usersQuery = "SELECT UserId, FirstName, LastName, Email, Pass, Salt, LastLoginDate, RegistrationDate, Level, Role, Exp FROM Users;";
      String historyQuery = "SELECT AnnotationId, FinishedDate, ExpGained, PartialSubmission FROM Annotations WHERE UserId = ?;";
      String taskQuery = "SELECT ContigId, Description, EndDate FROM Tasks WHERE UserId = ?;";
      PreparedStatement userQ = conn.prepareStatement(usersQuery);
      PreparedStatement historyQ = conn.prepareStatement(historyQuery);
      PreparedStatement taskQ = conn.prepareStatement(taskQuery);

      ResultSet rs = userQ.executeQuery();
      while(rs.next()) {
         int userId = rs.getInt("UserId");
         String first = rs.getString("FirstName");
         String last = rs.getString("LastName");
         String email = rs.getString("Email");
         String pass = rs.getString("Pass");
         String salt = rs.getString("Salt");
         Date lastLogin = rs.getDate("LastLoginDate");
         Date registered = rs.getDate("RegistrationDate");
         int level = rs.getInt("Level");
         String role = rs.getString("Role");
         int exp = rs.getInt("Exp");
         ArrayList<Integer> historyIds = new ArrayList<Integer>();
         ArrayList<Date> historyDates = new ArrayList<Date>();
         ArrayList<Integer> historyExp = new ArrayList<Integer>();
         ArrayList<Boolean> historyPartialFlag = new ArrayList<Boolean>();
         ArrayList<Integer> taskContig = new ArrayList<Integer>();
         ArrayList<String> taskDesc = new ArrayList<String>();
         ArrayList<Date> taskEnd = new ArrayList<Date>();

         historyQ.setInt(1, userId);
         ResultSet hrs = historyQ.executeQuery();
         while(hrs.next()) {
            int annotationId = hrs.getInt("AnnotationId");
            Date finished = hrs.getDate("FinishedDate");
            int expGained = hrs.getInt("ExpGained");
            boolean partial = hrs.getInt("PartialSubmission") == 1;
            historyIds.add(annotationId);
            historyDates.add(finished);
            historyExp.add(expGained);
            historyPartialFlag.add(partial);
         }

         taskQ.setInt(1, userId);
         ResultSet trs = taskQ.executeQuery();
         while(trs.next()) {
            int contigId = trs.getInt("ContigId");
            String desc = trs.getString("Description");
            Date end = trs.getDate("EndDate");
            taskContig.add(contigId);
            taskDesc.add(desc);
            taskEnd.add(end);
         }
         //toJSON
         String JSON = userToJSON(userId, first, last, email, pass, salt, lastLogin, registered,
                                  level, role, exp, historyIds, historyDates, historyExp, 
                                  historyPartialFlag, taskContig, taskDesc, taskEnd);     
         //SEND TO COUCHBASE  
      }

      rs.close();
      userQ.close();
      historyQ.close();
      taskQ.close();
   }

   private static void moveGroups(Connection conn) throws Exception {
      String groupsQuery = "SELECT GroupId, Name, GroupDescription, CreateDate FROM Groups;";
      String membershipQuery = "SELECT UserId FROM GroupMembership WHERE GroupId = ?;";
      PreparedStatement groupsQ = conn.prepareStatement(groupsQuery);
      PreparedStatement membersQ = conn.prepareStatement(membershipQuery);

      ResultSet rs = groupsQ.executeQuery();
      while(rs.next()) {
         int groupId = rs.getInt("GroupId");
         String name = rs.getString("Name");
         String desc = rs.getString("GroupDescription");
         Date createDate = rs.getDate("CreateDate");
         ArrayList<Integer> members = new ArrayList<Integer>();

         membersQ.setInt(1, groupId);
         ResultSet mrs = membersQ.executeQuery();
         while(mrs.next()) {
            int userId = mrs.getInt("UserId");
            members.add(userId);
         }
         //toJSON
         String JSON = groupToJSON(groupId, name, desc, createDate, members);     
         //SEND TO COUCHBASE    
      }

      rs.close();
      groupsQ.close();
      membersQ.close();
   }


   private static void moveContigs(Connection conn) throws Exception {
      String contigsQuery = "SELECT ContigId, Name, Difficulty, Sequence, UploaderId, Source, Species, Status, CreateDate FROM Contigs;";
      String expertAnnoQuery = "SELECT AnnotationId FROM Annotations WHERE ExpertSubmission = 1 AND ContigId = ?;";
      String geneAnnoQuery = " SELECT A.AnnotationId, G.Name FROM Annotations A, GeneNames G WHERE A.GeneId = G.GeneId AND A.ContigId = ?;";
      PreparedStatement contigQ = conn.prepareStatement(contigsQuery);
      PreparedStatement expertAnnoQ = conn.prepareStatement(expertAnnoQuery);
      PreparedStatement geneAnnoQ = conn.prepareStatement(geneAnnoQuery);

      ResultSet rs = contigQ.executeQuery();
      while(rs.next()) {
         int contigId = rs.getInt("ContigId");
         String name = rs.getString("Name");
         int diff = rs.getInt("Difficulty");
         String seq = rs.getString("Sequence");
         int uploader = rs.getInt("UploaderId");
         String source = rs.getString("Source");
         String species = rs.getString("Species");
         String status = rs.getString("Status");
         Date create = rs.getDate("CreateDate");
         ArrayList<Integer> expertAnnos = new ArrayList<Integer>();
         HashMap<String, ArrayList<Integer>> isoforms = 
                  new HashMap<String, ArrayList<Integer>>();

         expertAnnoQ.setInt(1,contigId);
         ResultSet expertrs = expertAnnoQ.executeQuery();
         while(expertrs.next()) {
            int annoId = expertrs.getInt("AnnotationId");
            expertAnnos.add(annoId);
         }

         geneAnnoQ.setInt(1, contigId);
         ResultSet isors = geneAnnoQ.executeQuery();
         while(isors.next()) {
            int annoId = isors.getInt("A.AnnotationId");
            String isoName = isors.getString("G.Name");
            //ENSURE the key exists
            if(!isoforms.containsKey(isoName)) {
               isoforms.put(isoName, new ArrayList<Integer>());
            }
            //ADD the annoId to the correct list
            isoforms.get(isoName).add(annoId);
         }

         //toJSON
         String JSON = contigToJSON(contigId, name, diff, seq, uploader, source, species,
                                    status, create, expertAnnos, isoforms);     
         //SEND TO COUCHBASE  
      }

      rs.close();
      contigQ.close();
      expertAnnoQ.close();
      geneAnnoQ.close();
   }

   private static void moveAnnotations(Connection conn) throws Exception {
      String annotationQuery = "SELECT A.AnnotationId, G.Name, A.StartPos, A.EndPos, A.ReverseComplement, A.PartialSubmission, A.ExpertSubmission, A.ContigId, A.UserId,  A.CreateDate, A.LastModifiedDate, A.FinishedDate, A.Incorrect, A.ExpertIncorrect, A.ExpGained FROM Annotations A, GeneNames G WHERE A.GeneId = G.GeneId;";
      String exonQuery = "SELECT StartPos, EndPos FROM Exons WHERE AnnotationId = ?;";
      PreparedStatement annotationQ = conn.prepareStatement(annotationQuery);
      PreparedStatement exonQ = conn.prepareStatement(exonQuery);
      
      ResultSet rs = annotationQ.executeQuery();
      while(rs.next()) {
         int annoId = rs.getInt("A.AnnotationId");
         String geneName = rs.getString("G.Name");
         int startPos = rs.getInt("A.StartPos");
         int endPos = rs.getInt("A.EndPos");
         boolean reverse = rs.getInt("A.ReverseComplement") == 1;
         boolean partial = rs.getInt("A.PartialSubmission") == 1;
         boolean expert = rs.getInt("A.ExpertSubmission") == 1;
         int contigId =  rs.getInt("A.ContigId");
         int userId = rs.getInt("A.UserId");
         Date createDate =  rs.getDate("A.CreateDate");
         Date lastModifiedDate = rs.getDate("A.LastModifiedDate");
         Date finishedDate = rs.getDate("A.FinishedDate");
         boolean incorrect = rs.getInt("A.Incorrect") == 1;
         boolean expertIncorrect = rs.getInt("A.ExpertIncorrect") == 1;
         ArrayList<Integer> exonStartEndPairs = new ArrayList<Integer>();

         exonQ.setInt(1,annoId);
         ResultSet exonrs = exonQ.executeQuery();
         while(exonrs.next()) {
            int exonStartPos = exonrs.getInt("StartPos");
            int exonEndPos = exonrs.getInt("EndPos");
            exonStartEndPairs.add(exonStartPos);
            exonStartEndPairs.add(exonEndPos);
         }
         //toJSON
         String JSON = annotationToJSON(annoId, geneName, startPos, endPos, reverse,
                                              partial, expert, contigId, userId, createDate,
                                              lastModifiedDate, finishedDate, incorrect, 
                                              expertIncorrect, exonStartEndPairs);

         //SEND to couchbase
      }

      rs.close();
      annotationQ.close();
      exonQ.close();
   }

   private static void moveCollabAnnotations(Connection conn) throws Exception {
      String annotationQuery = "SELECT A.CollabAnnotationId, G.Name, A.StartPos, A.EndPos, A.ReverseComplement, A.ContigId, A.CreateDate, A.LastModifiedDate FROM CollabAnnotations A, GeneNames G WHERE A.GeneId = G.GeneId;";
      String exonQuery = "SELECT StartPos, EndPos FROM CollabExons WHERE CollabAnnotationId = ?;";
      PreparedStatement annotationQ = conn.prepareStatement(annotationQuery);
      PreparedStatement exonQ = conn.prepareStatement(exonQuery);
      
      ResultSet rs = annotationQ.executeQuery();
      while(rs.next()) {
         int collabId = rs.getInt("A.CollabAnnotationId");
         String geneName = rs.getString("G.Name");
         int startPos = rs.getInt("A.StartPos");
         int endPos = rs.getInt("A.EndPos");
         boolean reverse = rs.getInt("A.ReverseComplement") == 1;
         int contigId =  rs.getInt("A.ContigId");
         Date createDate =  rs.getDate("A.CreateDate");
         Date lastModifiedDate = rs.getDate("A.LastModifiedDate");
         ArrayList<Integer> exonStartEndPairs = new ArrayList<Integer>();

         exonQ.setInt(1,collabId);
         ResultSet exonrs = exonQ.executeQuery();
         while(exonrs.next()) {
            int exonStartPos = exonrs.getInt("StartPos");
            int exonEndPos = exonrs.getInt("EndPos");
            exonStartEndPairs.add(exonStartPos);
            exonStartEndPairs.add(exonEndPos);
         }
         //toJSON
         String JSON = collabAnnotationToJSON(collabId, geneName, startPos, 
                                                    endPos, reverse, contigId,
                                                    createDate, lastModifiedDate,
                                                    exonStartEndPairs);

         //SEND to couchbase
      }

      rs.close();
      annotationQ.close();
      exonQ.close();
   }

   private static String userToJSON(int userId, String first, String last, String email,
                                    String pass, String salt, Date lastLogin, Date registered,
                                    int level, String role, int exp, 
                                    ArrayList<Integer> historyIds, ArrayList<Date> historyDates,
                                    ArrayList<Integer> historyExp, 
                                    ArrayList<Boolean> historyPartialFlag,
                                    ArrayList<Integer> taskContig, ArrayList<String> taskDesc,
                                    ArrayList<Date> taskEnd) {
      return "{}";
   }

   private static String groupToJSON(int groupId, String name, String desc, 
                                     Date createDate, ArrayList<Integer> members) {
      return "{}";
   }

   private static String contigToJSON(int contigId, String name, int diff, String seq, 
                                      int uploader, String source, String species, 
                                      String status, Date create, 
                                      ArrayList<Integer> expertAnnos,
                                      HashMap<String, ArrayList<Integer>> isoforms) {
      return "{}";
   }

   private static String annotationToJSON(int annoId, String geneName, int startPos, 
                                          int endPos, boolean reverse , boolean partial,
                                          boolean expert, int contigId, int userId, 
                                          Date createDate, Date lastModifiedDate, 
                                          Date finishedDate, boolean incorrect, 
                                          boolean expertIncorrect, 
                                         ArrayList<Integer> exonStartEndPairs) {
      return "{}";
   }

   private static String collabAnnotationToJSON(int collabId, String geneName, int startPos,
                              int endPos, boolean reverse, int contigI, Date createDate,
                              Date lastModifiedDat, ArrayList<Integer> exonStartEndPairs) {
      return "{}";
   }
}
