package aCheck;

import java.awt.Point;
import java.io.File;
import java.util.HashMap;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import model.*;
import model_ctrl.*;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/*
* This class is no longer used and can be removed if desired, it was originally used in place of the Decoder but eventually the decoder was just refactored
*/

public class InteractionFileLoader {
  HashMap<Integer, Group> addedGroups = new HashMap<Integer, Group>();
  //loads interaction data into the interaction model from Document
  public InteractionFileLoader(
    Document conDoc,
    Interaction interaction,
    ModelFileChecker mc
  ) {
    //load the document into memory
    Document doc = conDoc;
    NodeList gList = doc.getElementsByTagName("group");
    for (int i = 0; i < gList.getLength(); i++) {
      //add group to interaction
      System.out.println("adding new group with i being " + i);
      Group newGroup = new Group(false, null);
      interaction.addGroup(newGroup);

      Element group = (Element) gList.item(i);
      newGroup.setName(
        group.getElementsByTagName("name").item(0).getTextContent()
      );
      addedGroups.put(Integer.parseInt(group.getAttribute("id")), newGroup);

      if (group.getAttribute("init").equals("true")) {
        newGroup.setToInit();
        interaction.setInit(newGroup);
      }
      //add the microinteractions in that group
      NodeList mList = group.getElementsByTagName("micro");
      for (int j = 0; j < mList.getLength(); j++) {
        Element micro = (Element) mList.item(j);
        String microName = micro
          .getElementsByTagName("name")
          .item(0)
          .getTextContent();
        System.out.println("micro name is " + microName);
        Microinteraction newMicro = new Microinteraction();

        String currentPath = System.getProperty("user.dir");
        File microFile = new File(currentPath + "/Lib2/" + microName + ".xml");

        System.out.println("decoding micro");
        (new Decoder(mc, false)).readMicrointeraction(
            microFile,
            microFile.getAbsolutePath(),
            newMicro
          ); //maybe should use true for deecoder
        System.out.println("buildilng micro");
        //newMicro.addParameterizer(new MicroParameterizer(newMicro.getGlobalVars(), mc)); only gui components in here
        newMicro.build();
        System.out.println("adding micros");
        interaction.addMicro(newMicro);
        newGroup.addMicro(newMicro);
        System.out.println("now adding params to micro");

        //now add global variables, or global variables that are parameterizable for this microinteraction
        NodeList parameterizable = micro.getElementsByTagName("parameter");
        for (int k = 0; k < parameterizable.getLength(); k++) {
          System.out.println("printing parameterizable");
          Element parameter = (Element) parameterizable.item(k);

          String globName = parameter.getTextContent();
          System.out.println("starting " + globName);
          String globType = parameter.getAttribute("type"); // s here
          System.out.println("GlobType is " + globType);
          for (Variable glob : newMicro.getGlobalVars()) {
            if (glob.isParameterizable()) {
              if (glob.getName().equals(globName)) {
                if (glob.getType().equals("array")) {
                  System.out.println("doing array");
                  NodeList items = parameter.getElementsByTagName("item");
                  for (int r = 0; r < items.getLength(); r++) {
                    System.out.println("doing element");
                    Element item = (Element) items.item(r);
                    glob.addItemToArray(
                      item.getAttribute("value"),
                      item.getAttribute("link")
                    );
                  }
                } else {
                  System.out.println("normal");
                  String thisVar = parameter.getAttribute("val");
                  System.out.println("this var is " + thisVar);
                  glob.setValue(thisVar);
                }
              }
            }
          }

          //sanity check
          for (Variable glob : newMicro.getGlobalVars()) {
            System.out.println(glob.toString());
          }
        }
      }
    }

    //load transitions into memory
    NodeList tList = doc.getElementsByTagName("transition");
    for (int i = 0; i < tList.getLength(); i++) {
      System.out.println("read transition");
      GroupTransition groupTransition;
      Element trans = (Element) tList.item(i);

      Element source = (Element) trans.getElementsByTagName("source").item(0);
      Element target = (Element) trans.getElementsByTagName("target").item(0);
      int sourceID = Integer.parseInt(source.getAttribute("ref"));
      int targetID = Integer.parseInt(target.getAttribute("ref"));

      groupTransition =
        new GroupTransition(
          addedGroups.get(sourceID),
          addedGroups.get(targetID),
          null
        );

      boolean[] humanTransitions = new boolean[3];
      for (int k = 0; k < 3; k++) {
        humanTransitions[k] = false;
      }

      NodeList guards = trans.getElementsByTagName("guard");
      for (int j = 0; j < guards.getLength(); j++) {
        Element guard = (Element) guards.item(j);
        String condition = guard.getAttribute("condition");
        switch (condition) {
          case "human_ready":
            switch (guard.getAttribute("condition")) {
              case "true":
                humanTransitions[0] = true;
                break;
              case "false":
                humanTransitions[1] = false;
                break;
            }
            break;
          case "human_busy":
            switch (guard.getAttribute("condition")) {
              case "true":
                humanTransitions[0] = true;
                break;
              case "false":
                humanTransitions[1] = false;
                break;
            }
            break;
          case "human_ignore":
            switch (guard.getAttribute("condition")) {
              case "true":
                humanTransitions[0] = true;
                break;
              case "false":
                humanTransitions[1] = false;
                break;
            }
            break;
        }
      }

      groupTransition.setAllHumanBranching(humanTransitions);

      interaction.addTransition(groupTransition);
    }
  }

