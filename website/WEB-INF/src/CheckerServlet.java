
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
                endString += "check1 ";
         // 1. Create XML doc from input         
           DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
           DocumentBuilder documentBuilder = factory.newDocumentBuilder();
           Document xmlDocument = documentBuilder.parse(request.getInputStream());     //new InputSource(new StringReader(testXML)));

        
            


            TransformerFactory tf = TransformerFactory.newInstance();
            Transformer transformer = tf.newTransformer();
            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(xmlDocument), new StreamResult(writer));
            String xmlString = writer.getBuffer().toString();
          
          

            // 2. Do your stuff with the Doc e.g. use doc.getDocumentElement()));
            response.setContentType("text/xml");
            PrintWriter out = response.getWriter();
              out.println(xmlString);

            }catch(Exception e){
                try{
        PrintWriter out = response.getWriter();
              out.println(e.toString());
              out.println("00000000");
              out.println(endString);
   
                }catch(Exception f){
                    f.printStackTrace();
                }
    
            }
      
      
      /*
      
      
      
        response.setContentType("text/html");
        try{
      PrintWriter out =  response.getWriter();
        out.println("<html><body>");
        out.println("<h1>Hello World!!!</h1>");
        out.println("</body></html>");
        }catch(Exception e){
            e.printStackTrace();
        }
    */
    }
}


/*


@Override
public void service(ServletRequest request, ServletResponse response)
        throws ServletException, IOException {
    try{
        HttpServletRequest hReq = (HttpServletRequest) request;
        if (hReq.getMethod().equalsIgnoreCase("POST") && hReq.getContentType().equals("text/xml")){
            // 1. Create XML doc from input         
           DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
           DocumentBuilder documentBuilder = factory.newDocumentBuilder();
           Document doc = documentBuilder.parse(hReq.getInputStream());
            // 2. Do your stuff with the Doc e.g. use doc.getDocumentElement()));

            //response.setContentType("text/xml");
            PrintWriter out = response.getWriter();
              out.println("TEST RESPONSE SUCCESS");

        } else {
            HttpServletResponse hResponse = (HttpServletResponse) response;
            // Only HTTP POST is supported
            hResponse.sendError(500, "Unsupported");
        }
    } catch (Exception e) {
       // logger.fatal(e,e);
        throw new ServletException(e);
    }
    
}
*/
