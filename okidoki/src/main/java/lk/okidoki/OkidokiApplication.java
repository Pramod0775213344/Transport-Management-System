package lk.okidoki;

import lk.okidoki.modal.User;
import lk.okidoki.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;

@SpringBootApplication

@RestController
public class OkidokiApplication {

	@Autowired
	private UserRepository userRepository;

	@Autowired// auto generate instance
	private BCryptPasswordEncoder bCryptPasswordEncoder;

	public static void main(String[] args) {
		SpringApplication.run(OkidokiApplication.class, args);
		System.out.println("");
		System.out.println("-------------------------------------It's Working----------------------------------------------");
		System.out.println("");

	}

	// Request mapping for load index ui (url -->/index)
	@RequestMapping(value = "/index")
	public ModelAndView indexPage() {
		ModelAndView indexUi = new ModelAndView();
		indexUi.setViewName("index.html");
		return indexUi;
	}

	@GetMapping(value = "/website")
	public ModelAndView website() {
		ModelAndView websiteUi = new ModelAndView();
		websiteUi.setViewName("webSite.html");
		return websiteUi;
	}
	// get login ui (url -->/forgetpassword)
	@RequestMapping(value = "/forgetpassword")
	public ModelAndView getForgetPasswordUi() {

		ModelAndView forgetPasswordUi = new ModelAndView();
		forgetPasswordUi.setViewName("forgetPassword.html");
		return forgetPasswordUi;
	}

	//check user existing and send the otp
	@PutMapping(value = "/forgetpassword/email")
	public String checkUserAndSendOtpToTerminal(@RequestBody User user) {

		if (user != null) {
			// Check karanwa user innawada kiyala database eke
			User existingUser = userRepository.getByEmail(user.getEmail());
//            existing user null name return msg ekak danawa
			if (existingUser == null) {
				return "User not found with email: " + user.getEmail();
			}
			try{
				// create one time otp using 4 digits
				String otp = String.valueOf((int) (Math.random() * 9000) + 1000);
				System.out.println("User Otp is " + otp);
				existingUser.setOtp(otp);

				userRepository.save(existingUser);
				//terminal eke load karanawa
//                return karanawa ok massage eka
				return "ok";

			} catch (Exception e) {

				return "Unsuccessful:OTP not generated" + e.getMessage();
			}

		} else {
			return "Invalid user data provided.";
		}
	}

//	check otp form database
	@PutMapping(value = "/forgetpassword/checkotp")
	public String checkOtp(@RequestBody User user){

//		user null da kiyala blanawa
		if (user != null){

			User existUser = userRepository.getUserByOtp(user.getOtp());
//			existing user null naththan ok massage eka retutn karanwa
			if (existUser != null ){

                return "ok";

			}else{
				return "Entered Otp is incorrect";
			}

		}else{
			return "User Not Found";
		}

	}

	@PutMapping(value = "/forgetpassword/update")
	public String updatePassword(@RequestBody User user){

//		exit userwa balanawa otp eken
		User existUser = userRepository.getUserByOtp(user.getOtp());
		if (existUser !=null){

                //password eka encrypt karala submit karanawa
			existUser.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));

			// save updated data
			userRepository.save(existUser);

			return "ok";
		}else{
			return "userNot Found";
		}
	}

}
