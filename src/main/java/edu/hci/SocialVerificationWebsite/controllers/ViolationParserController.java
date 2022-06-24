package edu.hci.SocialVerificationWebsite;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ViolationParser")
public class ViolationParserController {

	@GetMapping()
	public String getViolationParser() {
		return "Got the violation parser";
	}

}
