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
			String randNum = Integer.toString((int) (Math.random() * 10000));
			runProcess("/home/new/Documents/git/checker2/Rover/runRover.sh " + randNum);
			//ModelFileChecker model = new ModelFileChecker(randNum, xmlDocument);
			//Document violationDocument = model.getXMLViolationDocument();
			//model.destroyUserFolder();
			//ModelFileChecker model4 = new ModelFileChecker("127", xmlDocument);
			//model.initialize(); //if we can get it to initialize that is all that needs to be done for now, 
			//note model will eventually return an xml doc which will then be parsed and returned

			TransformerFactory tf = TransformerFactory.newInstance();
			Transformer transformer = tf.newTransformer();
			StringWriter writer = new StringWriter();
			//transformer.transform(new DOMSource(violationDocument), new StreamResult(writer));
			String xmlString = writer.getBuffer().toString();

			response.setContentType("text/xml");
			PrintWriter out = response.getWriter();
			out.println(xmlString);
	
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
        Process pro = Runtime.getRuntime().exec(command);
        printLines(command + " stdout:", pro.getInputStream());
        printLines(command + " stderr:", pro.getErrorStream());
        pro.waitFor();
        System.out.println(command + " exitValue() " + pro.exitValue());
      }
}

