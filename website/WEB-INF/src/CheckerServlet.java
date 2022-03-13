
import aCheck.ModelFileChecker;
import package1.*;

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

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException{
      
        String testXML = "<xml> <servlet> <servlet-name>Checker</servlet-name></servlet></xml>";
            try{
         // 1. Create XML doc from input         
           DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
           DocumentBuilder documentBuilder = factory.newDocumentBuilder();
           Document xmlDocument = documentBuilder.parse(request.getInputStream());


        
        ModelFileChecker model = new ModelFileChecker();
        model.initialize(); //if we can get it to initialize that is all that needs to be done for now, 

        Tester test = new Tester();
        String retStr = test.test();

        //note model will eventually return an xml doc which will then be parsed and returned

            TransformerFactory tf = TransformerFactory.newInstance();
            Transformer transformer = tf.newTransformer();
            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(xmlDocument), new StreamResult(writer));
            String xmlString = writer.getBuffer().toString();
                      
            response.setContentType("text/xml");
            PrintWriter out = response.getWriter();
            //  out.println(xmlString);
            out.println(retStr);

            }catch(Exception e){
                try{
                     PrintWriter out = response.getWriter();
                     out.println(e.toString());
                }catch(Exception f){
                    f.printStackTrace();
                }
    
            }
    }
}

