package aCheck;

public class CheckingDriver{
    public static void main(String [] args){
        if(args.length == 3){
            ModelFileChecker mfc = new ModelFileChecker(args[0],args[1],args[2]);//, args[1]);
        }else if(args.length == 2){
            ModelFileChecker mfc = new ModelFileChecker(args[0],args[1]);//, args[1]);
        }else if(args.length == 1){
            ModelFileChecker mfc = new ModelFileChecker(args[0]);
        }
        
    }
}