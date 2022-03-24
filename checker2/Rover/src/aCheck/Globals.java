package aCheck;

//NOTE Since these are static do not attempt to add variables to any globals, they must be absolute paths otherwise multiple threads of this will have errors
public class Globals{
    public static final String ROOT_FP = "/home/new/rover"; //server root dir file path
    public static String USERPATH = "/home/new/rover/users/"; //this is full path to user dir, the user folder must still be appended to it though
    public static String RESOURCEPATH = "/home/new/rover/resources/";


}