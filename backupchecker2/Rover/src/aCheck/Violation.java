package aCheck;

import model.Group;
import model.Interaction;
import checkers.Property;
import java.util.ArrayList;

public class Violation{ 

    private Property prop; //the property that is violated
    private ArrayList<Group> groupsViolating; // if this property is violated by a group, this stores the list of groups violating this property
    private boolean tiesToInteraction; //properties are either related to groups or to an interaction, this is saying true if the prop is an interaction property f
    private String type;
    public Violation(Property prop){
        this.prop = prop;
        groupsViolating = new ArrayList<Group>();
        type = prop.getCategory();
        if(prop.getTies().equals("interaction")){
            tiesToInteraction = true;
        }else{
            tiesToInteraction = false;
        }
    }

    public String toString(){
        String returnString = "";
        returnString += "TYPE: " + type + "\n" + prop.toString() + " \nDesc: " + prop.getDescription() ;
        if(!tiesToInteraction){
            for(Group g : groupsViolating){
                   returnString += "\nGROUP: " + g.toString() ;
            }
         }
        return returnString;


    }

    public void addGroupViolating(Group g){
        if(tiesToInteraction){
            System.out.println("WARNING: tried to add a group to an interaction only property, see Violation class");
            return;
        }
        groupsViolating.add(g);
    }

    public boolean isViolatingAtInteractionLevel(){
        return tiesToInteraction;
    }

    public boolean isViolatingAtGroupLevel(){
        return !tiesToInteraction;
    }



    public Property getProperty(){
        return prop;
    }

    public ArrayList<Group> getGroupsViolating(){
        return groupsViolating;
    }




}