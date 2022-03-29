package servlets;

import aCheck.ModelFileChecker;


import prism.ModelChecker;
import jakarta.servlet.*;
import jakarta.servlet.http.*;

import java.io.*;
import javax.xml.parsers.*;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.util.*;
import java.util.stream.Collectors;

import org.w3c.dom.*;
import org.xml.sax.InputSource;

public class CheckerServlet extends HttpServlet {

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException{
		doPost(request, response);
	}
	
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException{

		String testXML = "<xml> <servlet> <servlet-name>Checker</servlet-name></servlet></xml>";
		try{
			// 1. Create XML doc from input         
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			DocumentBuilder documentBuilder = factory.newDocumentBuilder();
			Document xmlDocument = documentBuilder.parse(request.getInputStream());  // new InputSource(new StringReader( testXML))
			xmlDocument.getDocumentElement().normalize();
			TransformerFactory tf = TransformerFactory.newInstance();
	        Transformer transformer;
	        String modelXMLString = "";
	        try{
	            transformer = tf.newTransformer();
	            StringWriter writer = new StringWriter();
	            transformer.transform(new DOMSource(xmlDocument), new StreamResult(writer));
	            modelXMLString = writer.getBuffer().toString();
	        }catch(Exception e){
	            e.printStackTrace();
	        }
//	        
//	        
//	        DocumentBuilder db = DocumentBuilderFactory.newInstance().newDocumentBuilder();
//	        Document doc = db.parse(new ByteArrayInputStream(modelXMLString.getBytes("UTF-8")));
//	        System.out.println("Success");
//	        
	        //System.out.println("before");
	        //System.out.println(modelXMLString);
	        //System.out.println("after");
	        //System.out.println(modelXMLString);
			String randNum = Integer.toString((int) (Math.random() * 10000));
			//String modelXMLString = new BufferedReader(new InputStreamReader(request.getInputStream())).lines().collect(Collectors.joining("\n"));
			
//			Scanner s = new Scanner(request.getInputStream()).useDelimiter("//A");
//			modelXMLString = s.hasNext() ? s.next() : "";
//			s.close();
//			modelXMLString.concat("\"");
//			modelXMLString = "\"" + modelXMLString;
			
			System.out.println("recieved request");
			ProcessBuilder pb = new ProcessBuilder("./runRover.sh", randNum, modelXMLString);
			File runRoVerPath = new File("/home/new/Documents/git/checker2/Rover/");
			pb.directory(runRoVerPath);
			Process proc = pb.start();
			String violations = "";
//	        BufferedReader in = new BufferedReader(
//	                new InputStreamReader(proc.getInputStream()));
//	            while ((violations = violations + in.readLine()) != null) {
//	            }
	        String line = null;
	        BufferedReader in = new BufferedReader(
	            new InputStreamReader(proc.getInputStream()));
	        while ((line = in.readLine()) != null) {
	            System.out.println(line);
	            violations+=line;
	        }
	        
	        //printLines(" stdout:", proc.getInputStream());
	        printLines(" stderr:", proc.getErrorStream());
	        proc.waitFor();
	        System.out.println("exitValue() for user " + randNum + ": " + proc.exitValue());
//	        BufferedReader in = new BufferedReader(
//	                new InputStreamReader(proc.getInputStream()));
//	        String violations = in.lines().collect((Collectors.joining())); //note the program should only ever print once
//	       
			//runProcess("/home/new/Documents/git/checker2/Rover/runRover.sh 123 \"test space\"");
			//ModelFileChecker model = new ModelFileChecker(randNum, xmlDocument);
			//Document violationDocument = model.getXMLViolationDocument();
			//model.destroyUserFolder();
			//ModelFileChecker model4 = new ModelFileChecker("127",xmlDocument);;
			//model.initialize(); //if we can get it to initialize that is all that needs to be done for now, 
			//note model will eventually return an xml doc which will then be parsed and returned
			//Document violationDocument = model4.getXMLViolationDocument();
			//transformer.transform(new DOMSource(violationDocument), new StreamResult(writer));

			response.setContentType("text/xml");
			PrintWriter out = response.getWriter();
			out.println(violations);
	
		 } catch(Exception e) {
			try {
				PrintWriter out = response.getWriter();
				out.println(e.toString());
			} catch(Exception f) {
				f.printStackTrace();
			}

		}
	}
	
	//helper methods below---------
    private static void printLines(String cmd, InputStream ins) throws Exception {
        String line = null;
        BufferedReader in = new BufferedReader(
            new InputStreamReader(ins));
        while ((line = in.readLine()) != null) {
            System.out.println(cmd + " " + line);
        }
      }

      private static void runProcess(String command) throws Exception {
    	  System.out.println("running");
    	  System.out.println(command);
    	  System.out.println("");
        Process pro = Runtime.getRuntime().exec(command);
        printLines(" stdout:", pro.getInputStream());
        printLines(" stderr:", pro.getErrorStream());
        pro.waitFor();
        System.out.println(command + " exitValue() " + pro.exitValue());
      }
}

