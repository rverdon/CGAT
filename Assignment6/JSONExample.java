import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

/**
 * This is an example to show everyone how to use the JSON library.
 * See here for a complete reference: http://www.json.org/java/
 */
public class JSONExample {
   // Note that most JSON conversions will throw a JSONException if they are given inproper JSON.
   public static void main(String[] args) throws JSONException {
      JSONObject json = null;

      // This the most popular constructor.
      // Just jove is the JSON text.
      // Note: Single quotes are not valid json, but this library will accept it.
      String string1 = "{'id': 1}";
      System.out.println("Parsing: " + string1);
      json = new JSONObject(string1);
      System.out.println("JSONObject: " + json);
      // Note that I pull out the field with the type I know it to be.
      // There are variations for all valid JSON types.
      // There is a general get() that returns sn Object.
      System.out.println("'id' field: " + json.getInt("id"));
      System.out.println();

      try {
         // Trying to get a non-existant field will throw a JSONException.
         System.out.println("'id' field: " + json.getInt("iDontExist"));
      } catch (JSONException jsonEx) {
         System.out.println("Threw an exception.");
      }

      // Use has() if you want to check existance.
      System.out.println("Does 'iDontExist' exist?: " + json.has("iDontExist"));
      System.out.println();


      // There are many overrides of put() that take the key and the value.
      // Therefore the value can be an int, bool, Map (will be converted to a JSONObject),
      // JSONObject, etc.
      json.put("newIntField", 999);
      json.put("newBool", true);

      Map myMap = new HashMap<String, String>();
      myMap.put("hi", "there");
      myMap.put("foo", "bar");
      json.put("newMapField", myMap);

      JSONObject newObj = new JSONObject("{'name': 'Aldrin', 'val': 3.4, 'present': true}");
      json.put("newObjField", newObj);

      System.out.println("New JSONObject: " + json);
      System.out.println();

      // When you want to set a field, you have to totall override it.
      // Note that put() returns this (the JSONObject) so you can chain them.
      json.put("newObjField", json.getJSONObject("newObjField").put("name", "Ryan").put("present", false));
      System.out.println("Modified JSONObject: " + json);
      System.out.println();

      // This has some of the same itteration methods as Map: keys() and keySet().

      // You can remove fields.
      json.remove("id");
      System.out.println("No Id JSONObject: " + json);
      System.out.println();

      // To serialize back to a string, just use toString().
      System.out.println("JSONObject.toString(): " + json.toString());
   }
}
