package lk.okidoki.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

// Me file eke Configuration liyanna blaporoththu wena nisa aniwaren mema anotation eka use karanna oni
@Configuration
// web app ekak build karana nisa web security aniwaren enable karanna oni
@EnableWebSecurity
public class WebConfiguration {

    // me anotation eka use karanne object hadanna
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> {
            auth
                    // url eke thiyena link block karanne me widihata
                    .requestMatchers("/bootstrap/**").permitAll()
                    .requestMatchers("/css/**").permitAll()
                    .requestMatchers("/fontawesome-free-6.7.2-web/**").permitAll()
                    .requestMatchers("/website").permitAll()
                    .requestMatchers("/video/**").permitAll()
                    .requestMatchers("/images/**").permitAll()
                    .requestMatchers("/websiteImages/**").permitAll()
                    .requestMatchers("/js/webSite.js").permitAll()
                    .requestMatchers("/js/forgetPassword.js").permitAll()
                    .requestMatchers("/report/**").permitAll()
                    .requestMatchers("/jquery/**").permitAll()
                    .requestMatchers("/commenjs/**").permitAll()
                    .requestMatchers("/sweetalert2/**").permitAll()
                    .requestMatchers("/login").permitAll()
                    .requestMatchers("/forgetpassword/**").permitAll()
                    .requestMatchers("/administration").permitAll()
                    .requestMatchers("/createadmin").permitAll()
                    .requestMatchers("/dashboard").hasAnyAuthority("Manager", "Supervisor", "Coordinator", "Admin")
                    .requestMatchers("/user").hasAnyAuthority("Manager", "Supervisor", "Admin")
                    .requestMatchers("/privilage/**").hasAnyAuthority("Manager", "Admin")
                    .requestMatchers("/customer/**").hasAnyAuthority("Coordinator","Manager", "Admin")
                    .requestMatchers("/supplier/**").hasAnyAuthority("Manager", "Admin","Coordinator")
                    .requestMatchers("/driver/**").hasAnyAuthority("Manager", "Admin","Coordinator")
                    .requestMatchers("/vehicle/**").hasAnyAuthority("Manager", "Admin","Coordinator")
                    .requestMatchers("/customeragreement/**").hasAnyAuthority("Manager", "Admin")
                    .requestMatchers("/supplieragreement/**").hasAnyAuthority("Manager", "Admin")
                    .requestMatchers("/supplieragreementapprove/**").hasAnyAuthority("Manager", "Admin")
                    .requestMatchers("/customeragreementapprove/**").hasAnyAuthority("Manager", "Admin")
                    .requestMatchers("/vehicleassigning/**").hasAnyAuthority("Coordinator","Manager", "Admin")
                    .requestMatchers("/booking/**").hasAnyAuthority("Coordinator","Manager", "Admin")
                    .requestMatchers("/customerpayment/**").hasAnyAuthority("Manager","Supervisor", "Admin")
                    .requestMatchers("/supplierpayment/**").hasAnyAuthority("Manager","Supervisor", "Admin")
                    .requestMatchers("/location/**").hasAnyAuthority("Manager", "Admin")
                    .requestMatchers("/package/**").hasAnyAuthority("Manager", "Admin")
                    .requestMatchers("/vehiclegroup/**").hasAnyAuthority("Manager", "Admin")
                    .requestMatchers("/userprofile/**").permitAll()
                    .requestMatchers("/employee/**").hasAnyAuthority("Manager", "Supervisor", "Admin").anyRequest()
                    .authenticated();

        })

                // login details
                .formLogin(login -> {
                    login
                            // loginpage eka request kranw
                            .loginPage("/login")
                            // username password ok nam dashboard eka view karawanawa
                            .defaultSuccessUrl("/dashboard", true)
                            // security purpose nisa error ekak awoth error eka thiyenne mokeda nokiya
                            // usernamepassword kiylaa error eka display karanwa
                            .failureUrl("/login?error=usernamepassworderror")
                            .usernameParameter("username")
                            .passwordParameter("password");
                })

                // logout deatils
                .logout(logout -> {
                    logout
                            // logout url eka
                            .logoutUrl("/logout")
                            // logout eka hariyata wuna nam login page eka aye view karanawa
                            .logoutSuccessUrl("/login");
                })

                // error ekak awoth error page eka view karanawa(acces nathi module ekakata
                // acces nathi kenek yanna haduwoth)
                .exceptionHandling(exp -> {
                    exp.accessDeniedPage("/errorpage");
                })
                
                // js file acces karanna oni nisa csrf eka disable karanna oni
                .csrf(csrf -> {
                    csrf.disable();
                });

        return http.build();
    }

    // me anotation eka use karanne object hadanna
    @Bean
    // meken password eka encrypt karanna puluwan.but decrpyt karanna ba(one way)
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
