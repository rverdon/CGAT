import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Random;

/**
 * Generate some random SQL data.
 */
public class GenerateSQLData {
   private static final String DB_URL = "jdbc:mysql://localhost:3306/test?autoReconnect=true";
   private static final String DB_USER = "";
   private static final String DB_PASS = "";

   private static int numGeneNames = 1;
   private static int numContigs = 1;
   private static int numCollabExons = 5;
   private static int numCollabAnnotations = 1;
   private static int numGroups = 1;
   private static int numUsers = 1;
   private static int numExons = 5;
   private static int numAnnotations = 1;
   private static double groupJoinChance = 0.1;
   private static int numTasks = 1;
   private static Random rand;

   public static void main(String[] args) {
      Connection conn = null;

      rand = new Random();

      try {
         // Instantiate the DB Driver
         Class.forName("com.mysql.jdbc.Driver");

         conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
      } catch (Exception ex) {         
         System.err.println("Cannot connect to DB");
      }
      /*
      createGeneNames(100, conn);
      createContigs(100, conn);
      createCollabExons(500, conn);
      createCollabAnnotations(100, conn);
      createGroups(100, conn);
      createUsers(100000, conn);
      createExons(5000000, conn);
      createAnnotations(1000000, conn);
      createGroupMembership(0.1, conn);
      createTasks(100, conn);
      */

      createGeneNames(numGeneNames, conn);
      createContigs(numContigs, conn);
      createCollabExons(numCollabExons, conn);
      createCollabAnnotations(numCollabAnnotations, conn);
      createGroups(numGroups, conn);
      createUsers(numUsers, conn);
      createExons(numExons, conn);
      createAnnotations(numAnnotations, conn);
      createGroupMembership(groupJoinChance, conn);
      createTasks(numTasks, conn);
   }

   private static void createGeneNames(int count, Connection conn) {
      String insertQuery = "INSERT INTO GeneNames (Name) VALUES (?)";

      for (int i = 0; i < count; i++) {
         
      }
   }

   private static void createContigs(int count, Connection conn) {
      String insertQuery = "INSERT INTO Contigs (Name, Difficulty, Sequence, UploaderId, Source, Species, Status, CreateDate) VALUES (?,?,?,?,?,?,?,?)";
   }

   private static void createCollabExons(int count, Connection conn) {
      String insertQuery = "INSERT INTO CollabExons (StartPos, EndPos, CollabAnnotationId) VALUES (?,?,?)";
   }

   private static void createCollabAnnotations(int count, Connection conn) {
      String insertQuery = "INSERT INTO CollabAnnotations (GeneId, StartPos, EndPos, ReverseComplement, ContigId, CreateDate, LastModifiedDate) VALUES (?,?,?,?,?,?,?)";
   }

   private static void createGroups(int count, Connection conn) {
      String insertQuery = "INSERT INTO Groups (Name, GroupDescription, CreateDate) VALUES (?,?,?)";
   }

   private static void createUsers(int count, Connection conn) {
      String insertQuery = "INSERT INTO Users (FirstName, LastName, UserName, Email, Pass, Salt, LastLoginDate, RegistrationDate, Level, Role, Exp) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
   }
  
   private static void createExons(int count, Connection conn) {
      String insertQuery = "INSERT INTO Exons (StartPos, EndPos, AnnotationId) VALUES (?,?,?)";
   }

   private static void createAnnotations(int count, Connection conn) {
      String insertQuery = "INSERT INTO Annotations (GeneId, StartPos, EndPos, ReverseComplement, PartialSubmission, ExpertSubmission ContigId, UserId, CreateDate, LastModifiedDate, Incorrect, ExpertIncorrect, ExpGained) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
   }

   private static void createGroupMembership(double chance, Connection conn) {
      String insertQuery = "INSERT INTO GroupMembership (GroupId, UserId) VALUES (?,?)";
   }

   private static void createTasks(int count, Connection conn) {
      String insertQuery = "INSERT INTO Tasks (UserId, ContigId, Description, EndDate) VALUES (?,?)";
   }

   private static String randomDate() {
      return "sysdate";
   }

   private static String randomDouble() {
      return String.valueOf(rand.nextDouble());
   }

   private static String randomInt() {
      return String.valueOf(rand.nextInt());
   }

   private static String randomString(int length) {
      return "AAAAAAAA";
   }

   private static String randomBool() {
      int testerguything = rand.nextInt();
      return String.valueOf(testerguything % 2 == 0);
   }
    
}
