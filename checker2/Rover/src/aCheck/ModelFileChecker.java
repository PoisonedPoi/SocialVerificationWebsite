package aCheck;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

import javax.imageio.ImageIO;
import java.io.*;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.lang.reflect.Field;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.ResourceBundle;

import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringWriter;


import checkers.Checker;
import checkers.PrismThread;
import checkers.Property;
import enums.StateClass;
import image.Conditions;

import model.*;
import model.Group;
import model.GroupTransition;
import model_ctrl.*;
import repair.Repairer;
import study.GroupMBP;

//stuff for document parsing
import java.awt.Point;
import java.io.File;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.w3c.dom.Node;
//NOTE ALL MICRO-INTERACTION FILE PATHS ARE CURRENTLY HARD CODED IN INTERACTION'S SET CHECKER METHOD THIS MUST BE CHANGED TO ADD NEW MICRO-INTERACTIONS

public class ModelFileChecker{
    //background thread, does the prism tasks
    PrismThread backgroundThread; 

    //Violations class
    ViolationParser violationParser;

    // Flags for various conditions
    private int buttonFlag;
    //Declares the file path used to add microinteractions to the active project
    private String absFilePath;
    // global variable to hold the MainController object
    private ModelFileChecker mainController;
   // private ImportMicrosCT importMicrosCT;  a gui object?
  //  private InteractionPane interactionPane; a gui object?
    // the current interactions, microinteraction and module in the editor
    private Interaction interaction;
    private ArrayList<Group> groups;
    private Module currModule;
    private GroupTransition currGroupTransition;

    // if not assisted (the control)    //TODO find if this can be removed
    private Boolean isNonAssisted = false;
    private HashMap<String, TooltipViz> staticTooltips;

    // for storing the categories of properties
    private ArrayList<String> propertyCategories;
    private boolean canStartExp;
    private boolean canStopExp;
    private boolean canClearDesign;

       // properties file
    private File propsFile;
    private ArrayList<Property> graphProperties;
    // repairer
    private Repairer rep;



    //others that could be useful
    private final int BUTTON_SELECT = 'A';
    private final int BUTTON_ADDGROUP = 'G';
    private final int BUTTON_ADDTRANS = 'T';

    private final String SID; //session id, gives the user folder name as "user + SID", it should not be changed once set 
    private final String USERFOLDER;//the actual folder path for this user
    
    public ModelFileChecker(String sid,  String xmlString, String workingDirectory ){
        this.SID = sid;
        Globals.ROOT_FP = workingDirectory;
        Globals.USERPATH =  workingDirectory + "/users/";
        Globals.RESOURCEPATH =  workingDirectory + "/resources/";
        this.USERFOLDER = Globals.USERPATH +  "user" + sid + "/";

        //ensure directory for sid exists
        if(!(new File(USERFOLDER).exists())){
            //setup a new user folder
            new File(USERFOLDER).mkdir();
            //setup a blank dot_files folder
            new File(USERFOLDER + "dot_files").mkdir();
            //setup a blank prism folder
            new File(USERFOLDER + "prism").mkdir();
        }
        initialize();
        //System.out.println("Done Initializing");
        //System.out.println("getting interaction groups test " + interaction.getGroups());
        loadModelXMLString(xmlString, interaction);
        //System.out.println("Done Loading interaction and now about to start check");
        performCheck();
        //System.out.println("now about to load violations");

        loadViolations();
     
        printXMLViolationDocument();

        destroyUserFolder();
        //System.out.println("printing all violations ---");
        //interaction.printViolations();

        //System.out.println("getting xml xoc");
        //Document doc = getXMLViolationDocument();

        /*
        System.out.println("Root element" + doc.getDocumentElement().getNodeName());
        NodeList nList = doc.getElementsByTagName("violation");
        for(int temp = 0;temp<nList.getLength(); temp++){
            Node nNode = nList.item(temp);
            System.out.println(" Current Element " + nNode.getNodeName());
            Element elem = (Element) nNode;
            System.out.println("Type " + elem.getElementsByTagName("type").item(0).getTextContent());
        }
        
    */
    }
    
