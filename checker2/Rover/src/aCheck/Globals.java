package aCheck;

  /*
  * This class is for global variables relating to file paths, the term Globals in here has no reference to Prism Globals
  */


//NOTE Since these are static do not attempt to add variables to any globals, they must be absolute paths otherwise multiple threads of this will have errors
public class Globals{
    public  static String ROOT_FP ; //server root dir file path
    public  static String USERPATH ; //this is full path to user dir, the user folder must still be appended to it though
    public  static String RESOURCEPATH ;


}