package lk.okidoki.services;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lk.okidoki.modal.Role;
import lk.okidoki.modal.User;
import lk.okidoki.repository.UserRepository;

@Service
public class UserServiceDeatils implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{

        System.out.println(username);

        User extUser = userRepository.getByUsername(username);

        Set<GrantedAuthority> authority = new HashSet<>();
        for(Role userRole : extUser.getRoles()){
            authority.add(new SimpleGrantedAuthority(userRole.getName()));
        }

        return new org.springframework.security.core.userdetails.User(extUser.getUsername(),extUser.getPassword(),extUser.getStatus(),true,true,true,authority);
    }
}