    public ModelFileChecker(String sid,  String workingDirectory){
        //this is called by RoVer.sh
        this.SID = sid;
        Globals.ROOT_FP = workingDirectory;
        Globals.USERPATH =  workingDirectory + "/users/";
        Globals.RESOURCEPATH =  workingDirectory + "/resources/";
        this.USERFOLDER = Globals.USERPATH +  "user" + sid + "/";

        //ensure directory for sid exists
        if(!(new File(USERFOLDER).exists())){
            //setup a new user folder
            new File(USERFOLDER).mkdir();
            //setup a blank dot_files folder
            new File(USERFOLDER + "dot_files").mkdir();
            //setup a blank prism folder
            new File(USERFOLDER + "prism").mkdir();
        }
        initialize();
        //System.out.println("Done Initializing");
        //System.out.println("getting interaction groups test " + interaction.getGroups());
        loadModelFile("interaction.xml", interaction);
        //System.out.println("Done Loading interaction and now about to start check");
        performCheck();
        //System.out.println("now about to load violations");

        
        loadViolations();

        printXMLViolationDocument();

        //System.out.println("printing all violations ---");
        //interaction.printViolations();

        //System.out.println("getting xml xoc");
        //Document doc = getXMLViolationDocument();

        /*
        System.out.println("Root element" + doc.getDocumentElement().getNodeName());
        NodeList nList = doc.getElementsByTagName("violation");
        for(int temp = 0;temp<nList.getLength(); temp++){
            Node nNode = nList.item(temp);
            System.out.println(" Current Element " + nNode.getNodeName());
            Element elem = (Element) nNode;
            System.out.println("Type " + elem.getElementsByTagName("type").item(0).getTextContent());
        }
        
    */
    }

    public ModelFileChecker(String sid){
        //set global filepaths
       this.SID = sid;
               Globals.ROOT_FP = "/home/new/rover";
        Globals.USERPATH =  "/home/new/rover/users/";
        Globals.RESOURCEPATH =  "/home/new/rover/resources/";
        this.USERFOLDER = Globals.USERPATH +  "user" + sid + "/";

        //ensure directory for sid exists
        if(!(new File(USERFOLDER).exists())){
            //setup a new user folder
            new File(USERFOLDER).mkdir();
            //setup a blank dot_files folder
            new File(USERFOLDER + "dot_files").mkdir();
            //setup a blank prism folder
            new File(USERFOLDER + "prism").mkdir();
        }



        initialize();
        //System.out.println("Done Initializing");

  
        
       // System.out.println("getting interaction groups test " + interaction.getGroups());
        loadModelFile("test.xml", interaction);
        //System.out.println("Done Loading interaction");

        performCheck();

        loadViolations();

        
        //System.out.println(" printing all violations now 9594839r820483928r9e===!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        //interaction.printViolations();

        printXMLViolationDocument();

        // System.out.println("getting xml xoc");
        // Document doc = getXMLViolationDocument();
        // System.out.println("Root element" + doc.getDocumentElement().getNodeName());
        // NodeList nList = doc.getElementsByTagName("violation");
        // for(int temp = 0;temp<nList.getLength(); temp++){
        //     Node nNode = nList.item(temp);
        //     System.out.println(" Current Element " + nNode.getNodeName());
        //     Element elem = (Element) nNode;
        //     System.out.println("Type " + elem.getElementsByTagName("type").item(0).getTextContent());
        // }
        
        //destroyUserFolder();
    }

    //note the current instance of this modelfilechecker should not be used again after calling this method
    public void destroyUserFolder(){
        File folder = new File(USERFOLDER);
        deleteFolder(folder);
    }

    private void deleteFolder(File folder){
        for(File subFile : folder.listFiles()){
            if(subFile.isDirectory()){
                deleteFolder(subFile);
            }else{
                subFile.delete();
            }
        }
        folder.delete();
    }

