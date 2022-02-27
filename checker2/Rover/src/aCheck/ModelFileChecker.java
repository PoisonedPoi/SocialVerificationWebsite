package aCheck;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

import javafx.embed.swing.SwingFXUtils;

import javax.imageio.ImageIO;
import java.io.File;
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

import javafx.scene.*;
import javafx.scene.control.*;
import javafx.scene.input.*;
import javafx.application.Platform;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.geometry.Point2D;
import javafx.scene.canvas.Canvas;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.image.WritableImage;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Polygon;
import javafx.scene.text.Text;
import javafx.util.Duration;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.scene.text.Font;
import javafx.stage.WindowEvent;


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

    public ModelFileChecker(){
        /*
        System.out.println("Starting ModelFileChecker");
        initialize();
        System.out.println("Done Initializing");

  

        System.out.println("getting interaction groups test " + interaction.getGroups());
        loadModelFile("interaction.xml", interaction);
        System.out.println("Done Loading interaction");

        performCheck();

        loadViolations();

        interaction.printViolations();
        */
    }



    public void performCheck(){
            if (backgroundThread != null && backgroundThread.getThread().isAlive())
            try {
                backgroundThread.getThread().join();
            } catch (InterruptedException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
               System.out.println("getting interaction groups  after stopping background thread test " + interaction.getGroups());
        
       // Microinteraction newMicro = interaction.getMicros().get(interaction.getMicros().size()-1);

        new PrismThread(interaction, mainController); //used to include newMicro
        System.out.println("getting interaction groups test after new prism thread " + interaction.getGroups());
        if (interaction.testIsCyclic()) {
            // start over again by wiping the end states!
            System.out.println("test was cyclic");
            forceNetworkPropagation(false);
        } else {
            System.out.println("test was not cyclic");
            ArrayList<Group> groupsToUpdate = new ArrayList<Group>();
            for(Group g : interaction.getGroups()){
                groupsToUpdate.add(g);
            }
            
           // groupsToUpdate.add((Group) node);
            interaction.getNetworkPropagator().propagateSequentialChanges(groupsToUpdate, interaction, mainController, false);
        }
        
        System.out.println("Done with network propagation");

        verifyConcurrentAndGraph();
    }

    public void loadViolations(){
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




    public void loadModelFile(String fileName, Interaction interaction){
   
       // InteractionFileLoader loader = new InteractionFileLoader(fileName, interaction, this);
        Decoder decoder = new Decoder(this, isNonAssisted);
        decoder.readSupreme(fileName, interaction); //absFilePath + "Supreme.xml"
        

    }


    private void initialize() {
        // most importantly, set self
        mainController = this;

        //Set the current working directory
        absFilePath = System.getProperty("user.dir") + File.separator + "Interaction" + File.separator;

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
        t.setPriority(Thread.MAX_PRIORITY);  // I think this is completely unnecessary and doesn't result in a change of speed
        pt.start("");

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
        System.out.println("near end of init, now groups sie is  " + groups.size());
        Decoder decoder = new Decoder(this, isNonAssisted);
        decoder.readSupreme(absFilePath + "Supreme.xml", interaction);

        // Read MicroCollections and transitions. Build the same way as a tab in
        // microinteraction
        groups = interaction.getGroups();
        System.out.println("near end of init, now groups sie is  " + groups.size());
        
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

        Microinteraction newMicro = new Microinteraction();
        (new Decoder(this, isNonAssisted)).readMicrointeraction(file, file.getAbsolutePath(), newMicro);

        // sets up a parameterizer specific to this GUI
        newMicro.addParameterizer(new MicroParameterizer(newMicro.getGlobalVars(), this));

        newMicro.build();
        if (isNonAssisted)
            newMicro.setStaticTooltip(staticTooltips.get(newMicro.getName()));

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
            System.out.println("Cannot add microinteraction " + newMicro.getName() + " because it already exists in this grouping.");
            return;
        }

        /*
         * don't do anything if there are already 4 microinteractions in the group!
         */
        if (microCount > 3) {
            System.out.println("Cannot add microinteraction " + newMicro.getName() + " because there are already 4 in the group.");
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

        System.out.println("Network propagation");
        if (interaction.testIsCyclic()) {
            // start over again by wiping the end states!
            forceNetworkPropagation(false);
        } else {
            ArrayList<Group> groupsToUpdate = new ArrayList<Group>();
            groupsToUpdate.add((Group) node);
            interaction.getNetworkPropagator().propagateSequentialChanges(groupsToUpdate,  interaction, mainController, false);
        }
        System.out.println("Done with network propagation");

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



    
}