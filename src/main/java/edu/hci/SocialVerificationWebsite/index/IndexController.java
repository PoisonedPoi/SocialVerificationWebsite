package edu.hci.SocialVerificationWebsite;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.stereotype.Controller;

@Controller
public class IndexController {

	@GetMapping("/index")
	public String index() {
		return "index";
	}

}