    public Document getXMLViolationDocument(){
            if (backgroundThread != null && backgroundThread.getThread().isAlive())
            try {
                backgroundThread.getThread().join();
            } catch (InterruptedException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        return interaction.getXMLViolationDocument();
    }

    //print violationdocument to stdout as an xml string so parent process can redirect output
    public void printXMLViolationDocument(){
        Document xmlDocument = getXMLViolationDocument();
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer transformer;
        try{
            transformer = tf.newTransformer();

            StringWriter writer = new StringWriter();

            transformer.transform(new DOMSource(xmlDocument), new StreamResult(writer));
            String xmlString = writer.getBuffer().toString();
            System.out.println(xmlString);
        }catch(Exception e){
            e.printStackTrace();
        }
    }



    public void performCheck(){
            if (backgroundThread != null && backgroundThread.getThread().isAlive())
            try {
                backgroundThread.getThread().join();
            } catch (InterruptedException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
               //System.out.println("getting interaction groups  after stopping background thread test " + interaction.getGroups());
        
       // Microinteraction newMicro = interaction.getMicros().get(interaction.getMicros().size()-1);

        new PrismThread(interaction, mainController); //used to include newMicro
        //System.out.println("getting interaction groups test after new prism thread " + interaction.getGroups());
        if (interaction.testIsCyclic()) {
            // start over again by wiping the end states!
            //System.out.println("test was cyclic");
            forceNetworkPropagation(false);
        } else {
            //System.out.println("test was not cyclic");
            ArrayList<Group> groupsToUpdate = new ArrayList<Group>();
            for(Group g : interaction.getGroups()){
                groupsToUpdate.add(g);
            }
            
           // groupsToUpdate.add((Group) node);
            interaction.getNetworkPropagator().propagateSequentialChanges(groupsToUpdate, interaction, mainController, false);
        }
        
        //System.out.println("Done with network propagation");

        verifyConcurrentAndGraph();
    }

    public void loadViolations(){
                if (backgroundThread != null && backgroundThread.getThread().isAlive())
            try {
                backgroundThread.getThread().join();
            } catch (InterruptedException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
     ViolationParser v = new ViolationParser(interaction,  propertyCategories,  mainController);
        v.update();
    }



    public void forceNetworkPropagation(boolean concurrent) {
        // start over again by wiping the end states!
        for (Group group : interaction.getGroups()) {
            group.wipeEndStates();
            // mark all of the microcollections as needing an update!
            group.markForUpdate();
        }

        // find the init!
        Group init = interaction.getInit();
        ArrayList<Group> groupsToUpdate = new ArrayList<Group>();
        groupsToUpdate.add(init);

        // find any other disjoint "inits"


        interaction.getNetworkPropagator().propagateSequentialChanges(groupsToUpdate, interaction, mainController, concurrent);
    }


    public void loadModelXML(Document xmlDoc, Interaction interaction){
       // InteractionFileLoader loader = new InteractionFileLoader(fileName, interaction, this);
        Decoder decoder = new Decoder(this, isNonAssisted);
        decoder.readSupreme(xmlDoc, interaction); 
    }

    public void loadModelXMLString(String xmlString, Interaction interaction){
       // InteractionFileLoader loader = new InteractionFileLoader(fileName, interaction, this);
        Decoder decoder = new Decoder(this, isNonAssisted);
        decoder.readSupremeXMLString(xmlString, interaction); 
    }

    public void loadModelFile(String fileName, Interaction interaction){
       // InteractionFileLoader loader = new InteractionFileLoader(fileName, interaction, this);
        Decoder decoder = new Decoder(this, isNonAssisted);
        decoder.readSupreme(fileName, interaction); //absFilePath + "Supreme.xml"
    }


    public void initialize() {
        // most importantly, set self
        mainController = this;

        //Set the current working directory
        absFilePath = Globals.ROOT_FP + File.separator + "resources" + File.separator + "Interaction" + File.separator; //System.getProperty("user.dir") + File.separator + "Interaction" + File.separator;

        // properties file
        propsFile = new File(absFilePath + "GraphProperties.xml");
        PropertyFileDecoder propFileDecoder = new PropertyFileDecoder();
        graphProperties = propFileDecoder.decode(propsFile);
        propertyCategories = propFileDecoder.getPropertyCategories();
        propertyCategories.add("Jams");
        propertyCategories.add("Speech Flubs");
        propertyCategories.add("Branching Errors");

        // Currently set to empty declarations
        interaction = new Interaction(graphProperties);
        interaction.setUSERFOLDER(this.USERFOLDER);
        currGroupTransition = null;

        //TODO figure out way to safely remove
        interaction.setTutorial(false);
        interaction.setNonAssistedSwitch(isNonAssisted);

        buttonFlag = 0;
        //importMicrosCT = new ImportMicrosCT(this);
       // rep = new Repairer(interaction, this, importMicrosCT); //shouldnt or dont know how to use

        readInteraction();
        staticTooltips = new HashMap<>(); //probably could be removed
       // initialize the booleans that control starting, stopping, and clearing the designs
        canStartExp = true;
        canStopExp = false;
        canClearDesign = false;//these can probably be removed



        // finally, start the prism model checker   (how this and prism works should be redone)
        // comment this out if starting prism immediately is not desired
        PrismThread pt = new PrismThread( interaction, this);
        Thread t = pt.getThread();
        pt.start("");
        //System.out.println("Made interaction, Started First Prism Thread");
        //wait for initialize to be done
        try{
            t.join();
        }catch(InterruptedException e){
            e.printStackTrace();
        }
       

    }   



        public void startDesign() {
        if (canStartExp) {

          //  selectButton.setSelected(true);

            interaction.startDesign( mainController);

           // interaction.reinitializeBugTracker();

            ArrayList<Group> groupsToUpdate = new ArrayList<>(interaction.getGroups());

           // realignTransitions();
            //interaction.updateAllAndDisplayConditions();

            interaction.getNetworkPropagator().propagateSequentialChanges(groupsToUpdate,interaction, mainController, false);

            // lastly, set the positions of the groups!
           // interaction.getInit().setLayoutX(100);
           // interaction.getInit().setLayoutY(100);
          //  interaction.getInit().refresh();

            canStartExp = false;
            canStopExp = true;
        }
    }



    // read all files in the interaction and build them using supreme.xml
    // this method should ONLY be called during initialization OR when reading in
    // another project
    public void readInteraction() {
        // get all of the microinteractions from the microinteraction folder
        File dir = new File(absFilePath + "MicroInteractions" + File.separator);
        ArrayList<File> files = new ArrayList<>();
        for (File file : dir.listFiles()) {

            // this is clunky -- should probably be redone at some point
            if (!file.getName().contains("ignore") && !(file.getName().charAt(0) == '.')) {
                files.add(file);
            }
        }

        // iterate through the files and build new
        for (File f : files) {
            String filename = f.getAbsolutePath();
            Microinteraction micro = new Microinteraction();
            Decoder d = new Decoder(this, isNonAssisted);
            d.readMicrointeraction(f, filename, micro);
           // micro.addParameterizer(new MicroParameterizer(micro.getGlobalVars(), this));
            if (!(micro.getName().contains("temp"))) {
                micro.build();
             //  if (isNonAssisted)
                //    micro.setStaticTooltip(staticTooltips.get(micro.getName()));
                interaction.addMicro(micro);
            }
        }

        //buildInteractionHelper(); //could possible be removed?
        
    }


     public Boolean getNonAssistedSwitch() {
        return isNonAssisted;
    }

    private void buildInteractionHelper() {
        groups = interaction.getGroups();
        //System.out.println("near end of init, now groups sie is  " + groups.size());
        Decoder decoder = new Decoder(this, isNonAssisted);
        decoder.readSupreme(absFilePath + "Supreme.xml", interaction);

        // Read MicroCollections and transitions. Build the same way as a tab in
        // microinteraction
        groups = interaction.getGroups();
        //System.out.println("near end of init, now groups sie is  " + groups.size());
        
        for (Group group : groups) {
            for (Microinteraction micro : group.getMicrointeractions()){

            }
                //micro.addParameterizer(new MicroParameterizer(micro.getGlobalVars(), this));
            //addMicroColEventHandler(interactionPane, group);
           // addMicroColGPEventHandler(interactionPane, group);
            //interactionPane.addCollection(group, 0, 0);
        }
    }




//----------------------------------------------------------------------------------------------things after init



  public void endSimulate() {

        //end the simulation

        resetNao();
    }

    public void resetNao() {

    }




public boolean[] getEndStates(Node node) {
        boolean readyExists = false;
        boolean busyExists = false;
        boolean ignoreExists = false;

        boolean noBreakdownExists = false;
        boolean breakdownExists = false;

        // obtain all combinations of end states from the scratch
        HashMap<Microinteraction, ArrayList<Integer>> endStateIdxs = ((Group) node).getEndStateIdxs();
        HashMap<Microinteraction, HashMap<Integer, ArrayList<State>>> micro2idx2state = ((Group) node).getMicro2Idx2State();

        if (endStateIdxs != null && micro2idx2state != null) {
            Iterator it = endStateIdxs.entrySet().iterator();
            while (it.hasNext()) {
                HashMap.Entry pair = (HashMap.Entry) it.next();
                Microinteraction micro = (Microinteraction) pair.getKey();
                ArrayList<Integer> idxs = (ArrayList<Integer>) pair.getValue();

                for (Integer i : idxs) {
                    ArrayList<State> sts = micro2idx2state.get(micro).get(i);
                    for (State st : sts) {
                        if (st.getStateClass().equals(StateClass.READY))
                            readyExists = true;
                        else if (st.getStateClass().equals(StateClass.BUSY))
                            busyExists = true;
                        else if (st.getStateClass().equals(StateClass.IGNORE))
                            ignoreExists = true;

                        if (st.isBreakdown())
                            breakdownExists = true;
                        else
                            noBreakdownExists = true;
                    }
                }
            }
        }

        boolean[] result = {readyExists, busyExists, ignoreExists, breakdownExists, noBreakdownExists};
        return result;
    }



    public void addMacroTrans(GroupTransition mt) {

    }

 public void addMicroToGroup(Group node, File file) {
     //not used
        System.out.println("ERROR ADDD MICRO TO GROUP CALLED (WRONG VERSION) SEE MODELFILECHECKER CLASS");
        Microinteraction newMicro = new Microinteraction();
        (new Decoder(this, isNonAssisted)).readMicrointeraction(file, file.getAbsolutePath(), newMicro);

        // sets up a parameterizer specific to this GUI
        newMicro.addParameterizer(new MicroParameterizer(newMicro.getGlobalVars(), this));

        newMicro.build();

        /*
         * don't do anything if this microinteraction already exists!
         */
        boolean alreadyExists = false;
        int microCount = 0;
        for (Microinteraction micro : ((Group) node).getMicrointeractions()) {
            if (micro.getName().equals(newMicro.getName()))
                alreadyExists = true;
            microCount += 1;
        }

        if (alreadyExists) {
            //TODO add violation
            //System.out.println("Cannot add microinteraction " + newMicro.getName() + " because it already exists in this grouping.");
            return;
        }

        /*
         * don't do anything if there are already 4 microinteractions in the group!
         */
        if (microCount > 3) {
            //TODO add violation
            //System.out.println("Cannot add microinteraction " + newMicro.getName() + " because there are already 4 in the group.");
            return;
        }


        /*
         * done checking if it already exists
         */

        // stop the background thread if necessary
        if (backgroundThread != null && backgroundThread.getThread().isAlive())
            try {
                backgroundThread.getThread().join();
            } catch (InterruptedException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }

        interaction.addMicro(newMicro);
        ((Group) node).addMicro(newMicro);
        new PrismThread(interaction, mainController, newMicro);

        /*
         * THIS IS WHERE WE CAN BEGIN NETWORK PROPAGATION INSTEAD OF USING THE CODE THAT IS COMMENTED OUT BELOW
         */

        // tell backgroundthread to finish if necessary!
        if (backgroundThread != null && backgroundThread.getThread().isAlive()) {
            try {
                backgroundThread.getThread().join();
            } catch (InterruptedException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

        //System.out.println("Network propagation");
        if (interaction.testIsCyclic()) {
            // start over again by wiping the end states!
            forceNetworkPropagation(false);
        } else {
            ArrayList<Group> groupsToUpdate = new ArrayList<Group>();
            groupsToUpdate.add((Group) node);
            interaction.getNetworkPropagator().propagateSequentialChanges(groupsToUpdate,  interaction, mainController, false);
        }
        //System.out.println("Done with network propagation");

        verifyConcurrentAndGraph();

       //a setMicrointeractionTooltip(newMicro);
    }



    //FIXME: move to Interaction or maybe somewhere else
    public void verify() {
        if (canStopExp) { // means that the design session has started!
            // tell backgroundthread to finish if necessary!
            if (backgroundThread != null && backgroundThread.getThread().isAlive()) {
                try {
                    backgroundThread.getThread().join();
                } catch (InterruptedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
            }
            forceNetworkPropagation(false);
            verifyConcurrentAndGraph();
        }
    }

        public int getFlag() {
        return buttonFlag;
    }


       public void verifyConcurrentAndGraph() {
        backgroundThread = new PrismThread( interaction, this, interaction.getInit());
        Thread t = backgroundThread.getThread();
        backgroundThread.start("concurrentAndGraph");
    }

    public String getSID(){
        return SID;
    }

    public String getUSERFOLDER(){
        return USERFOLDER;
    }
}