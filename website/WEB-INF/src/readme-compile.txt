renember to compile these classes once this is deployed on tomcat,

Command:
(note, perform this while in tomcats root directory)

javac -cp lib/servlet-api.jar webapps/SocialVerificationWebsite/WEB-INF/src/CheckerServlet.java -d webapps/SocialVerificationWebsite/WEB-INF/classes/


Serverlet not compiled
<body>
	<h1>HTTP Status 500 – Internal Server Error</h1>
	<hr class="line" />
	<p><b>Type</b> Exception Report</p>
	<p><b>Message</b> Error instantiating servlet class [CheckerServlet]</p>
	<p><b>Description</b> The server encountered an unexpected condition that prevented it from fulfilling the request.

Server let not compiled, tested, then compiled
404 error

serverlet comppiled then tested
works
