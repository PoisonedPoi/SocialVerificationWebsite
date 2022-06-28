package edu.hci.SocialVerificationWebsite.violationParser;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/ViolationParser")
public class ViolationParserController {

    @Autowired
    ViolationParserService violationParserService;

	@GetMapping()
	public String getViolationParser() {
		return "Got the violation parser";
	}

    @RequestMapping(
        value = "",
        method = RequestMethod.POST,
        produces = "text/xml; charset=utf-8"
    )
	public String postViolationParser(@RequestBody String clientXML) throws Exception {

		try{
            // Convert client xml to string
            String modelXMLString = violationParserService.parseXMLToString(clientXML);

            // Return violations
            return violationParserService.getViolations(modelXMLString);

		 } catch(Exception e) {
            return e.toString();
		}
	}
}
