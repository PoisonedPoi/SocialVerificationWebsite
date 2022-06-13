#compile the servlet and move it into the proper folder in the WEB-INF (web.xml should be updated if adding a new servlet)
#make sure java has been configured properly

#Note, this is meant to be called by .sh files in parent dir

#compile the servlet, add any new servlets to this list as needed

javac -cp servlet-api.jar ViolationParser.java -d ../website/WEB-INF/classes/

#javac -classpath ${TOMCAT}/lib/servlet-api.jar ViolationParser.java -d ../website/WEB-INF/classes/
