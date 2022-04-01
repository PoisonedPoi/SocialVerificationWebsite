
import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;
import java.util.*;

public class CheckerServlet extends HttpServlet {

@Override
public void service(ServletRequest request, ServletResponse response)
        throws ServletException, IOException {
    try{
        HttpServletRequest hReq = (HttpServletRequest) request;
        if (hReq.getMethod().equalsIgnoreCase("POST") && hReq.getContentType().equals("text/xml")){
            // 1. Create XML doc from input         
            logger.debug("1. create XML content from input test test test ee");
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
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
        logger.fatal(e,e);
        throw new ServletException(e);
    }
}