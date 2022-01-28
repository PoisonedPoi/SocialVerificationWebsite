import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;
import java.util.*;

public class CheckerServlet extends HttpServlet {

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
        PrintWriter out = response.getWriter();
        out.println("TEST RESPONSE SUCCESS");
    }
}