  //loads interaction data into memory from file
  public InteractionFileLoader(
    String fileName,
    Interaction interaction,
    ModelFileChecker mc
  ) {
    System.out.println(interaction.getGroups().size());
    System.out.println("loading " + fileName);

    //load the document into memory
    Document doc = null;
    try {
      File xmlFile = new File(fileName);
      DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
      DocumentBuilder dBuilder;
      dBuilder = dbFactory.newDocumentBuilder();
      doc = dBuilder.parse(xmlFile);
      doc.getDocumentElement().normalize();
    } catch (Exception e) {
      System.out.println("error loading " + fileName);
      System.exit(0);
      return;
    }

    //load all groups into memory
    NodeList gList = doc.getElementsByTagName("group");
    for (int i = 0; i < gList.getLength(); i++) {
      //add group to interaction
      System.out.println("adding new group with i being " + i);
      Group newGroup = new Group(false, null); //null should be bug tracker

      interaction.addGroup(newGroup);

      Element group = (Element) gList.item(i);
      newGroup.setName(
        group.getElementsByTagName("name").item(0).getTextContent()
      );
      addedGroups.put(Integer.parseInt(group.getAttribute("id")), newGroup);

      if (group.getAttribute("init").equals("true")) {
        newGroup.setToInit();
        interaction.setInit(newGroup);
      }
      //add the microinteractions in that group
      NodeList mList = group.getElementsByTagName("micro");
      for (int j = 0; j < mList.getLength(); j++) {
        Element micro = (Element) mList.item(j);
        String microName = micro
          .getElementsByTagName("name")
          .item(0)
          .getTextContent();
        System.out.println("micro name is " + microName);
        Microinteraction newMicro = new Microinteraction();

        String currentPath = System.getProperty("user.dir");
        File microFile = new File(currentPath + "/Lib2/" + microName + ".xml");

        System.out.println("decoding micro");
        (new Decoder(mc, false)).readMicrointeraction(
            microFile,
            microFile.getAbsolutePath(),
            newMicro
          ); //maybe should use true for deecoder
        System.out.println("buildilng micro");
        //newMicro.addParameterizer(new MicroParameterizer(newMicro.getGlobalVars(), mc)); only gui components in here
        newMicro.build();
        System.out.println("adding micros");
        interaction.addMicro(newMicro);
        newGroup.addMicro(newMicro);
        System.out.println("now adding params to micro");

        //now add global variables, or global variables that are parameterizable for this microinteraction
        NodeList parameterizable = micro.getElementsByTagName("parameter");
        for (int k = 0; k < parameterizable.getLength(); k++) {
          System.out.println("printing parameterizable");
          Element parameter = (Element) parameterizable.item(k);

          String globName = parameter.getTextContent();
          System.out.println("starting " + globName);
          String globType = parameter.getAttribute("type"); // s here
          System.out.println("GlobType is " + globType);
          for (Variable glob : newMicro.getGlobalVars()) {
            if (glob.isParameterizable()) {
              if (glob.getName().equals(globName)) {
                if (glob.getType().equals("array")) {
                  System.out.println("doing array");
                  NodeList items = parameter.getElementsByTagName("item");
                  for (int r = 0; r < items.getLength(); r++) {
                    System.out.println("doing element");
                    Element item = (Element) items.item(r);
                    glob.addItemToArray(
                      item.getAttribute("value"),
                      item.getAttribute("link")
                    );
                  }
                } else {
                  System.out.println("normal");
                  String thisVar = parameter.getAttribute("val");
                  System.out.println("this var is " + thisVar);
                  glob.setValue(thisVar);
                }
              }
            }
          }

          //sanity check
          for (Variable glob : newMicro.getGlobalVars()) {
            System.out.println(glob.toString());
          }
        }
      }
    }

    //load transitions into memory
    NodeList tList = doc.getElementsByTagName("transition");
    for (int i = 0; i < tList.getLength(); i++) {
      System.out.println("read transition");
      GroupTransition groupTransition;
      Element trans = (Element) tList.item(i);

      Element source = (Element) trans.getElementsByTagName("source").item(0);
      Element target = (Element) trans.getElementsByTagName("target").item(0);
      int sourceID = Integer.parseInt(source.getAttribute("ref"));
      int targetID = Integer.parseInt(target.getAttribute("ref"));

      groupTransition =
        new GroupTransition(
          addedGroups.get(sourceID),
          addedGroups.get(targetID),
          null
        );

      boolean[] humanTransitions = new boolean[3];
      for (int k = 0; k < 3; k++) {
        humanTransitions[k] = false;
      }

      NodeList guards = trans.getElementsByTagName("guard");
      for (int j = 0; j < guards.getLength(); j++) {
        Element guard = (Element) guards.item(j);
        String condition = guard.getAttribute("condition");
        switch (condition) {
          case "human_ready":
            switch (guard.getAttribute("condition")) {
              case "true":
                humanTransitions[0] = true;
                break;
              case "false":
                humanTransitions[1] = false;
                break;
            }
            break;
          case "human_busy":
            switch (guard.getAttribute("condition")) {
              case "true":
                humanTransitions[0] = true;
                break;
              case "false":
                humanTransitions[1] = false;
                break;
            }
            break;
          case "human_ignore":
            switch (guard.getAttribute("condition")) {
              case "true":
                humanTransitions[0] = true;
                break;
              case "false":
                humanTransitions[1] = false;
                break;
            }
            break;
        }
      }

      groupTransition.setAllHumanBranching(humanTransitions);

      interaction.addTransition(groupTransition);
    }
  }
}
