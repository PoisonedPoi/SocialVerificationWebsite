package edu.hci.SocialVerificationWebsite.violationParser;

import java.io.File;

import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.io.ByteArrayInputStream;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import org.w3c.dom.Document;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.Transformer;
import java.io.StringWriter;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Service
public class ViolationParserService {

    public String parseXMLToString(String clientXML) throws Exception {
        
        InputStream xmlFromClient = new ByteArrayInputStream(clientXML.getBytes());

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder documentBuilder = factory.newDocumentBuilder();
        Document xmlDocument = documentBuilder.parse(xmlFromClient);  // new InputSource(new StringReader( testXML))
        xmlDocument.getDocumentElement().normalize();
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer transformer;

        try{
            transformer = tf.newTransformer();
            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(xmlDocument), new StreamResult(writer));
            return writer.getBuffer().toString();
        }catch(Exception e){
            e.printStackTrace();
            throw new Exception();
        }
    }

    public String getViolations(String modelXMLString) throws Exception {

        // Run RoVer to verify XML model
        // Currently used to create a session for the model
        // FUTURE: tied to user session
        String randNum = Integer.toString((int) (Math.random() * 10000));

        ProcessBuilder pb = new ProcessBuilder("./runRover.sh", randNum, modelXMLString);
        File runRoVerPath = new File("/srv/rover/main/");
        pb.directory(runRoVerPath);
        Process proc = pb.start();

        // Read output from RoVer
        String violations = "";

        String line = null;
        BufferedReader in = new BufferedReader(
            new InputStreamReader(proc.getInputStream()));
        while ((line = in.readLine()) != null) {
            System.out.println(line);
            violations+=line;
        }

        proc.waitFor();
        System.out.println("exitValue() for user " + randNum + ": " + proc.exitValue());

        return violations;
    }

}
