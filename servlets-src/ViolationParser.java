//package servlets;

/*
 * <?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://xmlns.jcp.org/xml/ns/javaee" xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd" version="4.0">
  <display-name>rover-web-app</display-name>
  <welcome-file-list>
    <welcome-file>index.html</welcome-file>
    <welcome-file>index.htm</welcome-file>
    <welcome-file>index.jsp</welcome-file>
    <welcome-file>default.html</welcome-file>
    <welcome-file>default.htm</welcome-file>
    <welcome-file>default.jsp</welcome-file>
  </welcome-file-list>
  <servlet>
    <description></description>
    <display-name>ViolationParser</display-name>
    <servlet-name>ViolationParser</servlet-name>
    <servlet-class>servlets.ViolationParser</servlet-class>
  </servlet>
  <servlet-mapping>
    <servlet-name>ViolationParser</servlet-name>
    <url-pattern>/ViolationParser</url-pattern>
  </servlet-mapping>
</web-app>
*/




import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringWriter;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;

/**
 * Servlet implementation class ViolationParser
 */
public class ViolationParser extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ViolationParser() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
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
	
	private static void printLines(String cmd, InputStream ins) throws Exception {
        String line = null;
        BufferedReader in = new BufferedReader(
            new InputStreamReader(ins));
        while ((line = in.readLine()) != null) {
            System.out.println(cmd + " " + line);
        }
      }

}
